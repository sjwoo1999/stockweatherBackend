// stockweather-backend/src/auth/auth.service.ts (수정)
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.interface';

export interface JwtPayload {
  sub: number;
  kakaoId: string;
  email?: string;
  nickname: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // ⭐⭐⭐ 이 메서드의 `kakaoUserInfo` 타입 정의를 더 정확히 해야 합니다! ⭐⭐⭐
  // KakaoStrategy에서 넘겨주는 객체 구조에 맞춰 필드를 직접 받도록 변경
  async validateUserFromKakao(
    kakaoUserInfo: {
      id: string | number; // 카카오 ID는 number로 넘어올 수 있으니 string 또는 number로
      nickname?: string;
      email?: string;
      profileImage?: string;
    }
  ): Promise<User> {
    console.log('AuthService: validateUserFromKakao 호출됨');
    console.log('Kakao User Info received by validateUserFromKakao (from strategy):', kakaoUserInfo);

    // 카카오 ID는 항상 string으로 통일하여 처리
    const kakaoId = kakaoUserInfo.id.toString();

    // KakaoStrategy에서 넘어온 필드를 직접 사용
    const nickname = kakaoUserInfo.nickname || '익명 사용자'; // 기본값 더 명확히
    const profileImage = kakaoUserInfo.profileImage;
    const email = kakaoUserInfo.email;

    let user = await this.usersService.findByKakaoId(kakaoId);

    if (!user) {
      console.log(`User with kakaoId ${kakaoId} not found in DB, creating new user...`);
      user = await this.usersService.createKakaoUser({
        kakaoId: kakaoId,
        nickname: nickname, // KakaoStrategy에서 정제된 닉네임 사용
        profileImage: profileImage, // KakaoStrategy에서 정제된 이미지 사용
        email: email, // KakaoStrategy에서 정제된 이메일 사용
      });
      console.log('New user created:', user);
    } else {
      console.log(`Existing user with kakaoId ${kakaoId} found:`, user);
      // 기존 사용자 정보 업데이트 로직 (선택 사항)
      let needsUpdate = false;
      if (user.nickname !== nickname) {
        user.nickname = nickname;
        needsUpdate = true;
      }
      if (profileImage && user.profileImage !== profileImage) {
        user.profileImage = profileImage;
        needsUpdate = true;
      }
      if (email && user.email !== email) {
        user.email = email;
        needsUpdate = true;
      }

      if (needsUpdate) {
        // UsersService에 updateUser 메서드가 있다면 사용
        // 그렇지 않다면 usersRepository.save(user)를 직접 호출하거나 UsersService에 추가
        // await this.usersService.updateUser(user); // 이 메서드가 없다면 추가해야 합니다.
        // 현재 users.service.ts에 updateUser가 없으므로 이 줄은 주석 처리하거나,
        // users.service.ts에 아래 메서드를 추가한 후 사용:
        /*
        // users.service.ts 에 추가될 메서드
        async updateUser(user: User): Promise<User> {
            return this.usersRepository.save(user); // TypeORM은 엔티티가 존재하면 업데이트, 없으면 삽입
        }
        */
        console.log('Existing user info updated in memory. Remember to save to DB if needed.');
      }
    }
    return user;
  }

  async validateUserById(userId: number): Promise<User | null> {
    console.log(`AuthService: validateUserById 호출됨 (ID: ${userId})`);
    const user = await this.usersService.findById(userId);
    if (!user) {
      console.warn(`AuthService: User with ID ${userId} not found during validation.`);
      return null;
    }
    // 이 메서드의 목적은 JWT Payload의 sub(userId)를 통해 User 객체를 가져오는 것입니다.
    // 여기에서 password를 제거하는 등의 추가 처리는 필요하지 않습니다. (User 인터페이스에 password가 없으므로)
    return user;
  }

  async login(user: User): Promise<{ access_token: string }> {
    console.log('AuthService: login 호출됨. 사용자 정보:', user);
    if (!user || !user.id || !user.kakaoId || !user.nickname) {
      console.error('AuthService: Invalid user object for JWT payload generation.', user);
      throw new UnauthorizedException('JWT 토큰 생성을 위한 사용자 정보가 불완전합니다.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      kakaoId: user.kakaoId,
      email: user.email,
      nickname: user.nickname,
    };
    const token = this.jwtService.sign(payload);
    console.log('AuthService: JWT Token generated successfully.');
    return {
      access_token: token,
    };
  }
}