// src/utils/database.ts

import { INestApplication, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export async function initializeDatabase(app: INestApplication, logger: Logger) {
  try {
    const dataSource = app.get(DataSource);
    let retries = 50;
    const delay = 5000;

    while (retries > 0) {
      try {
        await dataSource.initialize();
        logger.log('✅ Database connected successfully after app.listen!');
        break;
      } catch (error) {
        retries--;
        logger.warn(
          `❌ Failed to connect to DB. Retrying in ${delay / 1000}s... Retries left: ${retries}. Error: ${error.message}`
        );
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    if (retries === 0) {
      logger.error('❌ Failed to connect to the database after multiple retries. Exiting.');
      process.exit(1);
    }
  } catch (err) {
    logger.error('❌ Unexpected error during DB connection:', err);
    process.exit(1);
  }
}
