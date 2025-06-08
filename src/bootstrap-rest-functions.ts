// src/bootstrap-rest-function.ts

import { createApp } from './bootstrap-app';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { Logger } from '@nestjs/common';
import * as functions from '@google-cloud/functions-framework';

const expressApp = express();

(async () => {
  const logger = new Logger('Bootstrap');
  const app = await createApp(expressApp);

  const config = new DocumentBuilder()
    .setTitle('StockWeather Backend API')
    .setDescription('The StockWeather Backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  logger.log(`🚀 REST API for Cloud Functions ready`);
})();

// 👉 functions-framework 등록 (함수명 = stockweatherRestApi)
functions.http('stockweatherRestApi', expressApp);
