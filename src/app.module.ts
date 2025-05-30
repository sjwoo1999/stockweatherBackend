// stockweather-backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigService 임포트 확인
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // NODE_ENV가 'production'이면 .env.prod를, 그 외의 경우 (개발 환경)에는 .env.local을 읽습니다.
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // 디버깅을 위해 로드되는 DB 정보를 콘솔에 출력합니다.
        console.log('--- DB Config Loaded (from app.module.ts) ---');
        console.log('DB_HOST:', configService.get<string>('DB_HOST'));
        console.log('DB_PORT:', configService.get<number>('DB_PORT'));
        console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
        console.log('DB_DATABASE:', configService.get<string>('DB_DATABASE'));
        // 비밀번호는 직접 노출하지 말고, 존재 여부와 길이만 확인
        console.log('DB_PASSWORD loaded:', !!configService.get<string>('DB_PASSWORD'));
        console.log('DB_PASSWORD length:', configService.get<string>('DB_PASSWORD')?.length);
        console.log('DB_SSL_ENABLED:', configService.get<boolean>('DB_SSL_ENABLED'));
        console.log('-------------------------------------------');

        // SSL 활성화 여부 확인 및 옵션 설정
        const sslEnabled = configService.get<boolean>('DB_SSL_ENABLED', false);
        // rejectUnauthorized: false는 개발/테스트용입니다. 운영 환경에서는 실제 인증서 사용을 권장합니다.
        const sslOptions = sslEnabled ? { rejectUnauthorized: false } : undefined; 

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
          logging: configService.get<boolean>('DB_LOGGING', false),
          // Google Cloud SQL 연결을 위한 SSL 설정
          ssl: sslEnabled,
          extra: {
            ssl: sslOptions,
          },
          // 마지막 속성 뒤에는 쉼표를 제거 (Trailing comma 제거)
        };
      }, // useFactory 함수의 닫는 중괄호 뒤에는 쉼표 없음
    }), // TypeOrmModule.forRootAsync 함수의 닫는 중괄호 뒤에도 쉼표 없음 (imports 배열의 마지막 요소가 아니므로)
    AuthModule,
    UsersModule,
    StockModule, // imports 배열의 마지막 요소 뒤에는 쉼표를 제거 (Trailing comma 제거)
  ], // imports 배열의 닫는 대괄호
  controllers: [AppController],
  providers: [AppService],
}) // @Module 데코레이터의 닫는 괄호
export class AppModule {}