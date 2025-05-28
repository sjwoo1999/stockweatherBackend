// src/auth/kakao.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config'; // 환경 변수 사용을 위해 추가

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService // ConfigService 주입
  ) {
    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID'), // .env에서 KAKAO_CLIENT_ID 가져오기
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL'), // .env에서 KAKAO_CALLBACK_URL 가져오기
      // ⭐ 추가: 프로필 정보(닉네임, 프로필 사진) 및 이메일을 가져오기 위한 scope 설정 ⭐
      // 'profile_nickname'과 'profile_image'는 '프로필 정보(닉네임, 프로필 사진)' 동의 항목에 포함됩니다.
      // 'account_email'은 '카카오계정(이메일)' 동의 항목에 포함됩니다.
      // 카카오 개발자 콘솔의 '동의항목' 설정과 일치해야 합니다.
      scope: ['profile_nickname', 'profile_image', 'account_email'], //
    });
  }

  // Kakao에서 인증 성공 후 사용자 정보를 처리하는 메서드
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    // ⭐ 중요: 개발 시 profile 객체의 실제 구조를 정확히 확인해야 합니다.
    // console.log('Kakao Profile (Raw Data):', JSON.stringify(profile, null, 2));

    // 카카오 API 응답 구조에 따라 profile 객체에서 정보 추출 (더 견고하게 변경)
    const kakaoAccount = profile._json?.kakao_account;
    const userProfile = kakaoAccount?.profile; // 닉네임, 프로필 사진이 포함될 수 있는 객체

    const user = {
      kakaoId: profile.id, // 카카오 고유 ID
      // 이메일: kakao_account 객체 아래에 직접 email 속성으로 제공됩니다.
      email: kakaoAccount?.email, //
      
      // 닉네임: profile.displayName 또는 kakao_account.profile.nickname을 사용할 수 있습니다.
      // displayName은 passport-kakao가 제공하는 추상화된 값이며,
      // _json.kakao_account.profile.nickname은 카카오 API의 원본 응답입니다.
      nickname: userProfile?.nickname || profile.displayName, //
      
      // 프로필 이미지 URL: kakao_account.profile 아래에 thumbnail_image_url 또는 profile_image_url로 제공됩니다.
      // thumbnail_image_url은 작은 이미지, profile_image_url은 큰 이미지입니다.
      profileImage: userProfile?.thumbnail_image_url || userProfile?.profile_image_url, //
      
      accessToken,
      refreshToken,
      // 필요한 다른 정보 추가 (카카오 개발자 콘솔의 동의 항목 설정에 따라 달라짐)
    };

    // TODO:
    // 1. user 정보를 데이터베이스에 저장하거나 업데이트하는 로직 구현
    //    (예: this.usersService.findOrCreate(user))
    // 2. 서비스 내부에서 사용할 user 객체 반환
    //    done(null, user); 는 NestJS Passport가 req.user에 이 user 객체를 할당하도록 합니다.

    done(null, user);
  }
}