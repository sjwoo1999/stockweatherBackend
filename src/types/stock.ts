// stockweather-backend/src/types/stock.ts

// 뉴스 기사 원본 또는 검색 결과의 형태
export interface NewsArticle {
    title: string;
    originallink: string; // 네이버 뉴스 API에서 사용될 수 있음
    link: string; // 최종 링크 URL
    description: string; // 요약될 내용
    pubDate?: string; // 발행일 (옵셔널)
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN'; // 감성 초기값
    thumbnail?: string; // 썸네일 URL (옵셔널)
  }
  
  // AI가 요약한 뉴스 기사 정보 (프론트엔드로 전달될 형태)
  export interface NewsArticleSummary {
    title: string;
    summary: string; // AI가 요약한 내용
    url: string;
    thumbnailUrl?: string; // 썸네일 URL
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN'; // AI가 분석한 기사별 감성
  }
  
  // AI 분석 결과에 포함될 키워드 감성 정보
  export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }
  
  // AI 분석 결과에 포함될 투자 의견
  export interface InvestmentOpinion {
    opinion: '매수' | '매도' | '유지' | '관망';
    confidence: number; // 0.0 ~ 1.0
  }
  
  // AI 분석 결과에 포함될 관련 종목 정보
  export interface RelatedStock {
    name: string;
    opinion: '매수' | '매도' | '유지' | '관망' | '추가 매수' | '적정 매수'; // '추가 매수'와 '적정 매수' 추가
    confidence: number;
  }
  
  // ✨ AIAnalysisService가 반환하는 순수한 AI 분석 결과 인터페이스 ✨
  export interface AIAnalysisResult {
    weatherSummary: string;
    overallSentiment: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' | 'UNKNOWN';
    sentimentScore: number;
    keywords: KeywordSentiment[];
    reportSummary: string;
    detailedAnalysis: string;
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
    overallNewsSummary?: string; // ✨ AI가 요약한 전체 뉴스 요약 (새로 추가) ✨
  }
  
  // ✨ 최종적으로 클라이언트에 전송될 주식 날씨 데이터의 'stock' 부분 (DTO 내부) ✨
  export interface StockData {
    name: string;
    weatherSummary: string;
    overallSentiment: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' | 'UNKNOWN';
    sentimentScore: number;
    keywords: KeywordSentiment[];
    reportSummary: string;
    articles: NewsArticleSummary[]; // AI가 요약한 기사 목록
    detailedAnalysis: string;
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
    overallNewsSummary?: string; // ✨ AIAnalysisResult에서 받은 전체 뉴스 요약 ✨
  }
  
  // ✨ 클라이언트에 최종적으로 전송될 DTO (WebSocket 응답 형식) ✨
  export interface StockWeatherResponseDto {
    stock: StockData;
    weatherIcon: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'unknown'; // StockService에서 결정
    timestamp: string;
    disclaimer: string;
    error?: string; // 에러 발생 시 메시지
    query?: string; // 원래 사용자 검색어
    newsCount?: number; // 분석에 사용된 총 뉴스 기사 수 (추가 정보)
    socketId?: string; // ⭐️ 중요: 이 필드를 추가해야 합니다.
  }

  // ⭐ StockSummary 인터페이스를 추가합니다.
  export interface StockSummary {
    date?: string; // 예: '2025년 05월 24일'
    overallSentiment?: string; // 예: '오늘은 당신의 투자에 긍정적인 바람이 불고 있어요.'
    stocks: { // 관심 종목의 요약 정보를 담는 배열
      name: string;
      summary: string;
      // 필요하다면 여기에 더 많은 요약 정보를 추가할 수 있습니다.
    }[];
  }