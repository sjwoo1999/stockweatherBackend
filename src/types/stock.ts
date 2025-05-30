// stockweather-backend/src/types/stock.ts (새로 생성 또는 업데이트)

export interface Article {
    title: string;
    summary: string;
    fullContent?: string;
  }
  
  export interface StockSearchResult {
    stockName: string;
    sentimentText: string;
    weatherImage: string; // 이미지 URL (예: /weather/sunny.png 또는 CDN URL)
    summaryText: string;
    keywords: string[];
    articles: Article[];
  }
  
  export interface StockSummaryItem {
    name: string;
    summary: string;
  }
  
  export interface StockSummary {
    date: string;
    overallSentiment: string;
    stocks: StockSummaryItem[];
  }
  
  export interface StockDetail {
    name: string;
    emoji: string; // 이모지 문자열 (예: '🔵')
    signal: string;
    percent: string;
    color: string; // Tailwind CSS 클래스 (예: 'text-blue-700')
  }