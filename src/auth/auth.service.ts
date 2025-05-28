// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, User } from '../users/users.service'; // UsersService 및 User 인터페이스 임포트

// JWT 페이로드 인터페이스 정의
export interface JwtPayload {
  sub: number; // User ID
  kakaoId: string;
  email?: string;
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

  // 사용자 객체로 JWT 토큰 발급
  async login(user: User) {
    const payload: JwtPayload = { sub: user.id, kakaoId: user.kakaoId, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // JWT 페이로드로 사용자 찾기 (JWT 검증 시 사용)
  async validateUserById(userId: number): Promise<User | undefined> {
    return this.usersService.findById(userId);
  }
}