// src/bootstrap-rest.ts

import { createApp } from './bootstrap-app';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeDatabase } from './utils/database';
import * as express from 'express';
import { Logger } from '@nestjs/common';
import * as functions from '@google-cloud/functions-framework';  // ✅ 추가

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

  await initializeDatabase(app, logger);

  // ❌ listen 제거 (Cloud Functions는 listen 호출 금지)
})();

// 👉 functions-framework 등록 (함수명 = stockweatherRestApi)
functions.http('stockweatherRestApi', expressApp);
