import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import * as functions from '@google-cloud/functions-framework';

const expressApp = express();

(async () => {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('StockWeather Backend API')
    .setDescription('The StockWeather Backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.init();

  logger.log(`🚀 REST API for Cloud Functions ready`);

  // 👉 반드시 Nest app의 express 인스턴스를 사용해야 함
  const nestExpress = app.getHttpAdapter().getInstance();

  // 👉 Cloud Functions 등록
  functions.http('stockweatherRestApi', nestExpress);
})();
