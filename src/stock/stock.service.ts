// stockweather-backend/src/stock/stock.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { StockSearchResult } from '../types/stock';

@Injectable()
export class StockService {
  async searchStockInfo(query: string): Promise<StockSearchResult> {
    if (query.toLowerCase() === '삼성전자') {
      return {
        stockName: '삼성전자',
        sentimentText: '파란 하늘처럼, 삼성전자에도 긍정적인 기류가 감돌고 있어요.',
        weatherImage: '/weather/sunny.png',
        summaryText: '이번 주 ‘삼성전자’ 관련 뉴스에서 자주 언급된 키워드예요.\n무슨 일이 있었는지 아래 기사에서 확인해보세요!',
        keywords: [
          '갤럭시 S25 생산 확대',
          'AI 메모리 수요 급증',
          'HBM3E 양산 돌입',
          '미국 관세 정책 이슈',
        ],
        articles: [
          {
            title: '갤럭시 S25 시리즈 생산 330만 대로 확대',
            summary: '삼성전자가 미국 관세 이슈에 대응해 갤럭시 S25 생산량을 80만 대 추가해 총 330만 대로 확대할 예정입니다.',
            fullContent: '관세 리스크에 대비한 전략적 생산 증대 조치입니다.'
          },
          {
            title: 'HBM3E 메모리, AI 서버 수요로 주목',
            summary: 'AI 시장 확대에 따라 삼성전자가 12단 HBM3E를 빠르게 양산하며, 고용량 서버용 반도체 시장에서 경쟁력을 강화하고 있습니다.',
            fullContent: 'AI 수요 확대로 고부가가치 반도체 시장 선점 중입니다.'
          }
        ],
      };
    } else if (query.toLowerCase() === '카카오') {
        return {
            stockName: '카카오',
            sentimentText: '새로운 서비스와 함께, 카카오에 대한 기대감이 커지고 있어요.',
            weatherImage: '/weather/cloudy.png',
            summaryText: '이번 주 ‘카카오’ 관련 뉴스에서 자주 언급된 키워드예요.\n무슨 일이 있었는지 아래 기사에서 확인해보세요!',
            keywords: [
                '카카오톡 업데이트',
                'AI 챗봇 도입',
                '비즈니스 확장',
                '주가 상승 전망',
            ],
            articles: [
                {
                    title: '카카오톡, AI 챗봇 기능 도입 예고',
                    summary: '카카오톡이 대규모 업데이트를 통해 AI 챗봇 기능을 도입하여 사용자 편의성을 높일 예정입니다.',
                    fullContent: 'AI 기술을 활용한 서비스 고도화.'
                },
                {
                    title: '카카오 비즈니스 플랫폼, 새로운 시장 개척',
                    summary: '카카오가 비즈니스 플랫폼 확장을 통해 새로운 시장을 개척하며 매출 증대를 꾀하고 있습니다.',
                    fullContent: '다각화된 사업 모델로 성장 동력 확보.'
                }
            ],
        };
    }
    throw new NotFoundException(`Stock information for "${query}" not found.`);
  }
}