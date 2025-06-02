// src/types/naver-api.ts (또는 news.service.ts 내부에 정의)
export interface NaverNewsItem {
    title: string;
    originallink: string;
    link: string;
    description: string;
    pubDate: string; // "Mon, 03 Jun 2024 09:30:00 +0900" 형태
  }
  
  export interface NaverNewsApiResponse {
    lastBuildDate: string;
    total: number;
    start: number;
    display: number;
    items: NaverNewsItem[];
  }