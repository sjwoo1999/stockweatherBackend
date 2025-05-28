// src/auth/auth.controller.ts
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express'; // Res 데코레이터를 위해 필요 (npm i @types/express)

@Controller('auth')
export class AuthController {
  // 1. 카카오 로그인 시작 엔드포인트
  // 이 엔드포인트로 접근하면 카카오 인증 페이지로 리다이렉트됩니다.
  @Get('kakao')
  @UseGuards(AuthGuard('kakao')) // 'kakao' 전략 사용
  async kakaoAuth(@Req() req) {
    // 실제 이 함수는 카카오 인증 페이지로 리다이렉트하기 때문에 실행되지 않습니다.
    // Passport가 인증 흐름을 제어합니다.
  }

  // 2. 카카오 로그인 콜백 엔드포인트
  // 카카오 인증 성공 후 인가 코드를 받아 처리합니다.
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao')) // 'kakao' 전략 사용
  async kakaoAuthCallback(@Req() req, @Res() res: Response) {
    // `AuthGuard('kakao')`가 성공적으로 실행되면, `req.user`에 KakaoStrategy에서 반환한
    // 사용자 정보(예: { kakaoId, email, nickname, ... })가 담겨 있습니다.
    const user = req.user;

    // --- TODO: 실제 로그인/회원가입 로직 구현 ---
    // 1. DB에서 사용자 정보를 조회하거나 새로 생성합니다.
    //    (예: const serviceUser = await this.authService.findOrCreateUser(user);)
    // 2. 서비스 내부에서 사용할 JWT 토큰을 발급합니다.
    //    (예: const jwtToken = this.authService.generateJwtToken(serviceUser);)
    // ------------------------------------------

    // 예시: 개발 환경에서 사용자 정보를 JSON으로 반환
    // 실제 서비스에서는 프론트엔드로 JWT 토큰을 포함하여 리다이렉트하는 것이 일반적입니다.
    res.status(200).json({
      message: '카카오 로그인 성공 및 사용자 정보 수신',
      userData: user,
      // token: jwtToken // 실제 발급된 JWT 토큰
    });

    // 예시: 로그인 성공 후 프론트엔드로 리다이렉트 (JWT 토큰 전달)
    // const jwtToken = 'your_generated_jwt_token'; // 실제 JWT 토큰으로 대체
    // res.redirect(`http://localhost:3001/auth/success?token=${jwtToken}`);
  }
}