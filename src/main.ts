// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io'; // Socket.IO 어댑터 임포트
import * as cookieParser from 'cookie-parser'; // ⭐ cookieParser 임포트 추가

async function bootstrap() {
  // ⭐ Cloud SQL Proxy가 시작될 시간을 주기 위한 지연 (테스트용)
  // 이 부분은 NestFactory.create(AppModule) 호출 전에 위치해야 합니다.
  console.log('Waiting 5 seconds for Cloud SQL Proxy to start...');
  await new Promise(resolve => setTimeout(resolve, 5000)); // 5초 대기
  console.log('Done waiting. Attempting to connect to DB.');

  const app = await NestFactory.create(AppModule);

  // 전역 프리픽스 설정 (선택 사항, 필요하다면)
  app.setGlobalPrefix('api'); // 예를 들어, 모든 API 엔드포인트 앞에 '/api'를 붙임

  // ⭐ CORS (Cross-Origin Resource Sharing) 설정 수정 ⭐
  // 프론트엔드(Next.js)가 실행되는 주소에서 요청을 허용하도록 설정
  app.enableCors({
    origin: [
      'http://localhost:3001', // ⭐ 프론트엔드 로컬 개발 서버의 주소
      'https://stockweather-frontend.vercel.app', // ⭐ Vercel에 배포된 프론트엔드 도메인
      // 필요한 경우 다른 프론트엔드 도메인 추가
    ],
    // ⭐ 허용할 HTTP 메서드에 'OPTIONS' 추가 ⭐
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // 자격 증명(쿠키, 인증 헤더)을 주고받도록 허용
  });

  // ⭐ cookie-parser 미들웨어 추가 ⭐
  app.use(cookieParser());

  // WebSocket Adapter 등록
  // 이 어댑터는 app.listen()에 설정된 포트(3000번)를 사용하여 웹소켓 연결을 처리합니다.
  // 이 코드는 enableCors() 다음에, app.listen() 이전에 위치해야 합니다.
  app.useWebSocketAdapter(new IoAdapter(app));

  // NestJS 애플리케이션 (HTTP 서버 및 WebSocket 서버)이 3000번 포트에서 리스닝하도록 설정
  // 배포 환경에서는 process.env.PORT를 사용하도록 고려할 수 있습니다.
  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();