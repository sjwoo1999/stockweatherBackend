// src/auth/auth.controller.ts (수정)
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../users/user.interface'; // User 인터페이스 임포트

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() req) {
    // 이 부분은 카카오 로그인 페이지로 리다이렉트되므로 실제 실행되지 않습니다.
    // 사용자에게 보여질 페이지는 카카오 로그인 창입니다.
  }

  @Get('callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req, @Res() res: Response) {
    // AuthGuard('kakao')가 성공적으로 실행되면,
    // KakaoStrategy.validate 메서드의 결과인 'User' 객체가 req.user에 담겨 있습니다.
    const user = req.user as User;

    console.log('AuthController: Kakao 인증 성공. req.user (처리된 사용자 정보):', user);

    if (!user || !user.id) {
      console.error('AuthController: req.user에 유효한 사용자 정보가 없습니다.');
      // 인증 실패 시 에러 페이지로 리다이렉트 (프론트엔드 URL 사용)
      return res.redirect(`${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/login?error=auth_failed`);
    }

    try {
      // ⭐⭐⭐ 핵심 수정: user 객체를 authService.login에 직접 전달 ⭐⭐⭐
      // user 객체는 이미 KakaoStrategy와 AuthService.validateUserFromKakao를 거쳐
      // DB에 저장되거나 조회된 최종 User 객체입니다. 다시 validateUserFromKakao를 호출할 필요가 없습니다.
      const jwtResponse = await this.authService.login(user);
      const jwtToken = jwtResponse.access_token;
      console.log('AuthController: 생성된 JWT 토큰:', jwtToken);

      const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
      res.redirect(`${frontendBaseUrl}/login-success?token=${jwtToken}`);
    } catch (error) {
      console.error('AuthController: JWT 토큰 생성 또는 리다이렉션 중 오류 발생:', error);
      // 토큰 발급 실패 시 에러 페이지로 리다이렉트 (프론트엔드 URL 사용)
      return res.redirect(`${this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001'}/login?error=token_issue`);
    }
  }
}