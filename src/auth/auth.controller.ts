// stockweather-backend/src/auth/auth.controller.ts

import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express'; // express Response 타입 임포트
import { AuthService } from './auth.service';
import { User } from '../users/user.interface'; // User 인터페이스 임포트
import { ConfigService } from '@nestjs/config'; // ConfigService 임포트

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService, // ConfigService 주입
  ) {}

  /**
   * 카카오 로그인 시작 엔드포인트.
   * 이 라우터는 카카오 인가 코드를 요청하는 URL로 리다이렉션만 담당합니다.
   * 실제 카카오 로그인 페이지로 이동됩니다.
   */
  @Get('kakao')
  @UseGuards(AuthGuard('kakao')) // Passport-Kakao의 'kakao' 전략 사용
  async kakaoAuth(@Req() req) {
    // 이 함수는 실제로 실행되지 않고, @UseGuards(AuthGuard('kakao'))에 의해
    // 카카오 인가 서버로의 리다이렉션이 자동으로 처리됩니다.
    // 사용자 정보는 `req.user`에 담기게 되며, 콜백에서 사용됩니다.
  }

  /**
   * 카카오 로그인 콜백 엔드포인트.
   * 카카오로부터 인가 코드를 받아 사용자 정보를 가져온 후, JWT 토큰을 발급하여 프론트엔드로 리다이렉트합니다.
   */
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao')) // Passport-Kakao 가드를 사용하여 user 객체 가져오기
  async kakaoAuthCallback(@Req() req, @Res() res: Response) {
    console.log('AuthController: 카카오 콜백 시작. req.url:', req.url);

    // Passport-Kakao 전략에서 req.user에 저장한 사용자 정보를 가져옵니다.
    const user = req.user as User;

    // 사용자 정보가 없거나 유효하지 않은 경우 에러 처리 및 로그인 페이지로 리다이렉트
    if (!user || !user.id) {
      console.error(
        'AuthController: req.user에 유효한 사용자 정보가 없습니다. (AuthGuard 문제 또는 데이터 누락)',
      );
      // FRONTEND_URL을 ConfigService에서 가져옵니다.
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3001';
      return res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }

    console.log(
      'AuthController: 사용자 정보 확인됨 - ID:',
      user.id,
      'Nickname:',
      user.nickname,
    );

    try {
      // 인증 서비스(AuthService)를 통해 JWT 토큰을 발급합니다.
      // `login` 메서드는 일반적으로 JWT `access_token`을 포함한 객체를 반환합니다.
      const jwtResponse = await this.authService.login(user);
      const jwtToken = jwtResponse.access_token; // JWT 토큰 추출

      console.log(
        'AuthController: JWT 토큰 생성 성공. 토큰 앞부분:',
        jwtToken.substring(0, 30) + '...',
      ); // 전체 토큰 노출 방지

      // 프론트엔드 기본 URL을 ConfigService에서 가져옵니다.
      const frontendBaseUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3001';

      // 🔴🔴🔴🔴🔴 수정된 부분: 백틱(`` ` ``)을 사용하여 변수를 올바르게 삽입합니다. 🔴🔴🔴🔴🔴
      // 이 한 줄만 사용하고 기존 주석은 삭제하세요.
      // JWT 토큰을 쿠키로 설정
      res.cookie('jwtToken', jwtToken, {
        httpOnly: false, // 프론트엔드에서 접근 가능하도록
        secure: true, // HTTPS에서만 전송
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24시간
      });
      
      // 대시보드로 리다이렉트 (토큰은 쿠키에 있음)
      res.redirect(`${frontendBaseUrl}/dashboard`);
    } catch (error) {
      // JWT 토큰 생성 또는 리다이렉션 중 오류 발생 시 처리
      console.error(
        'AuthController: JWT 토큰 생성 또는 리다이렉션 중 오류 발생:',
        error,
      );
      console.error('원본 오류 메시지:', error.message);
      console.error('원본 오류 스택:', error.stack);
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3001';
      return res.redirect(`${frontendUrl}/login?error=token_issue`);
    }
  }
}
