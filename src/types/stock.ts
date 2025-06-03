// stockweather-backend/src/types/stock.ts

// 뉴스 기사 요약 정보 인터페이스
export interface NewsArticleSummary {
    title: string;
    summary: string;
    url: string;
}

// 뉴스 기사 원본 데이터 인터페이스 (API 응답에서 직접 받아오는 형태)
export interface NewsArticle {
    title: string;
    link: string; // 기사 원본 링크
    // description과 pubDate를 선택적으로 변경합니다.
    description?: string; // ✨ 선택적 필드로 변경 (API에 따라 없을 수도 있음) ✨
    pubDate?: string; // ✨ 선택적 필드로 변경 (API에 따라 없을 수도 있음) ✨
    source?: string; // 뉴스 출처 (선택적)
    // 네이버 API에서 제공하는 'summary' 대신 'description'을 사용하거나,
    // 만약 'summary' 필드가 필요하다면 아래처럼 추가할 수 있습니다.
    // summary?: string; // 필요하다면 추가 (NewsArticleSummary의 summary와 혼동 주의)
}

// 키워드 감성 정보 인터페이스 (AI 분석 결과에 포함)
export interface KeywordSentiment {
    text: string; // 키워드 텍스트 (예: "HBM3", "갤럭시")
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; // 해당 키워드의 감성 분류
}

// 투자 의견 인터페이스 (AI 분석 결과에 포함)
export interface InvestmentOpinion {
    // 투자 의견의 가능한 값들을 정의합니다. '매수'와 '매도'를 추가했습니다.
    opinion: '매수' | '추가 매수' | '적정 매수' | '유지' | '적정 매도' | '추가 매도' | '매도';
    confidence: number; // 의견에 대한 AI의 신뢰도 (0.0 ~ 1.0 사이 값)
}

// 관련 종목 인터페이스 (AI 분석 결과에 포함)
export interface RelatedStock {
    name: string; // 관련 종목명
    // 관련 종목에 대한 의견의 가능한 값들을 정의합니다. '매수'와 '매도'를 추가했습니다.
    opinion: '매수' | '추가 매수' | '적정 매수' | '유지' | '적정 매도' | '추가 매도' | '매도';
    confidence: number; // 의견에 대한 AI의 신뢰도 (0.0 ~ 1.0 사이 값)
}

// AI 분석 서비스의 최종 결과 DTO (AIAnalysisService에서 반환하는 형태)
export interface AIAnalysisResult {
    weatherSummary: string; // 전반적인 주식 날씨 요약 텍스트 (예: "맑음", "흐림")
    overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED'; // 전반적인 시장/종목 감성
    sentimentScore: number; // 전반적인 감성 점수 (0.0 ~ 1.0)
    keywords: KeywordSentiment[]; // AI가 추출한 핵심 키워드 리스트와 감성
    reportSummary: string; // AI가 생성한 분석 보고서 요약
    detailedAnalysis: string; // AI가 생성한 상세 분석 내용
    investmentOpinion: InvestmentOpinion; // AI가 제시하는 투자 의견
    relatedStocks: RelatedStock[]; // AI가 분석한 관련 주식 정보
    weatherIcon: string; // 주식 날씨를 나타내는 아이콘 이름 (예: "sunny", "cloudy", "rainy")
}

// StockData 인터페이스 (주식 상세 정보를 묶는 컨테이너)
// 이 인터페이스는 StockWeatherResponseDto 내의 'stock' 필드에 사용됩니다.
export interface StockData {
    name: string; // 종목명 (예: "삼성전자", "카카오")
    weatherSummary: string; // AI 분석 요약 (텍스트)
    overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED'; // 전반적인 감성
    sentimentScore: number; // 감성 점수
    keywords: KeywordSentiment[]; // 핵심 키워드
    reportSummary: string; // 분석 보고서 요약
    articles: NewsArticleSummary[]; // 요약된 기사 리스트
    detailedAnalysis: string; // 상세 분석 내용
    investmentOpinion: InvestmentOpinion; // 투자 의견
    relatedStocks: RelatedStock[]; // 관련 종목
}

// StockWeatherResponseDto: 클라이언트(프론트엔드)에 최종적으로 반환할 응답 DTO
// 이전에 StockSearchResult로 불리던 것을 이 이름으로 통합했습니다.
export interface StockWeatherResponseDto {
    stock: StockData; // 주식 상세 데이터
    weatherIcon: string; // 전반적인 날씨 아이콘
    timestamp: string; // 응답 생성 시간 (ISO 8601 형식)
    disclaimer: string; // 법적 고지 또는 면책 조항
}

// 사용자 관심 종목 요약/상세 정보를 위한 타입 (기존과 동일하게 유지)
export interface UserStockSummaryItem {
    name: string;
    summary: string;
}

export interface StockSummary {
    date: string;
    overallSentiment: string;
    stocks: UserStockSummaryItem[];
}

export interface StockDetail {
    name: string;
    emoji: string;
    signal: string;
    percent: string;
    color: string;
}