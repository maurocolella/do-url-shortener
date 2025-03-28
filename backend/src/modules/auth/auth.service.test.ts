import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthProviderEnum } from '../user/entities/user.entity';

// Mock UserService
const mockUserService = () => ({
  findByEmail: jest.fn(),
  findByGoogleId: jest.fn(),
  createLocalUser: jest.fn(),
  createGoogleUser: jest.fn(),
  validatePassword: jest.fn(),
});

// Mock JwtService
const mockJwtService = () => ({
  sign: jest.fn(() => 'test-token'),
});

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useFactory: mockUserService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      provider: AuthProviderEnum.LOCAL,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should register a new user and return user with token', async () => {
      // Setup mocks
      userService.findByEmail = jest.fn().mockResolvedValue(null);
      userService.createLocalUser = jest.fn().mockResolvedValue(mockUser);
      jwtService.sign = jest.fn().mockReturnValue('test-token');

      // Execute
      const result = await service.register(registerDto);

      // Assert
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(userService.createLocalUser).toHaveBeenCalledWith(
        registerDto.email,
        registerDto.password,
        registerDto.firstName,
        registerDto.lastName,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'test-token',
      });
    });

    it('should throw ConflictException if email is already in use', async () => {
      // Setup mocks
      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);

      // Execute & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDto.email);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      provider: AuthProviderEnum.LOCAL,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should login a user and return user with token', async () => {
      // Setup mocks
      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      userService.validatePassword = jest.fn().mockResolvedValue(true);
      jwtService.sign = jest.fn().mockReturnValue('test-token');

      // Execute
      const result = await service.login(loginDto);

      // Assert
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(userService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        loginDto.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'test-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Setup mocks
      userService.findByEmail = jest.fn().mockResolvedValue(null);

      // Execute & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if user is not using local auth', async () => {
      // Setup mocks
      const googleUser = {
        ...mockUser,
        provider: AuthProviderEnum.GOOGLE,
      };
      userService.findByEmail = jest.fn().mockResolvedValue(googleUser);

      // Execute & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Setup mocks
      userService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      userService.validatePassword = jest.fn().mockResolvedValue(false);

      // Execute & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(userService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        loginDto.password,
      );
    });
  });

  describe('googleLogin', () => {
    const googleUser = {
      email: 'test@example.com',
      googleId: 'google-id',
      firstName: 'Test',
      lastName: 'User',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      provider: AuthProviderEnum.GOOGLE,
      googleId: 'google-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should throw UnauthorizedException if googleUser is null', async () => {
      // Execute & Assert
      await expect(service.googleLogin(null)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return existing user if found by googleId', async () => {
      // Setup mocks
      userService.findByGoogleId = jest.fn().mockResolvedValue(mockUser);
      jwtService.sign = jest.fn().mockReturnValue('test-token');

      // Execute
      const result = await service.googleLogin(googleUser);

      // Assert
      expect(userService.findByGoogleId).toHaveBeenCalledWith(googleUser.googleId);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'test-token',
      });
    });

    it('should throw ConflictException if email exists with different provider', async () => {
      // Setup mocks
      const localUser = {
        ...mockUser,
        provider: AuthProviderEnum.LOCAL,
      };
      userService.findByGoogleId = jest.fn().mockResolvedValue(null);
      userService.findByEmail = jest.fn().mockResolvedValue(localUser);

      // Execute & Assert
      await expect(service.googleLogin(googleUser)).rejects.toThrow(
        ConflictException,
      );
      expect(userService.findByGoogleId).toHaveBeenCalledWith(googleUser.googleId);
      expect(userService.findByEmail).toHaveBeenCalledWith(googleUser.email);
    });

    it('should create new user if not found by googleId or email', async () => {
      // Setup mocks
      userService.findByGoogleId = jest.fn().mockResolvedValue(null);
      userService.findByEmail = jest.fn().mockResolvedValue(null);
      userService.createGoogleUser = jest.fn().mockResolvedValue(mockUser);
      jwtService.sign = jest.fn().mockReturnValue('test-token');

      // Execute
      const result = await service.googleLogin(googleUser);

      // Assert
      expect(userService.findByGoogleId).toHaveBeenCalledWith(googleUser.googleId);
      expect(userService.findByEmail).toHaveBeenCalledWith(googleUser.email);
      expect(userService.createGoogleUser).toHaveBeenCalledWith(
        googleUser.email,
        googleUser.googleId,
        googleUser.firstName,
        googleUser.lastName,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: 'test-token',
      });
    });
  });
});
