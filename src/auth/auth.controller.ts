// stockweather-backend/src/auth/auth.controller.ts

import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { User } from '../users/user.interface'; // User 인터페이스 임포트
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() req) {
    // 이 라우터는 카카오 인가 코드를 요청하는 URL로 리다이렉션만 담당
    // 실제 카카오 로그인 페이지로 이동됩니다.
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req, @Res() res: Response) {
    console.log('AuthController: 카카오 콜백 시작. req.url:', req.url);
    const user = req.user as User;

    if (!user || !user.id) {
      console.error('AuthController: req.user에 유효한 사용자 정보가 없습니다. (AuthGuard 문제)');
      // FRONTEND_URL을 configService에서 가져옵니다.
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'; // 3001로 변경
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }

    console.log('AuthController: 사용자 정보 확인됨:', user.id, user.nickname);

    try {
      const jwtResponse = await this.authService.login(user);
      const jwtToken = jwtResponse.access_token;
      console.log('AuthController: JWT 토큰 생성 성공. 토큰:', jwtToken);

      const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'; // 3001로 변경

      // ⭐⭐⭐ 이 부분을 수정해야 합니다! 백틱(`)을 사용하세요. ⭐⭐⭐
      res.redirect(`${frontendBaseUrl}/login-success?token=${jwtToken}`);
      // ⭐⭐⭐ 기존 코드에서 따옴표(')를 사용했다면 백틱으로 변경하세요. ⭐⭐⭐

    } catch (error) {
      console.error('AuthController: JWT 토큰 생성 또는 리다이렉션 중 오류 발생:', error);
      console.error('원본 오류 메시지:', error.message);
      console.error('원본 오류 스택:', error.stack);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'; // 3001로 변경
      return res.redirect(`${frontendUrl}/login?error=token_issue`);
    }
  }
}