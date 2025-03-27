import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEntity } from './entities/url.entity';
import { AliasEntity } from './entities/alias.entity';
import { CanonicalUrlEntity } from './entities/canonical-url.entity';
import { UrlService } from './url.service';
import { UrlController } from './url.controller';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([UrlEntity, AliasEntity, CanonicalUrlEntity]),
    RedisModule,
    ConfigModule,
  ],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
