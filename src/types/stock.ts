// src/types/stock.ts

// 뉴스 기사 요약 정보 (기존)
export interface NewsArticleSummary {
    title: string;
    summary: string;
    url: string;
}

// ✨ 수정: NewsArticle에 pubDate?: string; 추가 ✨
export interface NewsArticle {
    title: string;
    link: string; // 또는 url
    summary?: string; // 선택적
    pubDate?: string; // ✨ 이 필드를 추가합니다. 날짜 정렬에 사용됩니다. ✨
    source?: string; // 선택적
}

// 키워드 감성 정보 (기존)
export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

// 투자 의견 (기존)
export interface InvestmentOpinion {
    opinion: '추가 매수' | '적정 매수' | '유지' | '적정 매도' | '추가 매도';
    confidence: number; // 0.0 ~ 1.0 (의견에 대한 AI의 확신도)
}

// 관련 종목 (기존)
export interface RelatedStock {
    name: string;
    opinion: '추가 매수' | '적정 매수' | '유지' | '적정 매도' | '추가 매도';
    confidence: number;
}

// AI 분석 결과 타입 (기존)
export interface AIAnalysisResult {
    weatherSummary: string;
    overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
    sentimentScore: number;
    keywords: KeywordSentiment[];
    reportSummary: string;
    detailedAnalysis: string;
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
    weatherIcon: string;
}

// StockData 인터페이스 (기존)
export interface StockData {
    name: string;
    weatherSummary: string;
    overallSentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';
    sentimentScore: number;
    keywords: KeywordSentiment[];
    reportSummary: string;
    articles: NewsArticleSummary[];
    detailedAnalysis: string;
    investmentOpinion: InvestmentOpinion;
    relatedStocks: RelatedStock[];
}

// ✨ StockSearchResult 인터페이스 (API 응답의 최종 형태) - export 키워드 확인! ✨
export interface StockSearchResult {
    stock: StockData;
    weatherIcon: string;
    timestamp: string;
    disclaimer: string;
}

// 사용자 관심 종목 요약/상세 정보를 위한 타입 (기존)
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

export interface StockWeatherResponseDto{
    stock: StockData;
    weatherIcon: string;
    timestamp: string;
    disclaimer: string;
}