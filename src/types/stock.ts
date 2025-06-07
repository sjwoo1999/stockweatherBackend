// stockweather-backend/src/types/stock.ts

// 이 파일은 백엔드에서 사용되는 모든 핵심 DTO 및 인터페이스를 정의합니다.

/**
 * AI 분석 결과를 담는 인터페이스
 * 이 인터페이스는 StockData와 매우 유사하지만, AI 서비스의 직접적인 응답 형태를 나타냅니다.
 * StockData는 최종 클라이언트에게 전달되는 형태로, AIAnalysisResult의 내용을 포함합니다.
 */
export interface AIAnalysisResult {
  weatherSummary: string; // AI가 생성한 날씨 요약 (한 문장)
  overallSentiment:
    | 'VERY_POSITIVE'
    | 'POSITIVE'
    | 'NEUTRAL'
    | 'NEGATIVE'
    | 'VERY_NEGATIVE'
    | 'UNKNOWN'; // 전반적 감성
  sentimentScore: number; // 감성 점수 (0.0 ~ 1.0)
  keywords: KeywordSentiment[]; // 핵심 키워드 및 감성
  reportSummary: string; // 전체 분석 보고서 요약
  detailedAnalysis: {
    // 상세 분석 (객체 타입으로 변경)
    positiveFactors: string;
    negativeFactors: string;
    neutralFactors: string;
    overallOpinion: string;
  };
  investmentOpinion: InvestmentOpinion; // 투자 의견
  relatedStocks: RelatedStock[]; // 관련 주식
  overallNewsSummary: string; // ⭐ 추가: AI 프롬프트 및 사용 코드에 맞춰 이 필드를 추가합니다. ⭐
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
  // 백엔드의 AI 분석 결과에 따라 opinion 필드가 '매수' | '매도' | '유지' | '관망' | '추가 매수' | '적정 매수'
  // 중 하나로 올 수 있으므로, 이를 반영합니다.
  opinion: '매수' | '매도' | '유지' | '관망' | '추가 매수' | '적정 매수';
  confidence: number; // 0.0 ~ 1.0
  relationship?: string; // 해당 주식과의 관계 (예: 경쟁사, 협력사)
}

// DisclosureItem 인터페이스는 `src/disclosure/interfaces/disclosure-item.interface.ts`에서 임포트되므로
// 이 파일에서는 제거하는 것이 올바른 구조입니다.
// 하지만 StockData에 `articles` 필드가 DisclosureItem 배열 타입을 가지므로,
// 만약 StockData 정의 시 `DisclosureItem`을 직접 임포트할 수 없다면 여기에 정의하거나,
// `StockData`의 `articles` 필드를 `any[]` 등으로 임시 처리할 수도 있습니다.
// 여기서는 `src/disclosure/interfaces/disclosure-item.interface.ts`에서 임포트하여 사용하는 것을 전제로 합니다.
// (또는 프론트엔드와 일관성을 위해 여기에 다시 정의할 수도 있습니다.)
// 백엔드에서 DisclosureService로부터 DisclosureItem을 직접 가져온다면, 아래처럼 임포트할 수 있습니다.
import { DisclosureItem } from '../disclosure/interfaces/disclosure-item.interface';

/**
 * 주식 데이터의 핵심 구조 (AI 분석 결과를 담는 최종 DTO)
 * 이 DTO는 클라이언트의 StockData와 동일한 구조를 가집니다.
 */
export interface StockData {
  name: string; // 종목명
  code?: string; // DART 고유번호 또는 종목 코드 (선택적, 클라이언트 필요시 사용)
  weatherSummary: string; // AI가 생성한 날씨 요약 (한 문장)
  overallSentiment:
    | 'VERY_POSITIVE'
    | 'POSITIVE'
    | 'NEUTRAL'
    | 'NEGATIVE'
    | 'VERY_NEGATIVE'
    | 'UNKNOWN'; // 전반적 감성
  sentimentScore: number; // 감성 점수 (0.0 ~ 1.0)
  keywords: KeywordSentiment[]; // 핵심 키워드 및 감성
  reportSummary: string; // 전체 분석 보고서 요약
  articles?: DisclosureItem[]; // ⭐ 추가: StockService의 오류 해결을 위해 이 필드를 추가합니다. ⭐
  detailedAnalysis: {
    // 상세 분석 (객체 타입)
    positiveFactors: string;
    negativeFactors: string;
    neutralFactors: string;
    overallOpinion: string;
  };
  investmentOpinion: InvestmentOpinion; // 투자 의견
  relatedStocks: RelatedStock[]; // 관련 주식
  overallNewsSummary?: string; // ⭐ 추가: AIAnalysisResult에서 받아올 수 있으므로 추가합니다 (선택적). ⭐
}

/**
 * 클라이언트에 최종적으로 전송될 응답 DTO (WebSocket 응답 형식)
 */
export interface StockWeatherResponseDto {
  stock: StockData;
  weatherIcon:
    | 'sunny'
    | 'partly-cloudy'
    | 'cloudy'
    | 'rainy'
    | 'stormy'
    | 'unknown';
  timestamp: string; // ISO 8601 형식의 타임스탬프
  disclaimer: string; // 면책 조항
  error?: string; // 오류 발생 시 오류 메시지
  query: string; // ⭐ 필수: 사용자가 검색한 원본 쿼리 (클라이언트에서 사용) ⭐
  socketId: string; // ⭐ 필수: 응답을 보낼 클라이언트의 Socket ID (클라이언트에서 필터링에 사용) ⭐
  newsCount?: number | null; // ⭐ 추가: StockService의 오류 해결을 위해 이 필드를 추가합니다. ⭐
}
