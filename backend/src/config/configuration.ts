export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'url_shortener',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  
  // Directly expose environment variables
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-for-development-only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  
  url: {
    domain: process.env.URL_DOMAIN || 'http://localhost:3000',
    slugLength: parseInt(process.env.SLUG_LENGTH || '6', 10),
  },
  
  rateLimiting: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10), // seconds
    limit: parseInt(process.env.RATE_LIMIT_MAX || '10', 10), // requests per TTL
  },
  
  debug: process.env.NODE_ENV !== 'production',
});
