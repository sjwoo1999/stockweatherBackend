// src/users/users.service.ts
import { Injectable } from '@nestjs/common';

// 간단한 사용자 인터페이스 (필요에 따라 확장)
export interface User {
  id: number;
  kakaoId: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private users: User[] = []; // 임시 사용자 저장소 (실제로는 DB 사용)
  private nextId = 1;

  // 카카오 사용자 정보로 사용자 찾기 또는 생성
  async findOrCreate(kakaoUserInfo: { kakaoId: string; email?: string; nickname?: string; profileImage?: string; }): Promise<User> {
    let user = this.users.find(u => u.kakaoId === kakaoUserInfo.kakaoId);

    if (!user) {
      // 새로운 사용자 생성
      user = {
        id: this.nextId++,
        kakaoId: kakaoUserInfo.kakaoId,
        email: kakaoUserInfo.email,
        nickname: kakaoUserInfo.nickname,
        profileImage: kakaoUserInfo.profileImage,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(user);
      console.log('새로운 사용자 생성:', user.nickname || user.kakaoId);
    } else {
      // 기존 사용자 정보 업데이트 (필요한 경우)
      user.email = kakaoUserInfo.email || user.email;
      user.nickname = kakaoUserInfo.nickname || user.nickname;
      user.profileImage = kakaoUserInfo.profileImage || user.profileImage;
      user.updatedAt = new Date();
      console.log('기존 사용자 업데이트:', user.nickname || user.kakaoId);
    }

    return user;
  }

  // ID로 사용자 찾기 (JWT 인증 시 유용)
  async findById(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  // 카카오 ID로 사용자 찾기
  async findByKakaoId(kakaoId: string): Promise<User | undefined> {
    return this.users.find(user => user.kakaoId === kakaoId);
  }
}