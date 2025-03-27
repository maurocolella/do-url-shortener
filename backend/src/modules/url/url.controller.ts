import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, Query, Res, HttpStatus, NotFoundException, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('urls')
@UseInterceptors(ClassSerializerInterceptor)
export class UrlController {
  constructor(
    private readonly urlService: UrlService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard, RateLimitGuard)
  async create(@Body() createUrlDto: CreateUrlDto, @GetUser() user?: UserEntity) {
    const url = await this.urlService.create(createUrlDto, user);
    
    const domain = this.configService.get<string>('url.domain');
    
    return {
      ...url,
      shortUrl: `${domain}/${url.slug}`,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@GetUser() user: UserEntity) {
    const urls = await this.urlService.findAll(user.id);
    
    const domain = this.configService.get<string>('url.domain');
    
    return urls.map(url => ({
      ...url,
      shortUrl: `${domain}/${url.slug}`,
    }));
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@GetUser() user: UserEntity) {
    const urls = await this.urlService.findAll(user.id);
    
    const totalUrls = urls.length;
    const totalVisits = urls.reduce((sum, url) => sum + url.visits, 0);
    const topUrls = [...urls]
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5)
      .map(url => ({
        id: url.id,
        slug: url.slug,
        originalUrl: url.originalUrl,
        visits: url.visits,
        shortUrl: `${this.configService.get<string>('url.domain')}/${url.slug}`,
      }));
    
    return {
      totalUrls,
      totalVisits,
      topUrls,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @GetUser() user: UserEntity) {
    const url = await this.urlService.findOne(id, user.id);
    
    const domain = this.configService.get<string>('url.domain');
    
    return {
      ...url,
      shortUrl: `${domain}/${url.slug}`,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RateLimitGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @GetUser() user: UserEntity,
  ) {
    const url = await this.urlService.update(id, updateUrlDto, user.id);
    
    const domain = this.configService.get<string>('url.domain');
    
    return {
      ...url,
      shortUrl: `${domain}/${url.slug}`,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @GetUser() user: UserEntity) {
    await this.urlService.remove(id, user.id);
    return { success: true };
  }
}
