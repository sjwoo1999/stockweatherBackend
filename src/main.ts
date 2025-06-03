// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('NestApplication');

  // WebSocket 어댑터 설정 (이전과 동일)
  app.useWebSocketAdapter(new IoAdapter(app));

  // CORS 설정 (프론트엔드와 통신을 위해 필요)
  app.enableCors({
    // ✨ 이 부분을 프론트엔드 URL에 맞게 수정합니다. ✨
    // 현재 프론트엔드가 'http://localhost:3001'에서 실행되므로 이를 허용해야 합니다.
    origin: 'http://localhost:3001', // 이전 'http://localhost:3000'에서 변경
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000; // 백엔드 서버가 3000번 포트에서 실행될 것입니다.
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();