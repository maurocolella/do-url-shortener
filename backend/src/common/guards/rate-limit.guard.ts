import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../modules/redis/redis.service';
import { Reflector } from '@nestjs/core';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get custom rate limit options if available
    const rateLimitOptions = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    // Use user ID if authenticated, otherwise use IP
    let identifier: string;
    if (request.user && request.user.id) {
      identifier = `user:${request.user.id}`;
    } else {
      identifier = `ip:${request.ip}`;
    }
    
    const path = request.route.path;
    const key = `rate-limit:${path}:${identifier}`;
    
    // Use custom options if available, otherwise use defaults from config
    const ttl = rateLimitOptions?.ttl || this.configService.get<number>('rateLimiting.ttl') || 60;
    const limit = rateLimitOptions?.limit || this.configService.get<number>('rateLimiting.limit') || 10;
    
    const client = this.redisService.getClient();
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, ttl);
    }
    
    // Add rate limit headers to response
    response.header('X-RateLimit-Limit', limit);
    response.header('X-RateLimit-Remaining', Math.max(0, limit - current));
    
    const ttlRemaining = await client.ttl(key);
    response.header('X-RateLimit-Reset', ttlRemaining);
    
    if (current > limit) {
      response.header('Retry-After', ttlRemaining);
      throw new HttpException(
        'Too many requests, please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    return true;
  }
}
