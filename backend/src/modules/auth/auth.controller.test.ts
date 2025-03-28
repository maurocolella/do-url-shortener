import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProviderEnum } from '../user/entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

// Mock AuthService
const mockAuthService = () => ({
  register: jest.fn(),
  login: jest.fn(),
  googleLogin: jest.fn(),
});

// Mock ConfigService
const mockConfigService = () => ({
  get: jest.fn((key: string) => {
    if (key === 'url.frontendUrl') return 'http://localhost:5173';
    return undefined;
  }),
});

// Mock RedisService
const mockRedisService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  increment: jest.fn(),
});

// Mock Response object
const mockResponse = () => {
  const res: any = {};
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useFactory: mockAuthService },
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: RedisService, useFactory: mockRedisService },
        {
          provide: APP_GUARD,
          useClass: RateLimitGuard,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    };

    const mockResult = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        provider: AuthProviderEnum.LOCAL,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      accessToken: 'test-token',
    };

    it('should register a new user', async () => {
      // Setup mocks
      authService.register = jest.fn().mockResolvedValue(mockResult);

      // Execute
      const result = await controller.register(registerDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockResult = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        provider: AuthProviderEnum.LOCAL,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      accessToken: 'test-token',
    };

    it('should login a user', async () => {
      // Setup mocks
      authService.login = jest.fn().mockResolvedValue(mockResult);

      // Execute
      const result = await controller.login(loginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('googleAuth', () => {
    it('should be defined', () => {
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe('googleAuthCallback', () => {
    const mockReq = {
      user: {
        email: 'test@example.com',
        googleId: 'google-id',
        firstName: 'Test',
        lastName: 'User'
      },
    };

    const mockResult = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        provider: AuthProviderEnum.GOOGLE,
        googleId: 'google-id',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      accessToken: 'test-token',
    };

    it('should handle google auth callback and redirect', async () => {
      // Setup mocks
      const res = mockResponse();
      authService.googleLogin = jest.fn().mockResolvedValue(mockResult);
      configService.get = jest.fn().mockReturnValue('http://localhost:5173');

      // Execute
      await controller.googleAuthCallback(mockReq, res);

      // Assert
      expect(authService.googleLogin).toHaveBeenCalledWith(mockReq.user);
      expect(configService.get).toHaveBeenCalledWith('url.frontendUrl');
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:5173/auth/callback?token=test-token',
      );
    });
  });
});
