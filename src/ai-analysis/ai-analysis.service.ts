import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
// 필요한 모든 타입을 임포트합니다.
import { NewsArticle, AIAnalysisResult, InvestmentOpinion, RelatedStock, KeywordSentiment } from '../types/stock';

@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);

  /**
   * AI 분석을 수행하여 주식 관련 분석 결과 (AIAnalysisResult)를 반환합니다.
   * 현재는 목업(Mock) 데이터를 반환합니다.
   * @param stockName 분석할 종목명
   * @param articles 분석에 사용할 뉴스 기사 배열 (현재 목업에서는 articles는 주로 로그용)
   * @returns AIAnalysisResult AI 분석 결과 인터페이스
   */
  async analyzeStock(stockName: string, articles: NewsArticle[]): Promise<AIAnalysisResult> {
    this.logger.log(`[AIAnalysisService] Analyzing stock: ${stockName} with ${articles.length} articles.`);

    // ✨ 실제 AI 분석 로직이 들어갈 자리입니다.
    // 외부 AI API (예: OpenAI, Google Gemini) 호출, 데이터 전처리, 분석 로직 등이 여기에 구현됩니다.
    // 현재는 테스트 및 개발을 위해 목업 데이터를 반환합니다.
    // **TODO: 여기에 실제 LLM API 호출 및 응답 처리 로직 구현**

    const mockAIAnalysisResult: AIAnalysisResult = {
      weatherSummary: `${stockName}에 대한 AI 분석 결과입니다. 현재는 테스트 데이터입니다.`,
      overallSentiment: 'NEUTRAL', // 실제 AI 분석 결과에 따라 동적으로 결정
      sentimentScore: 0.5, // -1.0 ~ 1.0 (또는 0 ~ 100)
      keywords: [ // AI가 추출한 핵심 키워드 리스트
        { text: 'AI 반도체', sentiment: 'POSITIVE' },
        { text: '주가 하락', sentiment: 'NEGATIVE' },
        { text: '실적 발표', sentiment: 'NEUTRAL' },
      ],
      reportSummary: `${stockName} 관련 뉴스들을 종합 분석한 결과, 현재는 중립적인 분위기입니다. 최근 AI 반도체 관련 긍정적 소식이 있었으나, 전반적인 시장 불확실성으로 인해 주가 상승에는 제한이 있을 수 있습니다.`,
      detailedAnalysis: `AI 분석 상세 내용 (테스트). 실제로는 ${stockName}의 최근 뉴스 기사들을 바탕으로 심층 분석이 이루어집니다. 예를 들어, 삼성전자의 경우 HBM3 관련 기술 개발, 갤럭시 판매량 추이, 전반적인 반도체 업황 변화 등이 깊이 있게 분석될 수 있습니다. 각 키워드별로 어떤 뉴스에서 언급되었는지, 해당 뉴스의 감성은 어떠했는지 등에 대한 상세한 근거와 함께 분석 보고서가 생성됩니다. 현재는 개발 단계이므로 더미 데이터로 채워져 있습니다.`,
      investmentOpinion: {
        opinion: '유지',
        confidence: 0.7,
      },
      relatedStocks: [
        { name: 'SK하이닉스', opinion: '추가 매수', confidence: 0.8 },
        { name: 'LG전자', opinion: '유지', confidence: 0.6 },
        { name: '네이버', opinion: '적정 매수', confidence: 0.7 },
      ],
      overallNewsSummary: `[${stockName}] 주요 뉴스 요약: 최신 AI 기술 도입과 관련된 긍정적 기사들이 다수 관측되었지만, 전반적인 시장 상황은 변동성을 보이고 있어 신중한 접근이 요구됩니다.`,
    };

    // 실제 AI 분석이 시간이 오래 걸릴 수 있으므로 비동기 딜레이를 유지합니다.
    return new Promise(resolve => {
        setTimeout(() => resolve(mockAIAnalysisResult), 5000); // 5초 딜레이
    });
  }
}