// src/auth/auth.controller.ts (수정된 부분)
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() req) {
    // 이 부분은 카카오 로그인 페이지로 리다이렉트되므로 실제로 실행되지 않습니다.
  }

  @Get('callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req, @Res() res: Response) {
    const kakaoUserInfo = req.user;

    console.log('Kakao 인증 성공. 사용자 정보 (KakaoStrategy에서 넘어옴):', kakaoUserInfo);

    const user = await this.authService.validateUserFromKakao(kakaoUserInfo);
    console.log('DB에서 처리된 사용자 정보:', user);

    const jwtResponse = await this.authService.login(user);
    const jwtToken = jwtResponse.access_token;
    console.log('생성된 JWT 토큰:', jwtToken);

    // FRONTEND_URL 환경 변수가 없으면 'http://localhost:3001'을 기본값으로 사용
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    // ✅✅✅ 이 줄을 이렇게 정확히 수정하세요! 백틱(`` ` ``)으로 시작하고 끝납니다. ✅✅✅
    // ` (백틱)을 사용하여 변수 (프론트엔드 URL, JWT 토큰)를 문자열 안에 바로 넣을 수 있습니다.
    res.redirect(`${frontendBaseUrl}/login-success?token=${jwtToken}`);
  }
}