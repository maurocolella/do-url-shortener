import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import * as process from 'process';
import { DataSource } from 'typeorm';
import dataSource from './config/typeorm.config';

/**
 * Check if the database is initialized and run migrations if needed
 * Note: This is for demonstration purposes only. In a production environment,
 * you would typically use a more robust migration strategy.
 */
async function setupDatabase(ds: DataSource): Promise<void> {
  const logger = new Logger('DatabaseSetup');
  
  try {
    // Initialize the data source
    if (!ds.isInitialized) {
      await ds.initialize();
    }
    
    // Check if the users table exists as a proxy for database initialization
    const result = await ds.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    );
    
    const tablesExist = result[0].exists;
    
    if (!tablesExist) {
      logger.log('Database tables do not exist. Running migrations...');
      await ds.runMigrations();
      logger.log('Migrations completed successfully');
    } else {
      logger.log('Database is already initialized');
    }
  } catch (error) {
    logger.error(`Database setup failed: ${error.message}`);
    throw error;
  }
}

async function bootstrap() {
  // Set up the database before starting the application
  try {
    await setupDatabase(dataSource);
  } catch {
    console.error('Failed to set up the database. Exiting application.');
    process.exit(1);
  }
  
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  const port = process.env.PORT || 3000;
  const logger = new Logger('Bootstrap');
  
  try {
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch {
    logger.error('Failed to start the application');
    process.exit(1);
  }
}

bootstrap();
