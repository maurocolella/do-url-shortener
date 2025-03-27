import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProviderEnum } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Create new user
    const user = await this.userService.createLocalUser(email, password, firstName, lastName);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is using local auth
    if (user.provider !== AuthProviderEnum.LOCAL) {
      throw new UnauthorizedException(`Please sign in with ${user.provider}`);
    }

    // Validate password
    const isPasswordValid = await this.userService.validatePassword(user, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  async googleLogin(googleUser: any) {
    if (!googleUser) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const { email, googleId, firstName, lastName } = googleUser;

    // Check if user exists by googleId
    let user = await this.userService.findByGoogleId(googleId);

    // If not found by googleId, check by email
    if (!user) {
      user = await this.userService.findByEmail(email);

      // If user exists with email but different provider, throw error
      if (user && user.provider !== AuthProviderEnum.GOOGLE) {
        throw new ConflictException(`Email already in use with ${user.provider} provider`);
      }

      // If user doesn't exist, create new user
      if (!user) {
        user = await this.userService.createGoogleUser(email, googleId, firstName, lastName);
      }
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }
}
