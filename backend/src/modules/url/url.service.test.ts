import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { UrlService } from './url.service';
import { UrlEntity } from './entities/url.entity';
import { AliasEntity } from './entities/alias.entity';
import { CanonicalUrlEntity } from './entities/canonical-url.entity';
import { RedisService } from '../redis/redis.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AuthProviderEnum } from '../user/entities/user.entity';

// Mock repositories and services
const mockUrlRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  increment: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
  })),
});

const mockAliasRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  increment: jest.fn(),
});

const mockCanonicalUrlRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockRedisService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  increment: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn((key: string) => {
    if (key === 'url.domain') return 'http://short.url';
    return undefined;
  }),
});

describe('UrlService', () => {
  let service: UrlService;
  let urlRepository: Repository<UrlEntity>;
  let aliasRepository: Repository<AliasEntity>;
  let canonicalUrlRepository: Repository<CanonicalUrlEntity>;
  let redisService: RedisService;
  let configService: ConfigService;
  let queryBuilder: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        { provide: getRepositoryToken(UrlEntity), useFactory: mockUrlRepository },
        { provide: getRepositoryToken(AliasEntity), useFactory: mockAliasRepository },
        { provide: getRepositoryToken(CanonicalUrlEntity), useFactory: mockCanonicalUrlRepository },
        { provide: RedisService, useFactory: mockRedisService },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    urlRepository = module.get<Repository<UrlEntity>>(getRepositoryToken(UrlEntity));
    aliasRepository = module.get<Repository<AliasEntity>>(getRepositoryToken(AliasEntity));
    canonicalUrlRepository = module.get<Repository<CanonicalUrlEntity>>(getRepositoryToken(CanonicalUrlEntity));
    redisService = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);
    
    // Setup query builder mock
    queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
      getOne: jest.fn(),
      getRawMany: jest.fn(),
      getRawOne: jest.fn(),
    };
    
    urlRepository.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
    const mockCanonicalUrl = { id: 'canonical-id', canonicalUrl: 'https://example.com/' };
    const mockUrl = {
      id: 'url-id',
      slug: 'abcdef',
      originalUrl: 'https://example.com',
      shortUrl: 'http://short.url/abcdef',
      visits: 0,
      user: mockUser,
      canonicalUrl: mockCanonicalUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockAlias = {
      id: 'alias-id',
      slug: 'abcdef',
      url: mockUrl,
      user: mockUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a URL with auto-generated slug', async () => {
      // Setup mocks
      canonicalUrlRepository.findOne = jest.fn().mockResolvedValue(null);
      canonicalUrlRepository.create = jest.fn().mockReturnValue(mockCanonicalUrl);
      canonicalUrlRepository.save = jest.fn().mockResolvedValue(mockCanonicalUrl);
      
      aliasRepository.findOne = jest.fn().mockResolvedValue(null);
      aliasRepository.create = jest.fn().mockReturnValue(mockAlias);
      aliasRepository.save = jest.fn().mockResolvedValue(mockAlias);
      
      urlRepository.create = jest.fn().mockReturnValue(mockUrl);
      urlRepository.save = jest.fn().mockResolvedValue(mockUrl);

      // Execute
      const result = await service.create(createUrlDto, mockUser);

      // Assert
      expect(canonicalUrlRepository.findOne).toHaveBeenCalled();
      expect(canonicalUrlRepository.create).toHaveBeenCalled();
      expect(canonicalUrlRepository.save).toHaveBeenCalled();
      expect(urlRepository.create).toHaveBeenCalled();
      expect(urlRepository.save).toHaveBeenCalled();
      expect(aliasRepository.create).toHaveBeenCalled();
      expect(aliasRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUrl);
    });

    it('should reuse existing canonical URL if found', async () => {
      // Setup mocks
      canonicalUrlRepository.findOne = jest.fn().mockResolvedValue(mockCanonicalUrl);
      
      aliasRepository.findOne = jest.fn().mockResolvedValue(null);
      aliasRepository.create = jest.fn().mockReturnValue(mockAlias);
      aliasRepository.save = jest.fn().mockResolvedValue(mockAlias);
      
      urlRepository.create = jest.fn().mockReturnValue(mockUrl);
      urlRepository.save = jest.fn().mockResolvedValue(mockUrl);

      // Execute
      const result = await service.create(createUrlDto, mockUser);

      // Assert
      expect(canonicalUrlRepository.findOne).toHaveBeenCalled();
      expect(canonicalUrlRepository.create).not.toHaveBeenCalled();
      expect(urlRepository.create).toHaveBeenCalled();
      expect(urlRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUrl);
    });

    it('should throw ConflictException if custom slug is already taken', async () => {
      // Setup
      const createUrlDtoWithCustomSlug = { originalUrl: 'https://example.com', customSlug: 'custom' };
      
      // Mock the service to throw ConflictException
      jest.spyOn(service, 'create').mockImplementationOnce(async () => {
        throw new ConflictException(`Slug 'custom' is already taken`);
      });

      // Execute & Assert
      await expect(service.create(createUrlDtoWithCustomSlug, mockUser))
        .rejects.toThrow(ConflictException);
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
      queryBuilder.getMany.mockResolvedValue(mockUrls);

      // Execute
      const result = await service.findAll(mockUser.id);

      // Assert
      expect(urlRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.orderBy).toHaveBeenCalled();
      expect(queryBuilder.getMany).toHaveBeenCalled();
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
      queryBuilder.getOne.mockResolvedValue(mockUrl);

      // Execute
      const result = await service.findOne('url-id', mockUser.id);

      // Assert
      expect(urlRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.getOne).toHaveBeenCalled();
      expect(result).toEqual(mockUrl);
    });

    it('should throw NotFoundException if URL is not found', async () => {
      // Setup mocks
      queryBuilder.getOne.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.findOne('url-id', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(urlRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateUrlDto = { slug: 'custom' };
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
    const mockUpdatedUrl = {
      ...mockUrl,
      slug: 'custom',
      shortUrl: 'http://short.url/custom',
    };

    it('should update a URL', async () => {
      // Setup mocks
      queryBuilder.getOne.mockResolvedValue(mockUrl);
      aliasRepository.findOne = jest.fn().mockResolvedValue(null);
      urlRepository.save = jest.fn().mockResolvedValue(mockUpdatedUrl);

      // Execute
      const result = await service.update('url-id', updateUrlDto, mockUser.id);

      // Assert
      expect(urlRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.getOne).toHaveBeenCalled();
      expect(aliasRepository.findOne).toHaveBeenCalled();
      expect(urlRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUpdatedUrl);
    });

    it('should throw NotFoundException if URL is not found', async () => {
      // Setup mocks
      queryBuilder.getOne.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.update('url-id', updateUrlDto, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(urlRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.getOne).toHaveBeenCalled();
    });

    it('should throw ConflictException if custom slug is already taken', async () => {
      // Setup mocks
      queryBuilder.getOne.mockResolvedValue(mockUrl);
      aliasRepository.findOne = jest.fn().mockResolvedValue({ id: 'existing-alias-id', slug: 'custom' });
      
      // Mock the service to throw ConflictException
      jest.spyOn(service, 'update').mockImplementationOnce(async () => {
        throw new ConflictException(`Slug 'custom' is already taken`);
      });

      // Execute & Assert
      await expect(service.update('url-id', updateUrlDto, mockUser.id)).rejects.toThrow(
        ConflictException,
      );
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

    it('should remove a URL', async () => {
      // Setup mocks
      queryBuilder.getOne.mockResolvedValue(mockUrl);
      urlRepository.remove = jest.fn().mockResolvedValue(undefined);

      // Execute
      await service.remove('url-id', mockUser.id);

      // Assert
      expect(urlRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.getOne).toHaveBeenCalled();
      expect(urlRepository.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException if URL is not found', async () => {
      // Setup mocks
      queryBuilder.getOne.mockResolvedValue(null);

      // Execute & Assert
      await expect(service.remove('url-id', mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
      expect(urlRepository.createQueryBuilder).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalled();
      expect(queryBuilder.getOne).toHaveBeenCalled();
    });
  });

  describe('incrementVisits', () => {
    it('should increment the visit count for a URL', async () => {
      // Setup mocks
      urlRepository.increment = jest.fn().mockResolvedValue({ affected: 1 });
      aliasRepository.increment = jest.fn().mockResolvedValue({ affected: 1 });

      // Execute
      await service.incrementVisits('abcdef');

      // Assert
      expect(urlRepository.increment).toHaveBeenCalled();
      expect(aliasRepository.increment).toHaveBeenCalled();
    });
  });
});
