// src/auth/kakao.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { User } from '../users/user.interface'; // User 인터페이스 임포트 (여러분의 프로젝트 구조에 맞게 경로 확인)

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      // clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'), // 필요하다면 여기에 추가
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'), // ⭐ 이 환경 변수 값을 정확히 설정해야 함
      scope: ['profile_nickname', 'profile_image', 'account_email'], // 필요한 스코프
    });
  }

  // Kakao에서 인증 성공 후 사용자 정보를 처리하는 메서드
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any, // 카카오로부터 받은 원본 프로필 객체
    done: Function,
  ): Promise<any> {
    // 개발 시 profile 객체의 실제 구조를 정확히 확인하는 것이 좋습니다.
    // console.log('Kakao Profile (Raw Data):', JSON.stringify(profile, null, 2));

    try {
      // 카카오 API 응답 구조에 따라 profile 객체에서 필요한 정보 추출
      const kakaoAccount = profile._json?.kakao_account;
      const userProfile = kakaoAccount?.profile;

      const kakaoUserInfoForService = {
        id: profile.id, // 카카오 고유 ID (number)
        email: kakaoAccount?.email, // 이메일 (string | undefined)
        nickname: userProfile?.nickname || profile.displayName, // 닉네임 (string)
        profileImage: userProfile?.thumbnail_image_url || userProfile?.profile_image_url, // 프로필 이미지 URL (string | undefined)
        // 여기에 필요한 카카오 원본 데이터의 다른 필드도 추가할 수 있습니다.
        // 예: gender: kakaoAccount?.gender, age_range: kakaoAccount?.age_range
      };

      console.log('KakaoStrategy: Extracted user info for AuthService:', kakaoUserInfoForService);

      // AuthService를 통해 사용자 정보 DB 처리 및 우리 시스템의 User 객체 반환
      const user: User = await this.authService.validateUserFromKakao(kakaoUserInfoForService);

      if (!user) {
        console.error('KakaoStrategy: AuthService failed to validate/create user.');
        return done(new UnauthorizedException('Kakao authentication failed: User processing issue.'), false);
      }

      // `done(null, user)`는 NestJS Passport가 `req.user`에 이 `user` 객체(`User` 타입)를 할당하도록 합니다.
      console.log('KakaoStrategy: Successfully validated user, passing to NestJS:', user);
      done(null, user);

    } catch (error) {
      console.error('KakaoStrategy: Error during Kakao validation process:', error.message, error.stack);
      done(new UnauthorizedException('Kakao authentication failed due to an internal error.'), false);
    }
  }
}