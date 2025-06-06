// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
// DataSource와 ConfigService는 이제 AppModule에서 TypeOrmModule.forRootAsync를 통해 처리하므로
// main.ts에서 직접 임포트하거나 사용할 필요가 없습니다.

async function bootstrap() {
  const logger = new Logger('Bootstrap'); // 애플리케이션 로깅을 위한 로거 인스턴스 생성
  const port = process.env.PORT || 8080; // 환경 변수 PORT가 없으면 기본값 8080 사용

  // NestJS 애플리케이션 인스턴스를 생성합니다.
  // 이 시점에 AppModule의 초기화 과정이 시작되고, 그 과정에서 TypeOrmModule이 데이터베이스 연결을 시도합니다.
  logger.log('Starting Nest application and initializing database connection...');
  const app = await NestFactory.create(AppModule);

  // 전역 프리픽스 설정: 모든 API 엔드포인트 앞에 'api'를 붙입니다.
  app.setGlobalPrefix('api');

  // CORS (Cross-Origin Resource Sharing) 설정
  // 프론트엔드 애플리케이션의 도메인(origin)을 허용하여 교차 출처 요청을 가능하게 합니다.
  app.enableCors({
    origin: [
      'http://localhost:3001', // 로컬 개발 환경 프론트엔드
      'https://stockweather-frontend.vercel.app', // Vercel 배포된 프론트엔드
      // 추가적인 프론트엔드 도메인이 있다면 여기에 추가합니다.
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // 허용할 HTTP 메서드
    credentials: true, // 자격 증명 (쿠키, HTTP 인증)을 포함한 요청 허용
  });

  // cookie-parser 미들웨어 추가: HTTP 요청에서 쿠키를 파싱합니다.
  app.use(cookieParser());

  // WebSocket Adapter 등록: Socket.IO를 사용하여 WebSocket 기능을 활성화합니다.
  // 실시간 통신이 필요한 경우에 사용됩니다.
  app.useWebSocketAdapter(new IoAdapter(app));

  // NestJS 애플리케이션이 지정된 포트에서 들어오는 요청을 수신 대기하도록 합니다.
  // 이 호출은 TypeOrmModule의 데이터베이스 연결이 성공한 후에만 실행됩니다.
  // 만약 TypeOrmModule에서 데이터베이스 연결에 실패하여 process.exit(1)이 호출되면,
  // 이 listen() 메서드는 실행되지 않고 애플리케이션은 시작에 실패합니다.
  await app.listen(port);

  // 애플리케이션이 성공적으로 시작되고 포트에서 리스닝 중임을 로깅합니다.
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log('Application is fully initialized and listening for requests.');
}

// bootstrap 함수를 호출하여 애플리케이션을 시작합니다.
bootstrap();