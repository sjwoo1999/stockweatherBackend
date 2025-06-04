// stockweather-backend/src/types/stock.ts

// 이 파일은 백엔드에서 사용되는 모든 핵심 DTO 및 인터페이스를 정의합니다.

/**
 * 챗GPT API 응답을 위한 뉴스 기사 기본 인터페이스
 * 이는 NewsService에서 파싱된 기사 정보를 담습니다.
 */
export interface NewsArticle {
    title: string;
    originallink: string; // 원본 링크 (네이버, 구글 등 제공)
    link: string; // 실제 기사로 이동할 수 있는 링크 (originallink와 다를 수 있음)
    description: string;
    pubDate?: string; // 발행일 (RFC 2822 format 또는 ISO 8601 string)
    thumbnail?: string; // 기사 썸네일 URL
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN'; // 뉴스 자체의 감성 분석 결과
}

/**
 * AI 분석 결과를 담는 인터페이스
 * 이 인터페이스는 StockData와 매우 유사하지만, AI 서비스의 직접적인 응답 형태를 나타냅니다.
 * StockData는 최종 클라이언트에게 전달되는 형태로, AIAnalysisResult의 내용을 포함합니다.
 */
export interface AIAnalysisResult {
    weatherSummary: string; // AI가 생성한 날씨 요약 (한 문장)
    overallSentiment: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' | 'UNKNOWN'; // 전반적 감성
    sentimentScore: number; // 감성 점수 (0.0 ~ 1.0)
    keywords: KeywordSentiment[]; // 핵심 키워드 및 감성
    reportSummary: string; // 전체 분석 보고서 요약
    detailedAnalysis: { // 상세 분석 (객체 타입으로 변경)
        positiveFactors: string;
        negativeFactors: string;
        neutralFactors: string;
        overallOpinion: string;
    };
    investmentOpinion: InvestmentOpinion; // 투자 의견
    relatedStocks: RelatedStock[]; // 관련 주식
    overallNewsSummary?: string; // 전체 뉴스 요약 (AI가 생성)
}

/**
 * 키워드 및 해당 키워드의 감성 분석 결과
 */
export interface KeywordSentiment {
    text: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

/**
 * 투자 의견
 */
export interface InvestmentOpinion {
    opinion: '매수' | '적정 매수' | '관망' | '적정 매도' | '매도';
    confidence: number; // 0.0 ~ 1.0
    reason?: string; // 해당 의견의 근거
}

/**
 * 관련 주식 정보
 */
export interface RelatedStock {
    name: string;
    opinion: '매수' | '매도' | '유지' | '관망' | '추가 매수' | '적정 매수'; // 관련 주식에 대한 투자 의견 (AI가 제시)
    confidence: number; // 0.0 ~ 1.0
    relationship?: string; // 해당 주식과의 관계 (예: 경쟁사, 협력사)
}

/**
 * 뉴스 기사 요약 (클라이언트 전송용)
 * NewsArticle에서 클라이언트에 필요한 정보만 추려낸 형태입니다.
 */
export interface NewsArticleSummary {
    title: string;
    summary: string; // description에 해당
    url: string; // link에 해당
    thumbnailUrl?: string; // thumbnail에 해당
    sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'UNKNOWN'; // 뉴스 기사 자체의 감성
}

/**
 * 주식 데이터의 핵심 구조 (AI 분석 결과를 담는 최종 DTO)
 * 이 DTO는 클라이언트의 StockData와 동일한 구조를 가집니다.
 */
export interface StockData {
    name: string; // 종목명
    weatherSummary: string; // AI가 생성한 날씨 요약 (한 문장)
    overallSentiment: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE' | 'UNKNOWN'; // 전반적 감성
    sentimentScore: number; // 감성 점수 (0.0 ~ 1.0)
    keywords: KeywordSentiment[]; // 핵심 키워드 및 감성
    reportSummary: string; // 전체 분석 보고서 요약
    articles: NewsArticleSummary[]; // AI 분석에 사용된 뉴스 기사 요약 (클라이언트 전송용)
    detailedAnalysis: { // 상세 분석 (객체 타입)
        positiveFactors: string;
        negativeFactors: string;
        neutralFactors: string;
        overallOpinion: string;
    };
    investmentOpinion: InvestmentOpinion; // 투자 의견
    relatedStocks: RelatedStock[]; // 관련 주식
    overallNewsSummary?: string; // 전체 뉴스 요약 (AI가 생성)
}

/**
 * 클라이언트에 최종적으로 전송될 응답 DTO (WebSocket 응답 형식)
 */
export interface StockWeatherResponseDto {
    stock: StockData;
    weatherIcon: 'sunny' | 'partly-cloudy' | 'cloudy' | 'rainy' | 'stormy' | 'unknown';
    timestamp: string; // ISO 8601 형식의 타임스탬프
    disclaimer: string; // 면책 조항
    error?: string; // 오류 발생 시 오류 메시지
    query?: string; // 사용자가 검색한 원본 쿼리
    newsCount?: number; // 분석에 사용된 뉴스 기사 수
    socketId?: string; // 응답을 보낼 클라이언트의 Socket ID
}