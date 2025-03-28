import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

interface IJwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-jwt-secret',
    });
  }

  async validate(payload: IJwtPayload) {
    try {
      const { sub: id } = payload;
      const user = await this.userService.findById(id);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return user;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
