// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  /**
   * 🚨 수정된 부분: Cloud Functions 2nd Gen (REST) 모드에서도 반드시 app.listen(port) 호출 필요
   * → Cloud Functions 2nd Gen 은 Cloud Run 기반으로 동작하며 반드시 PORT 리스닝 필요
   */
  if (process.env.MODE === 'REST' || process.env.MODE === 'WS') {
    await app.listen(port);
    logger.log(`Application is running in ${process.env.MODE} mode on PORT ${port}`);
  } else {
    // fallback: 혹시 다른 MODE가 들어올 경우 대비
    await app.listen(port);
    logger.log(`Application is running on PORT ${port} (default fallback)`);
  }
}

bootstrap();

export const app = expressApp;
