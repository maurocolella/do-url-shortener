import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UrlEntity } from './entities/url.entity';
import { AliasEntity } from './entities/alias.entity';
import { CanonicalUrlEntity } from './entities/canonical-url.entity';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { RedisService } from '../redis/redis.service';
import { Base62Util } from '../../common/utils/base62.util';
import { UrlNormalizer } from '../../common/utils/url-normalizer.util';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(UrlEntity)
    private urlRepository: Repository<UrlEntity>,
    @InjectRepository(AliasEntity)
    private aliasRepository: Repository<AliasEntity>,
    @InjectRepository(CanonicalUrlEntity)
    private canonicalUrlRepository: Repository<CanonicalUrlEntity>,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async create(createUrlDto: CreateUrlDto, user?: UserEntity): Promise<UrlEntity> {
    const { originalUrl, customSlug } = createUrlDto;
    
    // Normalize the URL
    const normalizedUrl = UrlNormalizer.normalize(originalUrl);
    
    // Get or create canonical URL
    let canonicalUrl = await this.canonicalUrlRepository.findOne({ 
      where: { canonicalUrl: normalizedUrl } 
    });
    
    if (!canonicalUrl) {
      canonicalUrl = this.canonicalUrlRepository.create({
        canonicalUrl: normalizedUrl
      });
      canonicalUrl = await this.canonicalUrlRepository.save(canonicalUrl);
    }
    
    // Use anonymous user ID if no user provided
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';
    
    // Generate or use custom alias
    let alias: string;
    if (customSlug) {
      // Check if custom slug is already taken
      const existingAlias = await this.aliasRepository.findOne({ where: { alias: customSlug } });
      if (existingAlias) {
        throw new ConflictException(`Alias '${customSlug}' is already in use`);
      }
      alias = customSlug;
    } else {
      alias = await this.generateUniqueAlias(normalizedUrl, userId);
    }
    
    // Create the alias entity
    const aliasEntity = this.aliasRepository.create({
      alias,
      userId,
      canonicalUrl,
    });
    
    // Save to database
    const savedAlias = await this.aliasRepository.save(aliasEntity);
    
    // Cache the URL mapping
    await this.cacheUrl(alias, normalizedUrl);
    
    // For backward compatibility, create a URL entity as well
    const url = this.urlRepository.create({
      slug: alias,
      originalUrl: normalizedUrl,
      userId,
    });
    
    const savedUrl = await this.urlRepository.save(url);
    
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
      
      // Also check in aliases table
      const existingAlias = await this.aliasRepository.findOne({ where: { alias: updateUrlDto.slug } });
      if (existingAlias) {
        throw new ConflictException(`Alias '${updateUrlDto.slug}' is already in use`);
      }
      
      // Remove old cached URL
      await this.redisService.del(`url:${url.slug}`);
      
      // Update slug
      url.slug = updateUrlDto.slug;
      
      // Update alias in aliases table
      const alias = await this.aliasRepository.findOne({ where: { alias: url.slug } });
      if (alias) {
        alias.alias = updateUrlDto.slug;
        await this.aliasRepository.save(alias);
      }
      
      // Cache new URL mapping
      await this.cacheUrl(url.slug, url.originalUrl);
    }
    
    return this.urlRepository.save(url);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const url = await this.findOne(id, userId);
    
    // Remove cached URL
    await this.redisService.del(`url:${url.slug}`);
    
    // Remove alias
    const alias = await this.aliasRepository.findOne({ where: { alias: url.slug } });
    if (alias) {
      await this.aliasRepository.remove(alias);
    }
    
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
    
    // If not in cache, try to get from aliases table first
    try {
      const alias = await this.aliasRepository.findOne({ 
        where: { alias: slug },
        relations: ['canonicalUrl']
      });
      
      if (alias) {
        // Cache the URL for future requests
        await this.cacheUrl(slug, alias.canonicalUrl.canonicalUrl);
        
        // Increment visit count
        await this.incrementVisits(slug);
        
        return alias.canonicalUrl.canonicalUrl;
      }
    } catch (error) {
      console.error('Error finding alias:', error);
    }
    
    // If not found in aliases, fall back to the old urls table
    const url = await this.findBySlug(slug);
    
    // Cache the URL for future requests
    await this.cacheUrl(slug, url.originalUrl);
    
    // Increment visit count
    await this.incrementVisits(slug);
    
    return url.originalUrl;
  }

  private async incrementVisits(slug: string): Promise<void> {
    // Increment in urls table
    await this.urlRepository.increment({ slug }, 'visits', 1);
    
    // Also increment in aliases table
    await this.aliasRepository.increment({ alias: slug }, 'visits', 1);
  }

  private async generateUniqueAlias(normalizedUrl: string, userId: string): Promise<string> {
    // Generate a namespaced hash based on URL and user ID
    const hash = UrlNormalizer.generateNamespacedHash(normalizedUrl, userId);
    
    // Convert hash to Base62
    const slugLength = this.configService.get<number>('url.slugLength') || 6;
    const baseAlias = Base62Util.encode(parseInt(hash.substring(0, 10)));
    
    // Ensure the alias is the right length
    let alias = baseAlias.substring(0, slugLength);
    if (alias.length < slugLength) {
      alias = alias.padEnd(slugLength, '0');
    }
    
    // Check if alias exists
    const existingAlias = await this.aliasRepository.findOne({ where: { alias } });
    if (existingAlias) {
      // If collision occurs, add a random suffix
      let isUnique = false;
      let uniqueAlias = '';
      
      while (!isUnique) {
        // Generate a random suffix
        const suffix = Base62Util.generateRandom(2);
        uniqueAlias = alias.substring(0, slugLength - 2) + suffix;
        
        // Check if unique
        const exists = await this.aliasRepository.findOne({ where: { alias: uniqueAlias } });
        if (!exists) {
          isUnique = true;
        }
      }
      
      return uniqueAlias;
    }
    
    return alias;
  }

  private async cacheUrl(slug: string, originalUrl: string): Promise<void> {
    // Cache URL for 24 hours (86400 seconds)
    await this.redisService.set(`url:${slug}`, originalUrl, 86400);
  }
}
