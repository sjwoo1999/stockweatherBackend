// stockweather-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 기존 모듈 임포트
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StockModule } from './stock/stock.module';

// 새로 추가할 모듈 임포트
import { NewsModule } from './news/news.module';
import { AIAnalysisModule } from './ai-analysis/ai-analysis.module';
import { EventsGateway } from './events/events.gateway'; // ✨ EventsGateway 임포트 ✨

@Module({
  imports: [
    // 환경 변수 설정을 위한 ConfigModule (가장 상단에 위치하는 것이 좋음)
    ConfigModule.forRoot({
      isGlobal: true, // 애플리케이션 전체에서 ConfigService를 사용할 수 있도록 전역 설정
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local',
    }),

    // 데이터베이스 연결을 위한 TypeOrmModule
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
    StockModule,      // StockModule은 NewsModule과 AIAnalysisModule을 내부적으로 사용하므로,
                      // AppMoudle에선 StockModule만 임포트해도 됩니다.
                      // 하지만 명시적인 구조와 앱 전체 로딩을 위해 하위 모듈도 여기에 추가하는 것이 일반적입니다.
    NewsModule,       // ✨ NewsModule 추가 ✨
    AIAnalysisModule, // ✨ AIAnalysisModule 추가 ✨
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EventsGateway, // ✨ EventsGateway를 providers에 추가 ✨
  ],
  exports: [
    EventsGateway, // ✨ EventsGateway를 exports에 추가하여 다른 모듈에서 주입 가능하도록 설정 ✨
  ],
})
export class AppModule {}