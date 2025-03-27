import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
config();

// Create a new ConfigService instance
const configService = new ConfigService();

// DataSource configuration
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get<string>('DB_HOST') || 'postgres',
  port: configService.get<number>('DB_PORT') || 5432,
  username: configService.get<string>('DB_USERNAME') || 'postgres',
  password: configService.get<string>('DB_PASSWORD') || 'postgres',
  database: configService.get<string>('DB_NAME') || 'url_shortener',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  synchronize: false, // Important: set to false for production and migration-driven development
  logging: configService.get<string>('NODE_ENV') !== 'production',
};

// Create and export a new DataSource instance
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
