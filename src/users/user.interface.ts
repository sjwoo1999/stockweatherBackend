// src/users/user.interface.ts
// 데이터베이스 ORM (TypeORM, Prisma 등)을 사용한다면 해당 엔티티 파일(.entity.ts)에서도 동일하게 적용합니다.

export interface User {
  id: number; // 데이터베이스의 고유 ID
  kakaoId: string; // 카카오로부터 받은 고유 ID (문자열로 저장하는 것이 일반적)
  email?: string; // 카카오 동의 항목에 따라 없을 수 있으므로 optional
  nickname: string; // 카카오 프로필 닉네임
  profileImage?: string; // 카카오 프로필 이미지 URL
  createdAt: Date;
  updatedAt: Date;
  // ⭐⭐⭐ password 필드는 완전히 제거 ⭐⭐⭐
  // password?: string; // <-- 이 줄을 제거합니다.
}
