import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './users/user.entity';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StockModule } from './stock/stock.module';
import { EventsModule } from './events/events.module';
import { AIAnalysisModule } from './ai-analysis/ai-analysis.module';
import { DisclosureModule } from './disclosure/disclosure.module';

@Module({
  imports: [
    // ✅ ConfigModule 설정 → Cloud Run / Cloud Functions 공통으로 안정 동작
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: false, // 반드시 false → process.env + .env 파일 모두 읽힘
      envFilePath: process.env.ENV_FILE || '.env.production', // 유연하게 적용 가능 (디폴트는 .env.production)
    }),

    // ✅ DB 설정
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
    }),

    // ✅ 공통 모듈
    UsersModule,
    AuthModule,

    // ✅ REST 모드 전용 모듈
    ...(process.env.MODE === 'REST'
      ? [
          StockModule,
          AIAnalysisModule,
          DisclosureModule,
        ]
      : []),

    // ✅ WebSocket 모드 전용 모듈
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
