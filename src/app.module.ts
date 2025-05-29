// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigService도 임포트
import { TypeOrmModule } from '@nestjs/typeorm'; // ⭐ TypeOrmModule 임포트 ⭐
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    // ⭐ TypeOrmModule.forRootAsync 추가 ⭐
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // 사용하는 데이터베이스 타입 (예: 'postgres', 'mysql' 등)
        host: '127.0.0.1', // ⭐ cloud_sql_proxy가 리스닝하는 IP ⭐
        port: 5432, // ⭐ cloud_sql_proxy가 리스닝하는 포트 ⭐
        username: configService.get<string>('DB_USERNAME'), // .env 파일에서 가져옴
        password: configService.get<string>('DB_PASSWORD'), // .env 파일에서 가져옴
        database: configService.get<string>('DB_DATABASE'), // .env 파일에서 가져옴
        entities: [__dirname + '/**/*.entity{.ts,.js}'], // 엔티티 파일 경로
        synchronize: true, // 개발용: true로 설정하면 앱 시작 시 스키마 자동 동기화 (운영 시에는 false 또는 마이그레이션 사용)
        logging: true, // DB 쿼리 로그 활성화 (개발 시 유용)
        // 기타 TypeORM 설정 (ssl, extra 등 필요시 추가)
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}