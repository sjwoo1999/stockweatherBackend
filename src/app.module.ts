// stockweather-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './users/user.entity';

// 애플리케이션의 다른 모듈들을 임포트합니다.
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StockModule } from './stock/stock.module';
import { EventsModule } from './events/events.module';
import { AIAnalysisModule } from './ai-analysis/ai-analysis.module';
import { DisclosureModule } from './disclosure/disclosure.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbSslEnabledConfig = configService.get<string>('DB_SSL_ENABLED', 'false');
        const sslEnabled = dbSslEnabledConfig === 'true';

        console.log('--- TypeOrmModule.forRootAsync DB Config ---');
        console.log('DB_HOST:', configService.get<string>('DB_HOST'));
        console.log('DB_PORT:', configService.get<number>('DB_PORT'));
        console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
        console.log('DB_DATABASE:', configService.get<string>('DB_DATABASE'));
        console.log('DB_SSL_ENABLED:', sslEnabled);
        console.log('-------------------------------------------');

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
          ssl: sslEnabled
            ? {
                rejectUnauthorized: false,
              }
            : false,
          extra: {
            socketPath: configService.get<string>('CLOUD_SQL_CONNECTION_NAME')
              ? `/cloudsql/${configService.get<string>('CLOUD_SQL_CONNECTION_NAME')}`
              : undefined,
          },
        };
      },
      inject: [ConfigService],
      // 🚨 dataSourceFactory 제거됨 → main.ts 에서 수동 초기화
    }),

    // 공통 모듈
    UsersModule,
    AuthModule,

    // REST 모드 전용 모듈
    ...(process.env.MODE === 'REST'
      ? [
          StockModule,
          AIAnalysisModule,
          DisclosureModule,
        ]
      : []),

    // WebSocket 모드 전용 모듈
    ...(process.env.MODE === 'WS'
      ? [
          EventsModule,
        ]
      : []),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
