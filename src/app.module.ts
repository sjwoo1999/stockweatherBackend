// stockweather-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // MongooseModule 대신 TypeOrmModule 사용 확인
import { ConfigModule, ConfigService } from '@nestjs/config';

// 기존 모듈 임포트
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// 새로 추가 또는 확인 모듈 임포트
import { StockModule } from './stock/stock.module';
import { AIAnalysisModule } from './ai-analysis/ai-analysis.module'; // ✨ AiAnalysisModule (대소문자 일치) ✨
import { EventsModule } from './events/events.module'; // ✨ EventsModule 임포트 ✨

@Module({
  imports: [
    // 환경 변수 설정을 위한 ConfigModule (가장 상단에 위치하는 것이 좋음)
    ConfigModule.forRoot({
      isGlobal: true, // 애플리케이션 전체에서 ConfigService를 사용할 수 있도록 전역 설정
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local',
    }),

    // 데이터베이스 연결을 위한 TypeOrmModule (MongooseModule 대신 TypeOrmModule을 사용한다고 가정)
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
    StockModule,      // StockModule은 NewsModule과 AIAnalysisModule, EventsModule을 내부적으로 임포트함
    // NewsModule,       // NewsModule 명시적 추가
    AIAnalysisModule, // ✨ AiAnalysisModule (대소문자 주의) ✨
    EventsModule,     // ✨ EventsModule 명시적 추가 ✨
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ✨ EventsGateway는 EventsModule에서 관리되므로 여기서는 제거합니다. ✨
  ],
  exports: [
    // ✨ EventsGateway는 EventsModule에서 export 되므로 여기서는 제거합니다. ✨
  ],
})
export class AppModule {}