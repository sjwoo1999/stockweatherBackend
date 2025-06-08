// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm'; // 🚨 추가됨

// Cloud Functions용으로 Express 앱을 export하기 위해 추가
const expressApp = express();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 8080;

  logger.log(`Current MODE: ${process.env.MODE || 'undefined'}`);
  logger.log(`Listening on PORT: ${port}`);

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser());

  if (process.env.MODE === 'WS') {
    app.useWebSocketAdapter(new IoAdapter(app));
    logger.log('WebSocket Adapter enabled.');
  } else {
    logger.log('WebSocket Adapter skipped (not in WS mode).');
  }

  if (process.env.NODE_ENV === 'development' || process.env.MODE === 'REST') {
    const config = new DocumentBuilder()
      .setTitle('StockWeather Backend API')
      .setDescription('The StockWeather Backend API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
    logger.log('Swagger UI enabled at /api-docs');
  }

  // 🚨 반드시 PORT 먼저 listen → Healthcheck 성공
  await app.listen(port);
  logger.log(`Application is running in ${process.env.MODE} mode on PORT ${port}`);

  // 🚨 DB 연결은 listen 후에 수행 (retry 포함)
  try {
    const dataSource = app.get(DataSource);
    let retries = 50;
    const delay = 5000;
    while (retries > 0) {
      try {
        await dataSource.initialize();
        logger.log('Database connected successfully after app.listen!');
        break;
      } catch (error) {
        retries--;
        logger.warn(`Failed to connect to DB. Retrying in ${delay / 1000}s... Retries left: ${retries}. Error: ${error.message}`);
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    if (retries === 0) {
      logger.error('Failed to connect to the database after multiple retries. Exiting.');
      process.exit(1);
    }
  } catch (err) {
    logger.error('Unexpected error during DB connection:', err);
    process.exit(1);
  }
}

bootstrap();

export const app = expressApp;
