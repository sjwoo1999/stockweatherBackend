// stockweather-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 기존 모듈 임포트
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// 새로 추가 또는 확인 모듈 임포트
import { StockModule } from './stock/stock.module';
import { AIAnalysisModule } from './ai-analysis/ai-analysis.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    // 환경 변수 설정을 위한 ConfigModule (가장 상단에 위치하는 것이 좋음)
    ConfigModule.forRoot({
      isGlobal: true, // 애플리케이션 전체에서 ConfigService를 사용할 수 있도록 전역 설정
      // Cloud Run과 같은 배포 환경에서는 .env 파일을 사용하지 않으므로,
      // envFilePath를 제거하여 process.env에서 직접 환경 변수를 로드하도록 합니다.
      // envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local', // 이 줄을 제거했습니다.
    }),

    // 데이터베이스 연결을 위한 TypeOrmModule
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log('--- DB Config Loaded (from app.module.ts) ---');
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
          ssl: sslEnabled,
        };
      },
    }),

    // 애플리케이션의 핵심 기능 모듈들
    AuthModule,
    UsersModule,
    StockModule,
    AIAnalysisModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
  exports: [],
})
export class AppModule {}