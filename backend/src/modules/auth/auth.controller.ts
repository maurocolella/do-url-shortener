import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Req, 
  Res
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { RateLimit } from '../../common/decorators/rate-limit.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  @UseGuards(RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 5 }) // Stricter limit: 5 requests per minute
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 5 }) // Stricter limit: 5 requests per minute
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'), RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 10 }) // 10 requests per minute
  googleAuth() {
    // This route initiates the Google OAuth flow
    // The actual logic is handled by the GoogleStrategy
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
     
    const { accessToken } = await this.authService.googleLogin(req.user);
    
    const frontendUrl = this.configService.get<string>('frontend.url');
    
    // Redirect to frontend with token
    return res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }
}
