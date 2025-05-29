// stockweather-backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service'; // UsersService 임포트
import { JwtService } from '@nestjs/jwt'; // 토큰 생성에 필요
import { User } from '../users/user.interface'; // User 인터페이스 임포트

export interface JwtPayload {
  sub: number; // 사용자 ID (DB의 User.id)
  kakaoId: string;
  email?: string; // optional
  nickname: string;
  // iat, exp는 JwtService가 자동으로 추가하므로 여기서는 명시하지 않아도 됨
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // UsersService 주입
    private jwtService: JwtService, // 토큰 생성에 필요
  ) {}

  // ⭐⭐ 1. 'validateUserFromKakao' 메서드 추가 (필수) ⭐⭐
  async validateUserFromKakao(kakaoUserInfo: any): Promise<User> {
    console.log('AuthService: validateUserFromKakao 호출됨');
    console.log('Kakao User Info:', kakaoUserInfo);

    // 카카오 ID는 보통 number지만, DB 저장 및 일관성을 위해 string으로 변환하는 경우가 많습니다.
    const kakaoId = kakaoUserInfo.id.toString();

    // 1. 카카오 ID로 사용자 존재 여부 확인
    let user = await this.usersService.findByKakaoId(kakaoId);

    // 2. 사용자가 없으면 새로 생성
    if (!user) {
      console.log('User not found in DB, creating new user from Kakao info...');
      user = await this.usersService.createKakaoUser({
        kakaoId: kakaoId,
        nickname: kakaoUserInfo.properties?.nickname || 'Unknown', // 닉네임은 필수값으로 간주
        profileImage: kakaoUserInfo.properties?.profile_image,
        email: kakaoUserInfo.kakao_account?.email,
      });
      console.log('New user created:', user);
    } else {
      console.log('Existing user found:', user);
      // 3. 기존 사용자라면 카카오 정보 업데이트 (선택 사항: 닉네임, 프로필 이미지 변경 시 동기화)
      // 예시:
      // if (user.nickname !== kakaoUserInfo.properties?.nickname || user.profileImage !== kakaoUserInfo.properties?.profile_image) {
      //   user.nickname = kakaoUserInfo.properties?.nickname;
      //   user.profileImage = kakaoUserInfo.properties?.profile_image;
      //   await this.usersService.updateUser(user); // UsersService에 updateUser 메서드가 있어야 함
      //   console.log('Existing user info updated.');
      // }
    }

    // ⭐⭐⭐ 'password' 속성 처리 코드 제거 또는 확인 ⭐⭐⭐
    // User 인터페이스에 password 필드가 없으므로, 아래와 같은 줄은 불필요합니다.
    // const { password, ...result } = user; // <-- 이 줄을 제거하거나, 주석 처리된 상태를 유지하세요.
    return user; // DB에서 조회/생성된 User 객체 반환
  }

  // ⭐⭐ 2. JwtStrategy에서 호출될 메서드: 'password' 관련 코드 제거 확인 ⭐⭐
  // JWT 토큰의 payload (sub: userId)를 통해 사용자 정보를 가져옴
  async validateUserById(userId: number): Promise<User | null> {
    console.log(`AuthService: validateUserById 호출됨 (ID: ${userId})`);
    const user = await this.usersService.findById(userId);
    if (!user) {
      console.warn(`AuthService: User with ID ${userId} not found during validation.`);
      return null; // 사용자 없음
    }
    // User 인터페이스에 password가 없으므로 별도의 처리 없이 user 객체 그대로 반환
    return user; // `req.user`에 User 객체가 담기게 됨
  }

  // ⭐⭐ 3. 로그인 성공 후 JWT 토큰을 발급하는 메서드 ⭐⭐
  async login(user: User): Promise<{ access_token: string }> { // 반환 타입 명확화
    console.log('AuthService: login 호출됨. 사용자 정보:', user);
    if (!user || !user.id || !user.kakaoId || !user.nickname) {
      console.error('AuthService: Invalid user object for JWT payload generation.', user);
      throw new UnauthorizedException('User information is incomplete for token generation.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      kakaoId: user.kakaoId,
      email: user.email, // email은 optional이므로 없을 수도 있음
      nickname: user.nickname,
    };
    const token = this.jwtService.sign(payload);
    console.log('AuthService: JWT Token generated successfully.');
    return {
      access_token: token,
    };
  }
}