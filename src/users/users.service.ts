// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { StockSummary, StockDetail } from '../types/stock'; // 프론트엔드와 공유하는 타입

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByKakaoId(kakaoId: string): Promise<User | null> {
    console.log(`UsersService: findByKakaoId 호출됨 (카카오ID: ${kakaoId})`);
    return this.usersRepository.findOne({ where: { kakaoId } });
  }

  async createKakaoUser(userData: { kakaoId: string; nickname?: string; email?: string; profileImage?: string }): Promise<User> {
    console.log('UsersService: createKakaoUser 호출됨', userData);
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async findById(id: number): Promise<User | null> {
    console.log(`UsersService: findById 호출됨 (ID: ${id})`);
    return this.usersRepository.findOne({ where: { id } });
  }

  // ⭐ 사용자 관심 종목 요약 정보를 가져오는 서비스 메서드 추가 ⭐
  async getMockUserSummary(userId: number): Promise<StockSummary[]> {
    // 실제 DB에서 userId에 해당하는 관심 종목 요약 정보를 가져오는 로직
    // 여기서는 간단한 목업 데이터를 반환 (userId는 실제 사용 시 데이터를 필터링하는 데 사용)
    console.log(`UsersService: getMockUserSummary 호출됨 (사용자 ID: ${userId})`);
    return [
      {
        date: '2025년 05월 24일',
        overallSentiment: '오늘은 당신의 투자에 긍정적인 바람이 불고 있어요.',
        stocks: [
          { name: '삼성전자', summary: 'AI 메모리 수요 증가' },
          { name: '네이버', summary: '커머스+콘텐츠 동시 성장' },
          { name: '엔비디아', summary: 'AI 반도체 호조세 지속' },
        ],
      },
    ];
  }

  // ⭐ 사용자 관심 종목 상세 정보를 가져오는 서비스 메서드 추가 ⭐
  async getMockUserDetail(userId: number): Promise<StockDetail[]> {
    // 실제 DB에서 userId에 해당하는 관심 종목 상세 정보를 가져오는 로직
    // 여기서는 간단한 목업 데이터를 반환 (userId는 실제 사용 시 데이터를 필터링하는 데 사용)
    console.log(`UsersService: getMockUserDetail 호출됨 (사용자 ID: ${userId})`);
    return [
      { name: '삼성전자', emoji: '🔵', signal: '강력 매수', percent: '92%', color: 'text-blue-700' },
      { name: '네이버', emoji: '🔷', signal: '매수', percent: '82%', color: 'text-blue-500' },
      { name: '엔비디아', emoji: '⚪', signal: '중립', percent: '74%', color: 'text-gray-500' },
      { name: '테슬라', emoji: '🟠', signal: '비중 축소', percent: '65%', color: 'text-orange-500' },
      { name: '넷이즈', emoji: '🔴', signal: '매도', percent: '58%', color: 'text-red-500' },
    ];
  }
}