// src/auth/auth.controller.ts
import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express'; // 'express' 패키지가 설치되어 있어야 합니다.
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../users/user.interface'; // User 인터페이스 임포트 (확인 필요)

@Controller('auth') // 이 컨트롤러의 모든 경로는 '/auth'로 시작합니다.
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  // 카카오 로그인 시작 엔드포인트
  // 프론트엔드에서 이 엔드포인트로 리다이렉트하면, NestJS Passport가 카카오 로그인 페이지로 리다이렉트합니다.
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() req) {
    // 이 메서드는 실제 실행되지 않고, AuthGuard가 카카오 로그인 페이지로 리다이렉트합니다.
    // 따라서 여기에 비즈니스 로직을 추가할 필요가 없습니다.
  }

  // 카카오로부터 인증 코드를 받은 후 리다이렉트되는 콜백 엔드포인트
  // ⭐ 핵심 수정: @Get('kakao/callback')으로 변경 ⭐
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req, @Res() res: Response) {
    // AuthGuard('kakao')가 성공적으로 실행되면,
    // KakaoStrategy.validate 메서드의 결과인 'User' 객체가 req.user에 담겨 있습니다.
    const user = req.user as User;

    console.log('AuthController: Kakao 인증 성공. req.user (처리된 사용자 정보):', user);

    if (!user || !user.id) {
      console.error('AuthController: req.user에 유효한 사용자 정보가 없습니다.');
      // 인증 실패 시 에러 페이지로 리다이렉트 (프론트엔드 URL 사용)
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }

    try {
      // user 객체는 이미 KakaoStrategy와 AuthService.validateUserFromKakao를 거쳐
      // DB에 저장되거나 조회된 최종 User 객체입니다.
      const jwtResponse = await this.authService.login(user);
      const jwtToken = jwtResponse.access_token;
      console.log('AuthController: 생성된 JWT 토큰:', jwtToken);

      const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
      // JWT 토큰을 쿼리 파라미터로 프론트엔드에 전달하여 로그인 완료 페이지로 리다이렉트
      res.redirect(`${frontendBaseUrl}/login-success?token=${jwtToken}`);
    } catch (error) {
      console.error('AuthController: JWT 토큰 생성 또는 리다이렉션 중 오류 발생:', error);
      // 토큰 발급 실패 시 에러 페이지로 리다이렉트 (프론트엔드 URL 사용)
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
      return res.redirect(`${frontendUrl}/login?error=token_issue`);
    }
  }
}