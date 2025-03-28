import { IsString, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { UrlNormalizer } from '../../../common/utils/url-normalizer.util';

export class CreateUrlDto {
  @IsString()
  @Transform(({ value }) => {
    // Normalize the URL before validation
    return UrlNormalizer.normalize(value);
  })
  originalUrl: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Custom slug can only contain letters, numbers, underscores, and hyphens',
  })
  customSlug?: string;
}
