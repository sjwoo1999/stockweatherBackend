// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
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

  const configService = app.get(ConfigService);

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

    // WebSocket 서버 listen
    httpServer.listen(port, () => {
      logger.log(`🚀 WebSocket server is running on port ${port}`);
      // WebSocket 모드에서는 TypeORM 자동 초기화 (initializeDatabase 필요 없음)
    });

  } else {
    // REST API 서버 listen
    await app.listen(port);
    logger.log(`🚀 REST API server is running on port ${port}`);

    // REST 모드에서는 initializeDatabase 호출
    await initializeDatabase(app, configService, logger);
  }
}

async function initializeDatabase(app, configService: ConfigService, logger: Logger) {
  const dbSslEnabledConfig = configService.get<string>('DB_SSL_ENABLED', 'false');
  const sslEnabled = dbSslEnabledConfig === 'true';

  const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
    logging: configService.get<boolean>('DB_LOGGING', false),
    ssl: sslEnabled
      ? {
          rejectUnauthorized: false,
        }
      : false,
    extra: {
      socketPath: configService.get<string>('CLOUD_SQL_CONNECTION_NAME')
        ? `/cloudsql/${configService.get<string>('CLOUD_SQL_CONNECTION_NAME')}`
        : undefined,
    },
  };

  console.log('--- DataSourceOptions (initializeDatabase) ---');
  console.log('DB_HOST:', dataSourceOptions.host);
  console.log('DB_PORT:', dataSourceOptions.port);
  console.log('DB_USERNAME:', dataSourceOptions.username);
  console.log('DB_DATABASE:', dataSourceOptions.database);
  console.log('DB_SSL_ENABLED:', sslEnabled);
  console.log('---------------------------------------------');

  const dataSource = new DataSource(dataSourceOptions);

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
}

bootstrap();

// Cloud Functions entry-point export (default export)
export default expressApp;
