import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
      ignoreEnvFile: process.env.NODE_ENV === 'production', // Cloud Functions 용
      envFilePath:
        process.env.NODE_ENV === 'production' ? undefined : '.env.development',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbSslEnabledConfig = configService.get<string>(
          'DB_SSL_ENABLED',
          'false',
        );
        const sslEnabled = dbSslEnabledConfig === 'true';

        const dbHost = configService.get<string>('DB_HOST');
        const dbPort = configService.get<number>('DB_PORT');
        const dbUsername = configService.get<string>('DB_USERNAME');
        const dbDatabase = configService.get<string>('DB_DATABASE');

        console.log('--- TypeOrmModule.forRootAsync DB Config ---');
        console.log('DB_HOST:', dbHost);
        console.log('DB_PORT:', dbPort);
        console.log('DB_USERNAME:', dbUsername);
        console.log('DB_DATABASE:', dbDatabase);
        console.log('DB_SSL_ENABLED:', sslEnabled);
        console.log('-------------------------------------------');

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUsername,
          password: configService.get<string>('DB_PASSWORD'),
          database: dbDatabase,
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

    UsersModule,
    AuthModule,

    // ✅ MODE 공백 제거 후 안전하게 비교
    ...(process.env.MODE?.trim() === 'REST'
      ? [StockModule, AIAnalysisModule, DisclosureModule]
      : []),

    ...(process.env.MODE?.trim() === 'WS' ? [EventsModule] : []),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
