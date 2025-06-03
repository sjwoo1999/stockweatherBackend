// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io'; // Socket.IO 어댑터 임포트

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 프리픽스 설정 (선택 사항, 필요하다면)
  // app.setGlobalPrefix('api'); // 예를 들어, 모든 API 엔드포인트 앞에 '/api'를 붙임

  // CORS (Cross-Origin Resource Sharing) 설정
  // 프론트엔드(Next.js)가 실행되는 3001번 포트에서 요청을 허용하도록 설정
  app.enableCors({
    origin: 'http://localhost:3001', // ⭐ 프론트엔드 개발 서버의 주소
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 허용할 HTTP 메서드
    credentials: true, // 자격 증명(쿠키, 인증 헤더)을 주고받도록 허용
  });

  // WebSocket Adapter 등록
  // 이 어댑터는 app.listen()에 설정된 포트(3000번)를 사용하여 웹소켓 연결을 처리합니다.
  // 이 코드는 enableCors() 다음에, app.listen() 이전에 위치해야 합니다.
  app.useWebSocketAdapter(new IoAdapter(app));

  // NestJS 애플리케이션 (HTTP 서버 및 WebSocket 서버)이 3000번 포트에서 리스닝하도록 설정
  await app.listen(3000); // ⭐ 백엔드 서버가 리스닝할 포트
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();