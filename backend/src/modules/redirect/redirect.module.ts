import { Module } from '@nestjs/common';
import { RedirectController } from './redirect.controller';
import { UrlModule } from '../url/url.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [UrlModule, RedisModule],
  controllers: [RedirectController],
})
export class RedirectModule {}
