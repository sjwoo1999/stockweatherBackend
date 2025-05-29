// src/auth/kakao.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'; // UnauthorizedException 추가
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service'; // ⭐ AuthService 임포트 ⭐
import { User } from '../users/user.interface'; // ⭐ User 인터페이스 임포트 ⭐

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService, // ⭐ AuthService 주입 ⭐
  ) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'),
      // clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET'), // 필요하다면 추가
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'),
      scope: ['profile_nickname', 'profile_image', 'account_email'],
    });
  }

  // Kakao에서 인증 성공 후 사용자 정보를 처리하는 메서드
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any, // 카카오로부터 받은 원본 프로필 객체
    done: Function,
  ): Promise<any> {
    // ⭐ 중요: 개발 시 profile 객체의 실제 구조를 정확히 확인해야 합니다.
    // console.log('Kakao Profile (Raw Data):', JSON.stringify(profile, null, 2));

    try {
      // 카카오 API 응답 구조에 따라 profile 객체에서 필요한 정보 추출
      // 이 정보는 AuthService의 validateUserFromKakao로 전달됩니다.
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

      // ⭐⭐⭐ 핵심 로직: AuthService를 통해 사용자 정보 DB 처리 및 우리 시스템의 User 객체 반환 ⭐⭐⭐
      // AuthService의 validateUserFromKakao 메서드가 Kakao 정보로 DB 작업을 수행하고,
      // 최종적으로 우리 시스템의 User 객체 (password 필드 없는)를 반환합니다.
      const user: User = await this.authService.validateUserFromKakao(kakaoUserInfoForService);

      if (!user) {
        // user가 null로 반환될 경우 (예: validateUserFromKakao 내부에서 실패 처리)
        console.error('KakaoStrategy: AuthService failed to validate/create user.');
        return done(new UnauthorizedException('Kakao authentication failed: User processing issue.'), false);
      }

      // `done(null, user)`는 NestJS Passport가 `req.user`에 이 `user` 객체(`User` 타입)를 할당하도록 합니다.
      // 이 `user` 객체는 `JwtStrategy`와 다른 컨트롤러/서비스에서 사용될 것입니다.
      console.log('KakaoStrategy: Successfully validated user, passing to NestJS:', user);
      done(null, user);

    } catch (error) {
      console.error('KakaoStrategy: Error during Kakao validation process:', error.message, error.stack);
      // 에러 발생 시 인증 실패 처리
      done(new UnauthorizedException('Kakao authentication failed due to an internal error.'), false);
    }
  }
}