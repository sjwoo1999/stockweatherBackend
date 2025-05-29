// src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users') // 데이터베이스 테이블 이름을 'users'로 지정
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true }) // 카카오 ID는 유니크해야 하며, string 타입으로 저장
  kakaoId: string;

  @Column({ nullable: true }) // 이메일은 카카오 동의에 따라 없을 수 있음
  email?: string; // TypeORM은 TypeScript의 ?를 nullable로 자동 인식하지 않으므로 @Column에 nullable: true 필요

  @Column() // 닉네임은 필수 (카카오에서 항상 제공한다고 가정하거나, 기본값 'Unknown'이 들어가도록 처리)
  nickname: string;

  @Column({ nullable: true }) // 프로필 이미지는 없을 수 있음
  profileImage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}