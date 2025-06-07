// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import { Logger, ValidationPipe } from '@nestjs/common'; // ValidationPipe 추가
import { ExpressAdapter } from '@nestjs/platform-express'; // ExpressAdapter 추가
import * as express from 'express'; // express 모듈 추가
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // Swagger 관련 추가

// Cloud Functions용으로 Express 앱을 export하기 위해 추가
const expressApp = express();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  // PORT 환경 변수는 Cloud Run에서 자동으로 주입되므로,
  // Cloud Functions 모드에서는 사용되지 않지만, Cloud Run 모드에서는 필요합니다.
  const port = process.env.PORT || 8080;

  logger.log(`Current MODE: ${process.env.MODE || 'undefined'}`); // 현재 MODE 로깅

  // NestJS 애플리케이션 인스턴스를 생성합니다.
  // Cloud Functions 모드에서는 ExpressAdapter를 사용합니다.
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  // 전역 프리픽스 설정: 모든 API 엔드포인트 앞에 'api'를 붙입니다.
  // Controller에 이미 '/api'가 붙어 있다면 중복될 수 있으니 확인 후 설정
  // 현재 stock.controller.ts에 @Controller('api')가 있으므로, 여기는 비워두는 것이 좋습니다.
  // 아니면 StockController에서 @Controller('')로 바꾸고 여기에서 'api'를 설정합니다.
  // 일단 기존 방식대로 StockController에 'api'가 붙는다고 가정하고 여기는 제거합니다.
  // app.setGlobalPrefix('api'); // ⭐ 이 줄을 제거하거나, StockController에서 @Controller('api')를 @Controller('')로 변경해야 합니다.

  // 전역 유효성 검사 파이프 추가 (모든 API 요청에 적용)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // DTO에 정의되지 않은 속성 자동 제거
    forbidNonWhitelisted: true, // DTO에 정의되지 않은 속성이 있으면 오류 발생
    transform: true, // DTO 타입으로 자동 변환 (예: URL 파라미터나 쿼리 문자열을 숫자 등으로 자동 변환)
  }));

  // CORS (Cross-Origin Resource Sharing) 설정
  app.enableCors({
    // Origin은 환경 변수 FRONTEND_URL 또는 로컬 개발 주소를 사용
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // cookie-parser 미들웨어 추가
  app.use(cookieParser());

  // WebSocket Adapter 등록: WebSocket 모드일 때만 활성화
  // Cloud Functions는 WebSocket을 지원하지 않으므로, 이 부분은 MODE가 'WS'일 때만 적용되도록 합니다.
  if (process.env.MODE === 'WS') {
    app.useWebSocketAdapter(new IoAdapter(app));
    logger.log('WebSocket Adapter enabled.');
  } else {
    logger.log('WebSocket Adapter skipped (not in WS mode).');
  }

  // Swagger (API 문서) 설정 - 개발 환경에서만 활성화 또는 REST 모드에서만 활성화
  if (process.env.NODE_ENV === 'development' || process.env.MODE === 'REST') { // REST API용으로만 Swagger 설정
    const config = new DocumentBuilder()
      .setTitle('StockWeather Backend API')
      .setDescription('The StockWeather Backend API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document); // Swagger UI 경로를 'api-docs'로 설정 (기존 'api'와 충돌 방지)
    logger.log('Swagger UI enabled at /api-docs');
  }


  // Cloud Functions와 Cloud Run 모드 분기
  if (process.env.MODE === 'REST') {
    // Cloud Functions 모드: Express 앱을 직접 export하고 NestJS 앱을 초기화만 합니다.
    await app.init(); // NestJS 앱 초기화 (listen 대신)
    logger.log('NestJS application initialized for Cloud Functions (REST API mode).');
  } else {
    // Cloud Run (또는 로컬 개발) 모드: 포트 리스닝
    await app.listen(port);
    logger.log(`Application is running on: ${await app.getUrl()} (WebSocket/Full Service mode).`);
    logger.log('Application is fully initialized and listening for requests.');
  }
}

// bootstrap 함수를 호출하여 애플리케이션을 시작합니다.
// Cloud Functions 환경에서는 이 main.ts 파일이 실행될 때 bootstrap이 호출되고,
// exports.app에 Express 인스턴스가 할당됩니다.
// Cloud Run 환경에서는 단순히 bootstrap이 호출되어 listen합니다.
bootstrap();

// Cloud Functions를 위한 Express 앱 export (NestJS가 부트스트랩될 때 초기화된 expressApp 인스턴스)
// Cloud Functions의 엔트리 포인트(entry-point)로 지정될 함수입니다.
export const app = expressApp;
// 중요: Cloud Functions는 이 'app' 객체를 HTTP 요청 핸들러로 사용합니다.
// 따라서 NestFactory.create(AppModule, new ExpressAdapter(expressApp)) 부분에서
// expressApp을 인자로 넘겨주어 NestJS가 이 Express 인스턴스에 라우트를 등록하도록 해야 합니다.