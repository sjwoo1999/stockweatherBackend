// src/ai-analysis/ai-analysis.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
// ✨ 이 라인을 추가하고, 기존에 여기에 있던 NewsArticle, AIAnalysisResult 정의는 삭제합니다. ✨
import { NewsArticle, AIAnalysisResult, InvestmentOpinion, RelatedStock } from '../types/stock';


// ✨ 기존에 여기에 있던 export interface AIAnalysisResult { ... } 부분은 삭제합니다. ✨
// 이 파일을 열어보시고 이 코드가 있다면 제거해주세요.

@Injectable()
export class AIAnalysisService {
  // ✨ analyzeStock 메서드의 인자 순서를 변경합니다. ✨
  // stock.service.ts의 호출부와 일치하도록 (primaryName, articles) 순서로 변경
  async analyzeStock(stockName: string, articles: NewsArticle[]): Promise<AIAnalysisResult> {
    console.log(`[AIAnalysisService] Analyzing stock: ${stockName} with ${articles.length} articles.`);

    return {
      weatherSummary: `${stockName}에 대한 AI 분석 결과입니다. 현재는 테스트 데이터입니다.`,
      overallSentiment: 'NEUTRAL',
      sentimentScore: 0.5,
      keywords: [{ text: '테스트 키워드', sentiment: 'NEUTRAL' }],
      reportSummary: 'AI 분석 결과 요약 (테스트).',
      detailedAnalysis: 'AI 분석 상세 내용 (테스트). 실제로는 뉴스 기사들을 바탕으로 심층 분석이 이루어집니다. 예를 들어, 삼성전자의 경우 HBM3, 갤럭시 판매량, 반도체 업황 등이 심도있게 분석될 수 있습니다.',
      investmentOpinion: { // ✨ InvestmentOpinion 타입 사용 ✨
        opinion: '유지',
        confidence: 0.7,
      },
      // ✨ relatedStocks 타입을 src/types/stock.ts의 RelatedStock[]과 일치시킵니다. ✨
      relatedStocks: [
        { name: '네이버', opinion: '유지', confidence: 0.6 }, // code 필드는 제거됨
      ],
      // ✨ AIAnalysisResult 인터페이스에 정의된 weatherIcon 필드를 더미 데이터에 추가합니다. ✨
      weatherIcon: 'cloudy', // 예시로 추가. 실제 AI 분석 결과에 따라 달라짐.
      // ✨ AIAnalysisResult 인터페이스에 disclaimer 필드가 없으므로 제거하거나 AIAnalysisResult에 추가해야 함 ✨
      // disclaimer는 StockWeatherResponseDto에 이미 있으므로 여기서는 제거하는 것이 일반적
      // disclaimer: "본 분석은 AI 기반 예측치이며, 실제 투자 결과와 무관합니다. 투자 결정은 반드시 본인의 판단과 책임 하에 이루어져야 합니다.",
    };
  }
}