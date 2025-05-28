// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config'; // <-- 추가

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService); // <-- 추가

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3001', 'https://your-frontend-domain.com'], // 프론트엔드 도메인. 개발 중에는 3001(React 기본) 또는 8080(Vue 기본) 등 프론트 포트를 사용하고, 배포 시 실제 프론트엔드 도메인으로 변경합니다.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 쿠키/인증 헤더 전송 허용
  });

  const port = configService.get<number>('PORT') || 3000; // .env의 PORT 사용
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();