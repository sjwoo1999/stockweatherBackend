// src/auth/auth.controller.ts (수정 제안)
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service'; // ⭐ AuthService 임포트 ⭐

@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService, // ⭐ AuthService 주입 ⭐
  ) {}

  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() req) {
    // 이 부분은 카카오 로그인 페이지로 리다이렉트되므로 실제로 실행되지 않습니다.
  }

  @Get('callback') // http://localhost:3000/auth/callback 으로 카카오에서 리다이렉트됩니다.
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req, @Res() res: Response) {
    // req.user는 KakaoStrategy의 validate 메서드에서 done(null, user)로 넘겨준 객체입니다.
    const kakaoUserInfo = req.user; // 카카오로부터 받은 사용자 정보

    console.log('Kakao 인증 성공. 사용자 정보 (KakaoStrategy에서 넘어옴):', kakaoUserInfo);

    // 1. 사용자 정보를 DB에 저장하거나 업데이트하고, User 객체를 가져옵니다.
    const user = await this.authService.validateUserFromKakao(kakaoUserInfo);
    console.log('DB에서 처리된 사용자 정보:', user);

    // 2. 해당 사용자 정보로 JWT 토큰을 생성합니다.
    const jwtToken = await this.authService.login(user); // AuthService의 login 메서드 호출
    console.log('생성된 JWT 토큰:', jwtToken);

    // 3. 프론트엔드로 리다이렉트 시킬 URL을 구성합니다.
    // 프론트엔드 URL은 .env의 FRONTEND_URL에서 가져오거나, 기본값으로 localhost:3000을 사용합니다.
    // 실제 프론트엔드 애플리케이션이 실행되는 URL이어야 합니다.
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    // 프론트엔드의 특정 경로(예: /login-success)로 토큰과 함께 리다이렉트
    // 이 /login-success 경로는 NestJS 백엔드에 있는 라우트가 아닙니다.
    // 이는 프론트엔드(React, Vue, Angular 등) 애플리케이션에 구현되어야 하는 라우트입니다.
    res.redirect(`${frontendBaseUrl}/login-success?token=${jwtToken}`);

    // 주의: 만약 프론트엔드 앱이 없다면, 테스트를 위해 잠시 res.json(user) 등으로 응답하여
    // 백엔드가 토큰을 잘 생성하는지 확인하는 것도 방법입니다.
    // 예: res.status(200).json({ message: 'Login successful', user, token: jwtToken });
  }
}