// stockweather-backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
        console.log('DB_PASSWORD loaded:', !!configService.get<string>('DB_PASSWORD'));
        console.log('DB_PASSWORD length:', configService.get<string>('DB_PASSWORD')?.length);
        console.log('DB_SSL_ENABLED:', configService.get<boolean>('DB_SSL_ENABLED'));
        console.log('-------------------------------------------');

        // SSL 활성화 여부를 문자열로 가져와서 불리언으로 명확히 변환
        // ConfigService.get<boolean>은 문자열 'false'를 true로 해석할 수 있음
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
          // --- 이 부분이 핵심 수정 ---
          // ssl 옵션은 TypeORM의 불리언 sslEnabled 값으로만 제어합니다.
          // Cloud SQL Proxy를 통해 연결 시, 이 값은 `false`여야 합니다.
          ssl: sslEnabled,
          // 'extra' 옵션에서 중복으로 'ssl'을 설정하지 않습니다.
          // 필요한 경우 다른 추가 옵션을 여기에 추가할 수 있습니다.
          // 예: extra: { max: 10 }
          // ---------------------------
        };
      },
    }),
    AuthModule,
    UsersModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}