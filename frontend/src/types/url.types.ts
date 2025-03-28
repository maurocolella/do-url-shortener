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
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for URL creation payload
 */
export interface ICreateUrlPayload {
  originalUrl: string;
  customSlug?: string;
}

/**
 * Interface for URL update payload
 */
export interface IUpdateUrlPayload {
  id: string;
  slug: string;
}

/**
 * Interface for URL statistics
 */
export interface IUrlStats {
  totalUrls: number;
  totalVisits: number;
  topUrls: IUrl[];
}
