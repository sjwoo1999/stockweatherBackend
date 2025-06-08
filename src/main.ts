import express from 'express';
import { createApp } from './bootstrap-app';
import { initializeDatabase } from './utils/database';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

const expressApp = express();

async function bootstrap() {
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

  await app.listen(process.env.PORT || 8080);
  logger.log(`🚀 REST API server running on port ${process.env.PORT || 8080}`);

  await initializeDatabase(app, logger);
}

bootstrap();

// Cloud Functions entry-point
export default expressApp;
