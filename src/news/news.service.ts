// stockweather-backend/src/news/news.service.ts

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

// ✨ 이 라인을 추가합니다. ✨
import { NewsArticle } from '../types/stock'; // src/types/stock.ts에서 정의된 NewsArticle 사용

// 네이버 API 응답 타입 정의 (기존과 동일)
interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}
interface NaverNewsApiResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

// 구글 Custom Search API 응답 타입 정의 (기존과 동일)
interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
}
interface GoogleSearchApiResponse {
  items?: GoogleSearchItem[];
}

// ✨ 기존에 여기에 있던 export interface NewsArticle { ... } 부분은 삭제합니다. ✨
// 이 파일을 열어보시고 이 코드가 있다면 제거해주세요.

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private configService: ConfigService) {
    const naverClientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const naverClientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');
    const googleCseApiKey = this.configService.get<string>('GOOGLE_CSE_API_KEY');
    const googleCseId = this.configService.get<string>('GOOGLE_CSE_ID');

    this.logger.log(`NewsService 초기화 - NAVER_CLIENT_ID 로드됨: ${!!naverClientId}`);
    this.logger.log(`NewsService 초기화 - NAVER_CLIENT_SECRET 로드됨: ${!!naverClientSecret}`);
    this.logger.log(`NewsService 초기화 - GOOGLE_CSE_API_KEY 로드됨: ${!!googleCseApiKey}`);
    this.logger.log(`NewsService 초기화 - GOOGLE_CSE_ID 로드됨: ${!!googleCseId}`);

    if (!naverClientId || !naverClientSecret) {
      this.logger.error('NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경 변수가 설정되지 않았습니다.');
    }
    if (!googleCseApiKey || !googleCseId) {
      this.logger.warn('GOOGLE_CSE_API_KEY 또는 GOOGLE_CSE_ID 환경 변수가 설정되지 않았습니다. 구글 뉴스 검색은 동작하지 않을 수 있습니다.');
    }
  }

  async searchNaverNews(
    query: string,
    display: number = 50,
    sort: 'sim' | 'date' = 'date',
  ): Promise<NewsArticle[]> {
    const naverClientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const naverClientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');

    if (!naverClientId || !naverClientSecret) {
        this.logger.warn('네이버 API 키가 없어 네이버 뉴스 검색을 건너뜜.');
        return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodedQuery}&display=${display}&sort=${sort}`;
      this.logger.debug(`Naver News API URL: ${apiUrl}`);

      const response = await axios.get<NaverNewsApiResponse>(apiUrl, {
        headers: {
          'X-Naver-Client-Id': naverClientId,
          'X-Naver-Client-Secret': naverClientSecret,
        },
      });

      // ✨ 반환되는 NewsArticle[]의 각 요소가 src/types/stock.ts의 NewsArticle 형태와 일치하도록 매핑 ✨
      const articles: NewsArticle[] = response.data.items.map((item: NaverNewsItem) => ({
        title: this.removeHtmlTags(item.title),
        summary: this.removeHtmlTags(item.description), // summary는 필수 아님 (Optional)
        link: item.originallink || item.link, // link는 필수 (Required)
        // pubDate, source는 NewsArticle에 선택적(Optional)으로 정의되어 있다면 추가 가능
        pubDate: item.pubDate,
        source: 'Naver News',
      }));

      this.logger.log(`네이버 뉴스 검색 성공: '${query}', ${articles.length}개 기사`);
      return articles;
    } catch (error) {
      this.logger.error(`네이버 뉴스 검색 실패: '${query}', 에러: ${error.message}, 응답 데이터: ${error.response?.data ? JSON.stringify(error.response.data) : '없음'}`);
      return [];
    }
  }

  async searchGoogleNews(
    query: string,
    num: number = 10,
  ): Promise<NewsArticle[]> {
    const googleCseApiKey = this.configService.get<string>('GOOGLE_CSE_API_KEY');
    const googleCseId = this.configService.get<string>('GOOGLE_CSE_ID');

    if (!googleCseApiKey || !googleCseId) {
      this.logger.warn('구글 API 키 또는 CSE ID가 설정되지 않아 구글 뉴스 검색을 건너뜜.');
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${googleCseApiKey}&cx=${googleCseId}&q=${encodedQuery}&num=${num}&alt=json`;
      this.logger.debug(`Google News API URL: ${apiUrl}`);

      const response = await axios.get<GoogleSearchApiResponse>(apiUrl);

      // ✨ 반환되는 NewsArticle[]의 각 요소가 src/types/stock.ts의 NewsArticle 형태와 일치하도록 매핑 ✨
      const articles: NewsArticle[] = response.data.items?.map((item: GoogleSearchItem) => ({
        title: this.removeHtmlTags(item.title),
        summary: this.removeHtmlTags(item.snippet), // summary는 필수 아님 (Optional)
        link: item.link, // link는 필수 (Required)
        source: 'Google News',
      })) || [];

      this.logger.log(`구글 뉴스 검색 성공: '${query}', ${articles.length}개 기사`);
      return articles;
    } catch (error) {
      this.logger.error(`구글 뉴스 검색 실패: '${query}', 에러: ${error.message}, 응답 데이터: ${error.response?.data ? JSON.stringify(error.response.data) : '없음'}`);
      return [];
    }
  }

  async searchAllNews(query: string, limit: number = 20): Promise<NewsArticle[]> {
    this.logger.log(`모든 뉴스 검색 시작: '${query}'`);
    const [naverResult, googleResult] = await Promise.allSettled([
      this.searchNaverNews(query),
      this.searchGoogleNews(query),
    ]);

    let allArticles: NewsArticle[] = [];

    if (naverResult.status === 'fulfilled') {
      allArticles = allArticles.concat(naverResult.value);
    } else {
      this.logger.warn(`네이버 뉴스 검색 Promise rejected: ${naverResult.reason}`);
    }

    if (googleResult.status === 'fulfilled') {
      allArticles = allArticles.concat(googleResult.value);
    } else {
      this.logger.warn(`구글 뉴스 검색 Promise rejected: ${googleResult.reason}`);
    }

    // `url` 필드를 기준으로 중복 제거 (NewsArticleSummary 대신 NewsArticle 타입 사용)
    const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.link, article])).values()); // ✨ url 대신 link 사용 ✨

    uniqueArticles.sort((a, b) => {
        // pubDate가 NewsArticle에 optional로 정의되어 있다면, 없을 경우 0으로 처리
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA;
    });

    const articlesForAI = uniqueArticles.slice(0, limit);
    this.logger.log(`통합 뉴스 검색 완료: '${query}', 최종 ${articlesForAI.length}개 기사`);

    return articlesForAI;
  }

  private removeHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }
}