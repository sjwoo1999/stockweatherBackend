// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common'; // NestJS 로거 임포트

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  let retries = 50; // 최대 재시도 횟수 (예: 50번 * 2초 = 100초까지 대기)
  const delay = 2000; // 각 재시도 간격 (2초)

  // ⭐ DB 연결 재시도 루프 ⭐
  while (retries > 0) {
    try {
      logger.log(`Attempting to start Nest application. Retries left: ${retries}`);
      // NestFactory.create(AppModule)이 TypeORM 연결을 시도하므로,
      // 이 시점에서 DB 연결이 성공해야 다음 단계로 넘어갈 수 있습니다.
      const app = await NestFactory.create(AppModule);

      app.setGlobalPrefix('api');

      app.enableCors({
        origin: [
          'http://localhost:3001',
          'https://stockweather-frontend.vercel.app',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
      });

      app.use(cookieParser());
      app.useWebSocketAdapter(new IoAdapter(app));

      const port = process.env.PORT || 8080;
      await app.listen(port);
      logger.log(`Application is running on: ${await app.getUrl()}`);
      return; // 성공적으로 시작했으면 함수 종료 (루프 탈출)
    } catch (error) {
      // ECONNREFUSED 또는 'Unable to connect to the database' 메시지가 포함된 오류인 경우 재시도
      if (error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Unable to connect to the database'))) {
        logger.warn(`Failed to connect to DB. Retrying in ${delay / 1000} seconds...`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, delay)); // 지정된 지연 시간만큼 대기
      } else {
        // 예상치 못한 다른 오류가 발생하면 즉시 던져서 애플리케이션 종료
        logger.error('An unexpected error occurred during application bootstrap:', error.message);
        throw error;
      }
    }
  }

  // 모든 재시도 횟수를 소진했음에도 연결 실패 시
  logger.error('Failed to connect to the database after multiple retries. Exiting.');
  process.exit(1); // 컨테이너를 비정상 종료하여 Cloud Run이 새 인스턴스를 시작하도록 유도
}
bootstrap();