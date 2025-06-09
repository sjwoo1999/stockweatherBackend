// src/main-rest.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  process.env.MODE = 'REST'; // 👈 모드 강제 지정

  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  const config = new DocumentBuilder()
    .setTitle('StockWeather Backend API')
    .setDescription('The StockWeather Backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 8080;

  await app.listen(port);
  logger.log(`🚀 REST API server running on port ${port}`);
}

bootstrap();