import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { NotFoundException } from '@nestjs/common';
import { AuthProviderEnum } from '../user/entities/user.entity';
import { UpdateUrlDto } from './dto/update-url.dto';
import { RedisService } from '../redis/redis.service';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { ConfigService } from '@nestjs/config';

// Mock UrlService
const mockUrlService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

// Mock RedisService
const mockRedisService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  increment: jest.fn(),
});

// Mock ConfigService
const mockConfigService = () => ({
  get: jest.fn((key: string) => {
    if (key === 'url.domain') return 'http://short.url';
    return undefined;
  }),
});

describe('UrlController', () => {
  let controller: UrlController;
  let urlService: UrlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        { provide: UrlService, useFactory: mockUrlService },
        { provide: RedisService, useFactory: mockRedisService },
        { provide: ConfigService, useFactory: mockConfigService },
        {
          provide: APP_GUARD,
          useClass: RateLimitGuard,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    urlService = module.get<UrlService>(UrlService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUrlDto = { originalUrl: 'https://example.com' };
    const mockUser = { 
      id: 'user-id', 
      email: 'test@example.com',
      provider: AuthProviderEnum.LOCAL,
      urls: [],
      aliases: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const mockUrl = {
      id: 'url-id',
      slug: 'abcdef',
      originalUrl: 'https://example.com',
      shortUrl: 'http://short.url/abcdef',
      visits: 0,
      user: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new URL', async () => {
      // Setup mocks
      urlService.create = jest.fn().mockResolvedValue(mockUrl);

      // Execute
      const result = await controller.create(createUrlDto, mockUser);

      // Assert
      expect(urlService.create).toHaveBeenCalledWith(createUrlDto, mockUser);
      expect(result).toEqual(mockUrl);
    });
  });

  describe('findAll', () => {
    const mockUser = { 
      id: 'user-id', 
      email: 'test@example.com',
      provider: AuthProviderEnum.LOCAL,
      urls: [],
      aliases: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const mockUrls = [
      {
        id: 'url-id-1',
        slug: 'abcdef',
        originalUrl: 'https://example1.com',
        shortUrl: 'http://short.url/abcdef',
        visits: 5,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'url-id-2',
        slug: 'ghijkl',
        originalUrl: 'https://example2.com',
        shortUrl: 'http://short.url/ghijkl',
        visits: 10,
        user: mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all URLs for a user', async () => {
      // Setup mocks
      urlService.findAll = jest.fn().mockResolvedValue(mockUrls);

      // Execute
      const result = await controller.findAll(mockUser);

      // Assert
      expect(urlService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUrls);
    });
  });

  describe('findOne', () => {
    const mockUser = { 
      id: 'user-id', 
      email: 'test@example.com',
      provider: AuthProviderEnum.LOCAL,
      urls: [],
      aliases: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const mockUrl = {
      id: 'url-id',
      slug: 'abcdef',
      originalUrl: 'https://example.com',
      shortUrl: 'http://short.url/abcdef',
      visits: 5,
      user: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return a URL by ID', async () => {
      // Setup mocks
      urlService.findOne = jest.fn().mockResolvedValue(mockUrl);

      // Execute
      const result = await controller.findOne('url-id', mockUser);

      // Assert
      expect(urlService.findOne).toHaveBeenCalledWith('url-id', mockUser.id);
      expect(result).toEqual(mockUrl);
    });

    it('should throw NotFoundException if URL is not found', async () => {
      // Setup mocks
      urlService.findOne = jest.fn().mockRejectedValue(new NotFoundException());

      // Execute & Assert
      await expect(controller.findOne('url-id', mockUser))
        .rejects.toThrow(NotFoundException);
      expect(urlService.findOne).toHaveBeenCalledWith('url-id', mockUser.id);
    });
  });

  describe('update', () => {
    const updateUrlDto: UpdateUrlDto = { slug: 'custom' };
    const mockUser = { 
      id: 'user-id', 
      email: 'test@example.com',
      provider: AuthProviderEnum.LOCAL,
      urls: [],
      aliases: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const mockUpdatedUrl = {
      id: 'url-id',
      slug: 'custom',
      originalUrl: 'https://example.com',
      shortUrl: 'http://short.url/custom',
      visits: 5,
      user: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update a URL', async () => {
      // Setup mocks
      urlService.update = jest.fn().mockResolvedValue(mockUpdatedUrl);

      // Execute
      const result = await controller.update('url-id', updateUrlDto, mockUser);

      // Assert
      expect(urlService.update).toHaveBeenCalledWith('url-id', updateUrlDto, mockUser.id);
      expect(result).toEqual(mockUpdatedUrl);
    });
  });

  describe('remove', () => {
    const mockUser = { 
      id: 'user-id', 
      email: 'test@example.com',
      provider: AuthProviderEnum.LOCAL,
      urls: [],
      aliases: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should remove a URL', async () => {
      // Setup mocks
      urlService.remove = jest.fn().mockResolvedValue(undefined);

      // Execute
      await controller.remove('url-id', mockUser);

      // Assert
      expect(urlService.remove).toHaveBeenCalledWith('url-id', mockUser.id);
    });
  });
});
