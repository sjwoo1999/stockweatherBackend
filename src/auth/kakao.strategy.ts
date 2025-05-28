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
    });
  }

  // Kakao에서 인증 성공 후 사용자 정보를 처리하는 메서드
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    // profile 객체에 카카오로부터 받은 사용자 정보가 들어있습니다.
    // console.log('Kakao Profile:', profile); // 개발 시 확인용

    const user = {
      kakaoId: profile.id, // 카카오 고유 ID
      email: profile._json?.kakao_account?.email, // 이메일 (동의한 경우)
      nickname: profile.displayName, // 닉네임
      profileImage: profile._json?.properties?.profile_image, // 프로필 이미지 URL
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