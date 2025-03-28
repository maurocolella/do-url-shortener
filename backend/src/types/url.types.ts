/**
 * Interface for URL entity
 */
export interface IUrl {
  id: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  visits: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for URL creation DTO
 */
export interface ICreateUrlDto {
  originalUrl: string;
  customSlug?: string;
}

/**
 * Interface for URL update DTO
 */
export interface IUpdateUrlDto {
  slug?: string;
}

/**
 * Interface for URL statistics
 */
export interface IUrlStats {
  totalUrls: number;
  totalVisits: number;
  topUrls: IUrl[];
}
