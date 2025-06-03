// stockweather-backend/src/ai-analysis/ai-analysis.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
// src/types/stock.ts에서 필요한 모든 타입을 임포트합니다.
// KeywordSentiment를 사용하도록 변경했습니다.
import { NewsArticle, AIAnalysisResult, InvestmentOpinion, RelatedStock, KeywordSentiment } from '../types/stock';

@Injectable()
export class AIAnalysisService {
  /**
   * AI 분석을 수행하여 주식 관련 분석 결과를 반환합니다.
   * 현재는 목업(Mock) 데이터를 반환합니다.
   * @param stockName 분석할 종목명
   * @param articles 분석에 사용할 뉴스 기사 배열
   * @returns AIAnalysisResult AI 분석 결과 DTO
   */
  async analyzeStock(stockName: string, articles: NewsArticle[]): Promise<AIAnalysisResult> {
    console.log(`[AIAnalysisService] Analyzing stock: ${stockName} with ${articles.length} articles.`);

    // ✨ 실제 AI 분석 로직이 들어갈 자리입니다.
    // 외부 AI API 호출, 데이터 처리, 분석 로직 등이 여기에 구현됩니다.
    // 현재는 테스트 및 개발을 위해 목업 데이터를 반환합니다.
    return {
      weatherSummary: `${stockName}에 대한 AI 분석 결과입니다. 현재는 테스트 데이터입니다.`,
      overallSentiment: 'NEUTRAL', // 실제 AI 분석 결과에 따라 'POSITIVE', 'NEGATIVE', 'MIXED' 등
      sentimentScore: 0.5, // 0.0 ~ 1.0 사이의 감성 점수
      keywords: [ // AI가 추출한 핵심 키워드 리스트
        { text: 'AI 반도체', sentiment: 'POSITIVE' },
        { text: '주가 하락', sentiment: 'NEGATIVE' },
        { text: '실적 발표', sentiment: 'NEUTRAL' },
      ],
      reportSummary: `${stockName} 관련 뉴스들을 종합 분석한 결과, 현재는 중립적인 분위기입니다. 최근 AI 반도체 관련 긍정적 소식이 있었으나, 전반적인 시장 불확실성으로 인해 주가 상승에는 제한이 있을 수 있습니다.`,
      detailedAnalysis: `AI 분석 상세 내용 (테스트). 실제로는 ${stockName}의 최근 뉴스 기사들을 바탕으로 심층 분석이 이루어집니다. 예를 들어, 삼성전자의 경우 HBM3 관련 기술 개발, 갤럭시 판매량 추이, 전반적인 반도체 업황 변화 등이 깊이 있게 분석될 수 있습니다. 각 키워드별로 어떤 뉴스에서 언급되었는지, 해당 뉴스의 감성은 어떠했는지 등에 대한 상세한 근거와 함께 분석 보고서가 생성됩니다. 현재는 개발 단계이므로 더미 데이터로 채워져 있습니다.`,
      investmentOpinion: {
        opinion: '유지', // '매수', '매도', '유지' 등, types/stock.ts에 정의된 값 사용
        confidence: 0.7, // AI가 이 의견에 대해 갖는 신뢰도
      },
      relatedStocks: [
        { name: 'SK하이닉스', opinion: '추가 매수', confidence: 0.8 },
        { name: 'LG전자', opinion: '유지', confidence: 0.6 },
        { name: '네이버', opinion: '적정 매수', confidence: 0.7 },
      ],
      weatherIcon: 'cloudy', // 주식 날씨 아이콘 (예: 'sunny', 'partly-cloudy', 'cloudy', 'rainy', 'stormy')
    };
  }
}