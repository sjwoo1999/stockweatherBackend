// stockweather-backend/src/users/users.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { StockData, NewsArticleSummary } from '../types/stock'; // 🚨 NewsArticleSummary 임포트 추가

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

  async getMockUserSummary(userId: number): Promise<any[]> {
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

  async getMockUserDetail(userId: number): Promise<StockData[]> {
    console.log(`UsersService: getMockUserDetail 호출됨 (사용자 ID: ${userId})`);
    const mockStockData: StockData = {
        name: '삼성전자',
        weatherSummary: 'AI 반도체 수요 급증으로 인한 긍정적인 전망입니다.',
        overallSentiment: 'VERY_POSITIVE',
        sentimentScore: 0.9,
        keywords: [{ text: 'HBM', sentiment: 'POSITIVE' }, { text: '파운드리', sentiment: 'NEUTRAL' }],
        reportSummary: '삼성전자의 HBM 반도체 기술 발전과 AI 시장 확대로 긍정적인 투자 의견이 지배적입니다.',
        // 🚨 FIX 3: Add mock news articles here for display
        articles: [
            {
                title: '삼성전자, HBM3E 개발 성공... AI 반도체 시장 선점 가속화',
                summary: '삼성전자가 고대역폭 메모리 HBM3E 개발에 성공하며 AI 반도체 시장에서의 입지를 더욱 강화하고 있습니다. 이는 엔비디아 등 주요 고객사에 공급될 예정입니다.',
                url: 'https://mock-news.com/samsung-hbm3e',
                thumbnailUrl: 'https://mock-news.com/thumb-samsung.jpg',
                sentiment: 'POSITIVE'
            } as NewsArticleSummary, // Type assertion for clarity
            {
                title: '파운드리 사업, 미중 갈등 속 성장세 유지',
                summary: '미중 기술 갈등이 심화되는 가운데, 삼성전자 파운드리 사업부는 안정적인 고객 확보와 기술력으로 성장세를 이어가고 있다는 분석입니다.',
                url: 'https://mock-news.com/samsung-foundry',
                thumbnailUrl: 'https://mock-news.com/thumb-foundry.jpg',
                sentiment: 'NEUTRAL'
            } as NewsArticleSummary,
        ],
        detailedAnalysis: {
            positiveFactors: '최근 삼성전자는 HBM3E 개발 성공 소식과 함께 AI 반도체 시장에서의 입지를 강화하고 있습니다. 이는 장기적인 성장 동력으로 작용할 것입니다.',
            negativeFactors: '경쟁 심화와 글로벌 경기 둔화 가능성은 여전히 부정적인 요인으로 작용할 수 있습니다.',
            neutralFactors: '특정 뉴스에서 언급된 시장 동향이나 규제 변화 등은 단기적인 영향이 불확실합니다.',
            overallOpinion: '삼성전자는 HBM3E 개발과 AI 반도체 시장에서의 입지 강화로 긍정적인 성장 동력을 확보하고 있습니다. 그러나 경쟁 심화와 거시 경제 상황에 대한 지속적인 모니터링이 필요합니다.',
        },
        investmentOpinion: { opinion: '매수', confidence: 0.92 },
        relatedStocks: [{ name: 'SK하이닉스', opinion: '추가 매수', confidence: 0.8, relationship: '주요 경쟁사' }],
        overallNewsSummary: '삼성전자 관련 뉴스들은 AI 반도체와 HBM 기술에 대한 긍정적인 평가가 많았습니다.',
    };

    return [mockStockData];
  }

  async addFavoriteStock(userId: number, stockName: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.favoriteStocks) {
        user.favoriteStocks = [];
    }

    if (user.favoriteStocks.includes(stockName)) {
      throw new ConflictException('Stock already in favorites');
    }

    user.favoriteStocks.push(stockName);
    return this.usersRepository.save(user);
  }

  async removeFavoriteStock(userId: number, stockName: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.favoriteStocks || !user.favoriteStocks.includes(stockName)) {
        throw new NotFoundException('Stock not in favorites');
    }

    user.favoriteStocks = user.favoriteStocks.filter(stock => stock !== stockName);
    await this.usersRepository.save(user);
  }
}