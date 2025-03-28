/**
 * Database Setup Script
 * 
 * This script is used for demonstration purposes to automatically set up the database
 * when the application is first run. In a production environment, you would typically
 * use a more robust migration strategy with proper versioning and deployment processes.
 */

import { DataSource } from 'typeorm';
import dataSource from '../config/typeorm.config';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseSetup');

async function checkDatabaseConnection(ds: DataSource): Promise<boolean> {
  try {
    // Try to connect to the database
    await ds.initialize();
    logger.log('Successfully connected to the database');
    return true;
  } catch (error) {
    logger.error(`Failed to connect to the database: ${error.message}`);
    return false;
  }
}

async function checkIfTablesExist(ds: DataSource): Promise<boolean> {
  try {
    // Check if the users table exists as a proxy for database initialization
    const result = await ds.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      )`
    );
    return result[0].exists;
  } catch (error) {
    logger.error(`Failed to check if tables exist: ${error.message}`);
    return false;
  }
}

async function runMigrations(ds: DataSource): Promise<void> {
  try {
    logger.log('Running database migrations...');
    await ds.runMigrations();
    logger.log('Migrations completed successfully');
  } catch (error) {
    logger.error(`Failed to run migrations: ${error.message}`);
    throw error;
  }
}

async function setupDatabase(): Promise<void> {
  try {
    const connected = await checkDatabaseConnection(dataSource);
    if (!connected) {
      logger.error('Could not connect to the database. Exiting setup.');
      process.exit(1);
    }

    const tablesExist = await checkIfTablesExist(dataSource);
    if (tablesExist) {
      logger.log('Database tables already exist. Skipping migrations.');
    } else {
      logger.log('Database tables do not exist. Running migrations...');
      await runMigrations(dataSource);
    }

    // Close the connection
    await dataSource.destroy();
    logger.log('Database setup completed successfully');
  } catch (error) {
    logger.error(`Database setup failed: ${error.message}`);
    // Ensure the connection is closed even if there's an error
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
