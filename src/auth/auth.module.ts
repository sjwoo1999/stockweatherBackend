// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common'; // ⭐ forwardRef 임포트 확인 ⭐
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { KakaoStrategy } from './kakao.strategy'; // ⭐ KakaoStrategy 임포트 확인 ⭐
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller'; // ⭐ AuthController 임포트 확인 ⭐

@Module({
  imports: [
    forwardRef(() => UsersModule), // ⭐ UsersModule에 forwardRef 적용되었는지 확인 ⭐
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController], // ⭐ AuthController가 여기에 등록되었는지 확인 ⭐
  providers: [AuthService, JwtStrategy, KakaoStrategy], // ⭐ KakaoStrategy가 여기에 등록되었는지 확인 ⭐
  exports: [AuthService, JwtModule],
})
export class AuthModule {}