// src/types/google-api.ts (또는 news.service.ts 내부에 정의)
export interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string; // 구글 API는 요약을 'snippet'으로 제공
  // 다른 필드 (displayLink, formattedUrl 등)는 필요에 따라 추가
}

export interface GoogleSearchApiResponse {
  kind: string;
  url: any;
  queries: any;
  context: any;
  searchInformation: any;
  items?: GoogleSearchItem[]; // items는 없을 수도 있으므로 ? 처리
}
