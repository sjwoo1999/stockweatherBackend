// src/auth/auth.module.ts (수정 없음, 확인만)
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KakaoStrategy } from './kakao.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // ⭐ 이 값이 .env에 제대로 설정되어 있는지 확인 ⭐
        signOptions: { expiresIn: '1h' }, // ⭐ 토큰 만료 시간 설정 확인 ⭐
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [KakaoStrategy, JwtStrategy, AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}