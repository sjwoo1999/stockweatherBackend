// src/auth/auth.controller.ts
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config'; // ConfigService가 필요할 수 있습니다.

@Controller('auth') // 이 컨트롤러의 기본 경로는 '/auth'
export class AuthController {
  constructor(private configService: ConfigService) {} // ConfigService 주입 (필요하다면)

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() req) {
    // 이 부분은 카카오 로그인 페이지로 리다이렉트되므로 실제로 실행되지 않습니다.
  }

  // ⭐ 이 부분을 수정합니다: 'kakao/callback' 대신 'callback'으로 변경 ⭐
  // 이렇게 하면 최종 URL이 http://localhost:3000/auth/callback 이 됩니다.
  @Get('callback') // 경로를 'callback'으로 변경
  @UseGuards(AuthGuard('kakao')) // 이 시점에서는 이미 인증되어 req.user에 사용자 정보가 있음
  async kakaoAuthCallback(@Req() req, @Res() res: Response) {
    const user = req.user;
    console.log('로그인 성공. 사용자 정보:', user);

    // JWT 토큰이 이미 req.query.token으로 넘어오고 있으므로
    // 프론트엔드로 리다이렉트 시킬 URL을 구성합니다.
    const jwtToken = req.query.token; // 쿼리 파라미터에서 토큰을 가져옵니다.

    // 프론트엔드 URL을 환경 변수에서 가져오거나 직접 지정합니다.
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000'; // 예: http://localhost:3000 (프론트엔드 포트)

    // 프론트엔드의 특정 경로로 토큰과 함께 리다이렉트
    // 예: http://localhost:3000/main?token=YOUR_JWT_TOKEN
    res.redirect(`${frontendBaseUrl}/login-success?token=${jwtToken}`); // ⭐ 이 경로도 적절히 수정 필요 ⭐

    // 만약 프론트엔드가 루트 경로에서 토큰을 받으려면
    // res.redirect(`${frontendBaseUrl}?token=${jwtToken}`);
  }
}