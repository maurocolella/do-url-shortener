import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUrlDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Custom slug can only contain letters, numbers, underscores, and hyphens',
  })
  slug?: string;
}
