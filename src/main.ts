// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Cloud Functions용으로 Express 앱을 export하기 위해 추가
const expressApp = express();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 8080;
  const mode = process.env.MODE || 'REST';

  logger.log(`Current MODE: ${mode}`);
  logger.log(`Listening on PORT: ${port}`);

  // NestJS App 생성
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Global Pipes 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 쿠키 파서
  app.use(cookieParser());

  // Swagger 설정 (REST 모드 또는 개발 환경에서만 노출)
  if (process.env.NODE_ENV === 'development' || mode === 'REST') {
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

  // 🚀 WebSocket 모드
  if (mode === 'WS') {
    // HTTP 서버 래핑
    const httpServer = createServer(app.getHttpAdapter().getInstance());

    // Socket.IO 서버 설정
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      logger.log(`WebSocket client connected: ${socket.id}`);

      socket.on('message', (msg) => {
        logger.log(`Received message: ${msg}`);
        socket.emit('message', `Echo: ${msg}`);
      });

      socket.on('disconnect', () => {
        logger.log(`WebSocket client disconnected: ${socket.id}`);
      });
    });

    // WebSocket 서버 listen → 여기 initializeDatabase() 제거!
    httpServer.listen(port, () => {
      logger.log(`🚀 WebSocket server is running on port ${port}`);
      // WebSocket 모드에서는 TypeORM이 자동 초기화되므로 따로 호출 X
    });

  } else {
    // 🚀 REST API 서버 listen
    await app.listen(port);
    logger.log(`🚀 REST API server is running on port ${port}`);

    // REST 모드에서는 initializeDatabase 호출 (정상)
    await initializeDatabase(app, logger);
  }
}

async function initializeDatabase(app, logger: Logger) {
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
        logger.warn(`❌ Failed to connect to DB. Retrying in ${delay / 1000}s... Retries left: ${retries}. Error: ${error.message}`);
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

bootstrap();

export const app = expressApp;
