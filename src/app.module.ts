// stockweather-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 필요한 엔티티들을 임포트합니다.
// 예시: User 엔티티가 있다면 아래와 같이 임포트합니다.
import { User } from './users/user.entity';
// 다른 엔티티들이 있다면 여기에 추가해주세요. 예: import { Stock } from './stock/stock.entity';

// 애플리케이션의 다른 모듈들을 임포트합니다.
// UsersModule의 파일명과 클래스명에 맞춰 'UsersModule'로 임포트합니다.
import { UsersModule } from './users/users.module'; // ⭐ './users/user.module' -> './users/users.module'로 수정된 부분 확인
// 다른 모듈들이 있다면 여기에 추가해주세요. 예: import { AuthModule } from './auth/auth.module';
// import { StockModule } from './stock/stock.module';
// import { EventsModule } from './events/events.module';


@Module({
  imports: [
    // 환경 변수 설정을 위한 ConfigModule을 전역으로 설정합니다.
    ConfigModule.forRoot({
      isGlobal: true, // ConfigService를 앱 전체에서 주입하여 사용 가능하게 합니다.
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development', // 환경별 .env 파일 지정 (옵션)
      ignoreEnvFile: process.env.NODE_ENV === 'production', // 프로덕션에서는 환경 파일 무시 (배포 환경 변수 사용)
    }),

    // TypeORM 데이터베이스 연결을 위한 TypeOrmModule 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // useFactory에서 ConfigService를 사용하기 위해 ConfigModule을 임포트합니다.
      useFactory: async (configService: ConfigService) => {
        // 환경 변수에서 DB_SSL_ENABLED 값을 가져와 boolean으로 변환합니다.
        const dbSslEnabledConfig = configService.get<string>('DB_SSL_ENABLED', 'false');
        const sslEnabled = dbSslEnabledConfig === 'true';

        // 데이터베이스 연결 설정을 콘솔에 출력하여 디버깅을 돕습니다.
        console.log('--- TypeOrmModule.forRootAsync DB Config ---');
        console.log('DB_HOST:', configService.get<string>('DB_HOST'));
        console.log('DB_PORT:', configService.get<number>('DB_PORT'));
        console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
        console.log('DB_DATABASE:', configService.get<string>('DB_DATABASE'));
        console.log('DB_PASSWORD loaded:', !!configService.get<string>('DB_PASSWORD')); // 비밀번호 존재 여부만 표시
        console.log('DB_PASSWORD length:', configService.get<string>('DB_PASSWORD')?.length);
        console.log('DB_SSL_ENABLED:', sslEnabled);
        console.log('DB_SYNCHRONIZE:', configService.get<boolean>('DB_SYNCHRONIZE', false));
        console.log('DB_LOGGING:', configService.get<boolean>('DB_LOGGING', false));
        console.log('CLOUD_SQL_CONNECTION_NAME:', configService.get<string>('CLOUD_SQL_CONNECTION_NAME'));
        console.log('-------------------------------------------');

        return {
          type: 'postgres', // 데이터베이스 타입 (PostgreSQL)
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          // 엔티티 파일 경로를 지정합니다. 모든 *.entity.ts 또는 *.entity.js 파일을 스캔합니다.
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // 개발 환경에서만 synchronize를 true로 설정하는 것이 좋습니다.
          // synchronize: true는 데이터베이스 스키마를 자동으로 동기화하지만, 프로덕션에서는 위험할 수 있습니다.
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
          // SQL 쿼리 로깅 설정 (개발 시 유용, 프로덕션에서는 성능 저하 가능성)
          logging: configService.get<boolean>('DB_LOGGING', false),
          // SSL 연결 설정
          ssl: sslEnabled ? {
            // 프로덕션 환경에서 rejectUnauthorized: false는 보안상 위험할 수 있습니다.
            // 실제 배포 시에는 CA 인증서를 통해 유효성 검사를 하는 것이 좋습니다.
            rejectUnauthorized: false,
          } : false,
          extra: {
            // Cloud SQL Proxy를 사용하는 경우, socketPath를 설정합니다.
            // CLOUD_SQL_CONNECTION_NAME 환경 변수가 설정되어 있으면 Unix 소켓 경로를 사용합니다.
            socketPath: configService.get<string>('CLOUD_SQL_CONNECTION_NAME') ?
                        `/cloudsql/${configService.get<string>('CLOUD_SQL_CONNECTION_NAME')}` : undefined,
          },
        };
      },
      inject: [ConfigService], // useFactory 함수에 ConfigService를 주입받도록 명시합니다.
      // DataSource 인스턴스를 생성하고 초기화하는 팩토리 함수입니다.
      // 여기에 데이터베이스 연결 재시도 로직을 포함하여 애플리케이션 시작의 견고성을 높입니다.
      // ⭐ dataSourceFactory의 options 매개변수 타입을 명시적으로 지정하여 TS2345 오류 해결 ⭐
      dataSourceFactory: async (options: import('typeorm').DataSourceOptions) => {
        const { DataSource } = await import('typeorm'); // 동적 임포트로 순환 의존성 문제 방지
        const dataSource = new DataSource(options); // 이제 options는 DataSourceOptions 타입으로 간주되어 에러가 발생하지 않습니다.

        const maxRetries = 50; // 최대 재시도 횟수
        let retries = maxRetries;
        const delay = 5000; // 재시도 간격 (5초)

        console.log('Attempting to connect to the database via TypeOrmModule.dataSourceFactory...');

        while (retries > 0) {
          try {
            await dataSource.initialize();
            console.log('Database connected successfully within TypeOrmModule.dataSourceFactory!');
            return dataSource; // 연결 성공 시 DataSource 인스턴스 반환
          } catch (error) {
            retries--;
            console.warn(`Failed to connect to DB (TypeOrmModule.dataSourceFactory). Retrying in ${delay / 1000} seconds... Retries left: ${retries}. Error: ${error.message}`);
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, delay)); // 지정된 시간만큼 대기
            }
          }
        }
        // 모든 재시도 소진 후에도 연결 실패 시
        console.error('Failed to connect to the database after multiple retries within TypeOrmModule.dataSourceFactory. Exiting application.');
        // 애플리케이션을 종료하여 Cloud Run 등이 새 인스턴스를 시작하게 합니다.
        process.exit(1);
      },
    }),

    // 여기에 다른 모듈들을 추가합니다.
    UsersModule, // ⭐ UserModule -> UsersModule로 변경된 부분 다시 확인
    // AuthModule, // Auth 모듈이 있다면 주석 해제하여 사용
    // StockModule, // Stock 모듈이 있다면 주석 해제하여 사용
    // EventsModule, // Events 모듈이 있다면 주석 해제하여 사용
  ],
  controllers: [], // 컨트롤러는 각 기능 모듈에 정의합니다.
  providers: [],   // 프로바이더는 각 기능 모듈 또는 전역 서비스로 정의합니다.
})
export class AppModule {}