// src/bootstrap-rest.ts

import { createApp } from './bootstrap-app';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeDatabase } from './utils/database';
import * as express from 'express';
import { Logger } from '@nestjs/common'; // 추가

const expressApp = express();

async function bootstrap() {
  const logger = new Logger('Bootstrap'); // 추가
  const app = await createApp(expressApp);

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('StockWeather Backend API')
    .setDescription('The StockWeather Backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT || 8080);
  logger.log(`🚀 REST API server running on port ${process.env.PORT || 8080}`);

  // DB Init
  await initializeDatabase(app, logger); // logger 추가
}

bootstrap();

export default expressApp; // Cloud Functions entry-point
