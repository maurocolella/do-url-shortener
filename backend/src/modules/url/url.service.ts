import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UrlEntity } from './entities/url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { RedisService } from '../redis/redis.service';
import { Base62Util } from '../../common/utils/base62.util';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(UrlEntity)
    private urlRepository: Repository<UrlEntity>,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async create(createUrlDto: CreateUrlDto, user?: UserEntity): Promise<UrlEntity> {
    const { originalUrl, customSlug } = createUrlDto;
    
    // Generate or use custom slug
    let slug: string;
    if (customSlug) {
      // Check if custom slug is already taken
      const existingUrl = await this.urlRepository.findOne({ where: { slug: customSlug } });
      if (existingUrl) {
        throw new ConflictException(`Slug '${customSlug}' is already in use`);
      }
      slug = customSlug;
    } else {
      slug = await this.generateUniqueSlug();
    }
    
    // Create the URL entity
    const url = this.urlRepository.create({
      slug,
      originalUrl,
      userId: user?.id,
    });
    
    // Save to database
    const savedUrl = await this.urlRepository.save(url);
    
    // Cache the URL mapping
    await this.cacheUrl(slug, originalUrl);
    
    return savedUrl;
  }

  async findAll(userId?: string): Promise<UrlEntity[]> {
    const queryBuilder = this.urlRepository.createQueryBuilder('url');
    
    if (userId) {
      queryBuilder.where('url.userId = :userId', { userId });
    }
    
    return queryBuilder.orderBy('url.createdAt', 'DESC').getMany();
  }

  async findOne(id: string, userId?: string): Promise<UrlEntity> {
    const queryBuilder = this.urlRepository.createQueryBuilder('url')
      .where('url.id = :id', { id });
    
    if (userId) {
      queryBuilder.andWhere('url.userId = :userId', { userId });
    }
    
    const url = await queryBuilder.getOne();
    
    if (!url) {
      throw new NotFoundException(`URL with ID ${id} not found`);
    }
    
    return url;
  }

  async findBySlug(slug: string): Promise<UrlEntity> {
    const url = await this.urlRepository.findOne({ where: { slug } });
    
    if (!url) {
      throw new NotFoundException(`URL with slug '${slug}' not found`);
    }
    
    return url;
  }

  async update(id: string, updateUrlDto: UpdateUrlDto, userId?: string): Promise<UrlEntity> {
    const url = await this.findOne(id, userId);
    
    if (updateUrlDto.slug && updateUrlDto.slug !== url.slug) {
      // Check if new slug is already taken
      const existingUrl = await this.urlRepository.findOne({ where: { slug: updateUrlDto.slug } });
      if (existingUrl) {
        throw new ConflictException(`Slug '${updateUrlDto.slug}' is already in use`);
      }
      
      // Remove old cached URL
      await this.redisService.del(`url:${url.slug}`);
      
      // Update slug
      url.slug = updateUrlDto.slug;
      
      // Cache new URL mapping
      await this.cacheUrl(url.slug, url.originalUrl);
    }
    
    return this.urlRepository.save(url);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const url = await this.findOne(id, userId);
    
    // Remove cached URL
    await this.redisService.del(`url:${url.slug}`);
    
    await this.urlRepository.remove(url);
  }

  async resolveUrl(slug: string): Promise<string> {
    // Try to get URL from cache first
    const cachedUrl = await this.redisService.get(`url:${slug}`);
    
    if (cachedUrl) {
      // Increment visit count in the background
      this.incrementVisits(slug).catch(err => console.error('Failed to increment visits:', err));
      return cachedUrl;
    }
    
    // If not in cache, get from database
    const url = await this.findBySlug(slug);
    
    // Cache the URL for future requests
    await this.cacheUrl(slug, url.originalUrl);
    
    // Increment visit count
    await this.incrementVisits(slug);
    
    return url.originalUrl;
  }

  private async incrementVisits(slug: string): Promise<void> {
    await this.urlRepository.increment({ slug }, 'visits', 1);
  }

  private async generateUniqueSlug(): Promise<string> {
    const slugLength = this.configService.get<number>('url.slugLength') || 6;
    let slug = '';
    let isUnique = false;
    
    // Try to generate a unique slug
    while (!isUnique) {
      slug = Base62Util.generateRandom(slugLength);
      
      // Check if slug exists in cache
      const existsInCache = await this.redisService.exists(`url:${slug}`);
      if (existsInCache) {
        continue;
      }
      
      // Check if slug exists in database
      const existingUrl = await this.urlRepository.findOne({ where: { slug } });
      if (!existingUrl) {
        isUnique = true;
      }
    }
    
    return slug;
  }

  private async cacheUrl(slug: string, originalUrl: string): Promise<void> {
    // Cache URL for 24 hours (86400 seconds)
    await this.redisService.set(`url:${slug}`, originalUrl, 86400);
  }
}
