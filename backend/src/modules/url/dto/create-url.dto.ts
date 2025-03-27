import { IsUrl, IsOptional, IsString, Matches } from 'class-validator';

export class CreateUrlDto {
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['http', 'https'],
  })
  originalUrl: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Custom slug can only contain letters, numbers, underscores, and hyphens',
  })
  customSlug?: string;
}
