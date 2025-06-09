import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import * as cors from 'cors';

(async () => {
  const logger = new Logger('Bootstrap');

  const expressApp = express();

  // ✅ Express CORS middleware (반드시 가장 먼저)
  expressApp.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));

  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    cors: false, // Nest 내부 CORS disable
    logger: console,
  });

  const config = new DocumentBuilder()
    .setTitle('StockWeather Backend API')
    .setDescription('The StockWeather Backend API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  logger.log(`🚀 REST API for Cloud Run ready`);

  const port = process.env.PORT || 8080;
  await app.init();
  await app.listen(port);

  logger.log(`✅ Listening on port ${port}`);
})();
