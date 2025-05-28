// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport'; // PassportModule 임포트
import { KakaoStrategy } from './kakao.strategy'; // KakaoStrategy 임포트
import { AuthController } from './auth.controller'; // (다음 단계에서 생성)
// import { AuthService } from './auth.service'; // (JWT 발급 등 로그인 로직 처리 시 필요)

@Module({
  imports: [
    PassportModule.register({ session: false }), // JWT 기반 인증 시 session: false
    // PassportModule.register({ defaultStrategy: 'jwt' }), // JWT 사용 시 기본 전략 설정
  ],
  providers: [KakaoStrategy, /* AuthService */], // KakaoStrategy를 프로바이더에 추가
  controllers: [AuthController], // (다음 단계에서 추가)
})
export class AuthModule {}