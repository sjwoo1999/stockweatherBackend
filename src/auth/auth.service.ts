// src/auth/auth.service.ts (수정 제안)
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from '../users/users.service';

// JWT 페이로드 인터페이스 정의 (동일)
export interface JwtPayload {
  sub: number; // User ID
  kakaoId: string;
  email?: string;
  nickname?: string; // ⭐ 추가: 닉네임도 페이로드에 포함하면 프론트엔드에서 편리
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 카카오 사용자 정보로 DB에서 사용자 찾기 또는 생성
  async validateUserFromKakao(kakaoUserInfo: { kakaoId: string; email?: string; nickname?: string; profileImage?: string; }): Promise<User> {
    const user = await this.usersService.findOrCreate(kakaoUserInfo);
    return user;
  }

  // ⭐ 사용자 객체로 JWT 토큰 발급 (수정) ⭐
  async login(user: User): Promise<string> { // ⭐ 반환 타입을 string으로 명시 ⭐
    const payload: JwtPayload = {
      sub: user.id,
      kakaoId: user.kakaoId,
      email: user.email,
      nickname: user.nickname // ⭐ 추가 ⭐
    };
    return this.jwtService.sign(payload); // ⭐ access_token 객체 대신 토큰 스트링만 반환 ⭐
  }

  // JWT 페이로드로 사용자 찾기 (JWT 검증 시 사용) (동일)
  async validateUserById(userId: number): Promise<User | undefined> {
    return this.usersService.findById(userId);
  }
}