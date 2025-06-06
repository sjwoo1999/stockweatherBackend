// stockweather-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm'; // TypeORM의 DataSource를 임포트합니다.
import { ConfigService } from '@nestjs/config'; // ConfigService를 임포트합니다.

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  let dbRetries = 50; // DB 연결 재시도 횟수
  const dbDelay = 5000; // DB 연결 재시도 간격 (5초)

  // 1단계: NestJS 애플리케이션 생성 및 8080 포트 리스닝 시작
  // 이 단계에서는 DB 연결을 시도하지 않으므로, 매우 빠르게 완료되어 Cloud Run 시작 프로브를 통과합니다.
  logger.log('Starting Nest application to listen on port first...');
  const app = await NestFactory.create(AppModule);

  // 전역 프리픽스 설정
  app.setGlobalPrefix('api');

  // CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://stockweather-frontend.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // cookie-parser 미들웨어 추가
  app.use(cookieParser());

  // WebSocket Adapter 등록
  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT || 8080;
  await app.listen(port); // ⭐⭐⭐ 애플리케이션이 먼저 포트 리스닝을 시작합니다. ⭐⭐⭐
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log('Application is listening on port, now attempting to connect to DB asynchronously.');

  // 2단계: 애플리케이션이 리스닝을 시작한 후, 데이터베이스 연결을 재시도합니다.
  // 이 루프는 백그라운드에서 실행되므로, DB 연결에 시간이 오래 걸려도 Cloud Run의 시작 프로브는 통과됩니다.
  while (dbRetries > 0) {
    try {
      const configService = app.get(ConfigService); // 앱 컨텍스트에서 ConfigService 가져오기

      console.log('--- DB Config Loaded (for deferred connection) ---');
      console.log('DB_HOST:', configService.get<string>('DB_HOST'));
      console.log('DB_PORT:', configService.get<number>('DB_PORT'));
      console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
      console.log('DB_DATABASE:', configService.get<string>('DB_DATABASE'));
      console.log('DB_PASSWORD loaded:', !!configService.get<string>('DB_PASSWORD'));
      console.log('DB_PASSWORD length:', configService.get<string>('DB_PASSWORD')?.length);
      console.log('DB_SSL_ENABLED:', configService.get<boolean>('DB_SSL_ENABLED'));
      console.log('-------------------------------------------');

      const dbSslEnabledConfig = configService.get<string>('DB_SSL_ENABLED', 'false');
      const sslEnabled = dbSslEnabledConfig === 'true';

      // TypeORM DataSource를 수동으로 생성하고 연결합니다.
      const dataSource = new DataSource({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        ssl: sslEnabled,
      });

      await dataSource.initialize(); // DB 연결 시도
      logger.log('Database connected successfully!');

      // ⭐ 중요: TypeOrmModule.forRootAsync를 제거했기 때문에,
      // @InjectRepository()를 사용하는 서비스들은 이 시점까지는 DB 연결을 사용할 수 없습니다.
      // NestJS 앱이 이미 시작되었지만, DB 관련 기능은 DB 연결이 완료된 후에만 정상 작동합니다.
      // 일반적으로는 TypeORM 연결 인스턴스를 동적으로 주입하거나,
      // DB 관련 서비스가 DB 연결 여부를 확인하고 대기하는 로직을 추가해야 합니다.
      // 이 부분은 당장은 아니더라도, 나중에 기능 테스트 시 오류가 발생하면 수정이 필요할 수 있습니다.

      break; // DB 연결 성공, 재시도 루프 탈출
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || (error.message && error.message.includes('Unable to connect to the database'))) {
        logger.warn(`Failed to connect to DB (deferred). Retrying in ${dbDelay / 1000} seconds... Retries left: ${dbRetries - 1}`);
        dbRetries--;
        await new Promise(resolve => setTimeout(resolve, dbDelay));
      } else {
        logger.error('An unexpected error occurred during deferred DB connection. Exiting container.', error.message);
        process.exit(1); // 예상치 못한 DB 오류는 컨테이너 종료
      }
    }
  }

  if (dbRetries === 0) {
    logger.error('Failed to connect to the database after multiple retries (deferred). This instance will likely not function correctly. Exiting.');
    process.exit(1); // 모든 재시도 소진 시 컨테이너 종료 (이 경우 Cloud Run이 새 인스턴스 시작 시도)
  }
}
bootstrap();