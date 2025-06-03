import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
// StockDetail 대신 StockData를 임포트합니다.
import { StockSummary, StockData } from '../types/stock'; // 변경됨

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

  // 사용자 관심 종목 요약 정보를 가져오는 서비스 메서드 추가
  async getMockUserSummary(userId: number): Promise<StockSummary[]> {
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

  // 사용자 관심 종목 상세 정보를 가져오는 서비스 메서드 추가
  // 반환 타입을 StockDetail[] 에서 StockData[] 로 변경하고, 목업 데이터 구조를 StockData에 맞게 변경합니다.
  async getMockUserDetail(userId: number): Promise<StockData[]> { // 변경됨
    console.log(`UsersService: getMockUserDetail 호출됨 (사용자 ID: ${userId})`);
    // StockData 인터페이스에 맞는 목업 데이터를 반환합니다.
    const mockStockData: StockData = {
        name: '삼성전자',
        weatherSummary: 'AI 반도체 수요 급증으로 인한 긍정적인 전망입니다.',
        overallSentiment: 'VERY_POSITIVE',
        sentimentScore: 0.9,
        keywords: [{ text: 'HBM', sentiment: 'POSITIVE' }, { text: '파운드리', sentiment: 'NEUTRAL' }],
        reportSummary: '삼성전자의 HBM 반도체 기술 발전과 AI 시장 확대로 긍정적인 투자 의견이 지배적입니다.',
        articles: [], // 실제 사용 시에는 NewsArticleSummary 객체로 채워야 합니다.
        detailedAnalysis: '최근 삼성전자는 HBM3E 개발 성공 소식과 함께 AI 반도체 시장에서의 입지를 강화하고 있습니다. 이는 장기적인 성장 동력으로 작용할 것입니다.',
        investmentOpinion: { opinion: '매수', confidence: 0.92 },
        relatedStocks: [{ name: 'SK하이닉스', opinion: '추가 매수', confidence: 0.8 }],
        overallNewsSummary: '삼성전자 관련 뉴스들은 AI 반도체와 HBM 기술에 대한 긍정적인 평가가 많았습니다.',
    };

    return [mockStockData]; // StockData 객체 배열을 반환합니다.
  }
}