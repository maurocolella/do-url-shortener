import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const key = `rate-limit:${ip}`;
    
    const ttl = this.configService.get<number>('rateLimiting.ttl') || 60;
    const limit = this.configService.get<number>('rateLimiting.limit') || 10;
    
    const client = this.redisService.getClient();
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, ttl);
    }
    
    if (current > limit) {
      throw new HttpException(
        'Too many requests, please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    // Add rate limit headers to response
    const response = context.switchToHttp().getResponse();
    response.header('X-RateLimit-Limit', limit);
    response.header('X-RateLimit-Remaining', Math.max(0, limit - current));
    
    const ttlRemaining = await client.ttl(key);
    response.header('X-RateLimit-Reset', ttlRemaining);
    
    return true;
  }
}
