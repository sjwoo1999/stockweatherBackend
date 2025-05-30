// stockweather-backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module'; // 기존 UsersModule 임포트
import { StockModule } from './stock/stock.module'; // StockModule 임포트
// import { UserModule } from './user/user.module'; // ⭐ 이전 답변의 UserModule은 UsersModule로 통합될 예정이므로 제거 ⭐

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 전역적으로 환경 변수 사용 가능
      envFilePath: process.env.NODE_ENV === 'development' ? '.env.development' : '.env', // 환경별 .env 파일 지정
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false), // 개발 단계에서만 true, 운영에서는 false 권장
        logging: configService.get<boolean>('DB_LOGGING', false), // DB 쿼리 로그 활성화/비활성화
      }),
    }),
    AuthModule,
    UsersModule, // 사용자 관련 로직 처리
    StockModule, // 주식 검색 관련 로직 처리
    // UserModule // ⭐ 이 모듈은 더 이상 사용되지 않음 (UsersModule로 기능 통합) ⭐
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}