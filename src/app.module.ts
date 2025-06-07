// stockweather-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// 필요한 엔티티들을 임포트합니다. (모든 모드에서 공통으로 필요하다고 가정)
import { User } from './users/user.entity';
// 다른 엔티티들도 여기에 추가해주세요.
// 예시: import { Stock } from './stock/stock.entity';

// 애플리케이션의 다른 모듈들을 임포트합니다.
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'; // Auth 모듈
import { StockModule } from './stock/stock.module'; // Stock 모듈
import { EventsModule } from './events/events.module'; // Events (WebSocket) 모듈
import { AIAnalysisModule } from './ai-analysis/ai-analysis.module'; // AI Analysis 모듈
import { DisclosureModule } from './disclosure/disclosure.module'; // Disclosure 모듈

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
        const dbSslEnabledConfig = configService.get<string>(
          'DB_SSL_ENABLED',
          'false',
        );
        const sslEnabled = dbSslEnabledConfig === 'true';

        console.log('--- TypeOrmModule.forRootAsync DB Config ---');
        console.log('DB_HOST:', configService.get<string>('DB_HOST'));
        console.log('DB_PORT:', configService.get<number>('DB_PORT'));
        console.log('DB_USERNAME:', configService.get<string>('DB_USERNAME'));
        console.log('DB_DATABASE:', configService.get<string>('DB_DATABASE'));
        console.log(
          'DB_PASSWORD loaded:',
          !!configService.get<string>('DB_PASSWORD'),
        );
        console.log(
          'DB_PASSWORD length:',
          configService.get<string>('DB_PASSWORD')?.length,
        );
        console.log('DB_SSL_ENABLED:', sslEnabled);
        console.log(
          'DB_SYNCHRONIZE:',
          configService.get<boolean>('DB_SYNCHRONIZE', false),
        );
        console.log(
          'DB_LOGGING:',
          configService.get<boolean>('DB_LOGGING', false),
        );
        console.log(
          'CLOUD_SQL_CONNECTION_NAME:',
          configService.get<string>('CLOUD_SQL_CONNECTION_NAME'),
        );
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
      dataSourceFactory: async (
        options: import('typeorm').DataSourceOptions,
      ) => {
        const { DataSource } = await import('typeorm');
        const dataSource = new DataSource(options);

        const maxRetries = 50;
        let retries = maxRetries;
        const delay = 5000;

        console.log(
          'Attempting to connect to the database via TypeOrmModule.dataSourceFactory...',
        );

        while (retries > 0) {
          try {
            await dataSource.initialize();
            console.log(
              'Database connected successfully within TypeOrmModule.dataSourceFactory!',
            );
            return dataSource;
          } catch (error) {
            retries--;
            console.warn(
              `Failed to connect to DB (TypeOrmModule.dataSourceFactory). Retrying in ${delay / 1000} seconds... Retries left: ${retries}. Error: ${error.message}`,
            );
            if (retries > 0) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }
        console.error(
          'Failed to connect to the database after multiple retries within TypeOrmModule.dataSourceFactory. Exiting application.',
        );
        process.exit(1);
      },
    }),

    // ⭐⭐ 여기에 조건부 모듈 로드를 추가합니다. ⭐⭐
    // 모든 모드에서 필요한 모듈
    UsersModule,
    AuthModule, // 인증은 REST API와 WebSocket 모두 필요할 수 있습니다. (JWT 검증)

    // REST API 모드에서만 필요한 모듈 (대부분의 컨트롤러)
    ...(process.env.MODE === 'REST'
      ? [
          StockModule,
          AIAnalysisModule,
          DisclosureModule,
          // 여기에 REST API와 관련된 다른 모듈들을 추가합니다.
        ]
      : []),

    // WebSocket 모드에서만 필요한 모듈
    ...(process.env.MODE === 'WS'
      ? [
          EventsModule,
          // WebSocket 서비스가 다른 모듈의 서비스(예: StockService의 데이터 분석 결과)를
          // 사용해야 한다면 해당 서비스가 포함된 모듈도 WS 모드에 임포트해야 합니다.
          // 예: 만약 EventsGateway가 StockService를 주입받아 사용한다면 StockModule도 WS 모드에 포함해야 합니다.
          // 현재 EventsGateway는 StockService를 직접 주입받지 않는 것 같으므로, 일단 EventsModule만 추가합니다.
          // 만약 StockService에서 WebSocket으로 데이터를 보내는 로직이 있다면,
          // StockService와 EventsGateway 사이에 Pub/Sub 같은 통신 채널을 구현하거나,
          // StockModule을 WS 모드에도 포함해야 합니다.
        ]
      : []),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
