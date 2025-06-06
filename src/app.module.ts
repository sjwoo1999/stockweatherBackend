// stockweather-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { TypeOrmModule } from '@nestjs/typeorm'; // ⭐⭐ 이 줄을 주석 처리하거나 제거합니다. ⭐⭐
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ⭐⭐⭐ 이 TypeOrmModule.forRootAsync 부분을 완전히 제거합니다. ⭐⭐⭐
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     console.log('--- DB Config Loaded (from app.module.ts) ---');
    //     console.log('DB_HOST:', configService.get<string>('DB_HOST'));
    //     console.log('DB_PORT:', configService.get<number>('DB_PORT'));
    //     console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
    //     console.log('DB_DATABASE:', configService.get<string>('DB_DATABASE'));
    //     console.log('DB_PASSWORD loaded:', !!configService.get<string>('DB_PASSWORD'));
    //     console.log('DB_PASSWORD length:', configService.get<string>('DB_PASSWORD')?.length);
    //     console.log('DB_SSL_ENABLED:', configService.get<boolean>('DB_SSL_ENABLED'));
    //     console.log('-------------------------------------------');

    //     const dbSslEnabledConfig = configService.get<string>('DB_SSL_ENABLED', 'false');
    //     const sslEnabled = dbSslEnabledConfig === 'true';

    //     return {
    //       type: 'postgres',
    //       host: configService.get<string>('DB_HOST'),
    //       port: configService.get<number>('DB_PORT'),
    //       username: configService.get<string>('DB_USERNAME'),
    //       password: configService.get<string>('DB_PASSWORD'),
    //       database: configService.get<string>('DB_DATABASE'),
    //       entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //       synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
    //       logging: configService.get<boolean>('DB_LOGGING', false),
    //       ssl: sslEnabled,
    //     };
    //   },
    // }),

    // 애플리케이션의 핵심 기능 모듈들 (이 모듈들은 이제 DB 연결이 나중에 될 것이므로, DB 의존성이 있는 경우 수정이 필요할 수 있습니다. 이는 다음 단계에서 확인합니다.)
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