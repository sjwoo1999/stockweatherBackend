import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

// src/types/stock.ts에서 정의된 NewsArticle 사용
import { NewsArticle } from '../types/stock';

// 네이버 API 응답 타입 정의
interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string; // RFC 2822 format
  // 네이버 API 응답에 thumbnail 필드는 없음
}
interface NaverNewsApiResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

// 구글 Custom Search API 응답 타입 정의
interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string; // 요약 내용
  // 구글 Custom Search API 응답에 pubDate나 thumbnail 필드는 명시적으로 없음
}
interface GoogleSearchApiResponse {
  items?: GoogleSearchItem[];
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private configService: ConfigService) {
    const naverClientId = this.configService.get<string>('NAVER_CLIENT_ID');
    const naverClientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');
    const googleCseApiKey = this.configService.get<string>('GOOGLE_CSE_API_KEY');
    const googleCseId = this.configService.get<string>('GOOGLE_CSE_ID');

    this.logger.log(`[NewsService] 초기화 - NAVER_CLIENT_ID 로드됨: ${!!naverClientId}`);
    this.logger.log(`[NewsService] 초기화 - NAVER_CLIENT_SECRET 로드됨: ${!!naverClientSecret}`);
    this.logger.log(`[NewsService] 초기화 - GOOGLE_CSE_API_KEY 로드됨: ${!!googleCseApiKey}`);
    this.logger.log(`[NewsService] 초기화 - GOOGLE_CSE_ID 로드됨: ${!!googleCseId}`);

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
        this.logger.warn('[NewsService] 네이버 API 키가 없어 네이버 뉴스 검색을 건너뜜.');
        return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodedQuery}&display=${display}&sort=${sort}`;
      this.logger.debug(`[NewsService] Naver News API URL: ${apiUrl}`);

      const response = await axios.get<NaverNewsApiResponse>(apiUrl, {
        headers: {
          'X-Naver-Client-Id': naverClientId,
          'X-Naver-Client-Secret': naverClientSecret,
        },
      });

      const articles: NewsArticle[] = response.data.items.map((item: NaverNewsItem) => ({
        title: this.removeHtmlTags(item.title),
        originallink: item.originallink,
        link: item.link,
        description: this.removeHtmlTags(item.description),
        pubDate: item.pubDate,
        thumbnail: undefined, // 네이버 뉴스 API에는 썸네일 필드가 없으므로 undefined
        sentiment: 'UNKNOWN', // 초기 감성은 알 수 없음으로 설정
      }));
      
      this.logger.log(`[NewsService] 네이버 뉴스 검색 성공: '${query}', ${articles.length}개 기사`);
      return articles;
    } catch (error) {
      this.logger.error(`[NewsService] 네이버 뉴스 검색 실패: '${query}', 에러: ${error.message}, 응답 데이터: ${error.response?.data ? JSON.stringify(error.response.data) : '없음'}`);
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
      this.logger.warn('[NewsService] 구글 API 키 또는 CSE ID가 설정되지 않아 구글 뉴스 검색을 건너뜜.');
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${googleCseApiKey}&cx=${googleCseId}&q=${encodedQuery}&num=${num}&alt=json`;
      this.logger.debug(`[NewsService] Google News API URL: ${apiUrl}`);

      const response = await axios.get<GoogleSearchApiResponse>(apiUrl);

      const articles: NewsArticle[] = response.data.items?.map((item: GoogleSearchItem) => ({
        title: this.removeHtmlTags(item.title),
        originallink: item.link,
        link: item.link,
        description: this.removeHtmlTags(item.snippet),
        pubDate: undefined, // 구글 Custom Search API에는 pubDate 필드가 명시적으로 없음
        thumbnail: undefined, // 구글 Custom Search API에는 썸네일 필드가 명시적으로 없음
        sentiment: 'UNKNOWN', // 초기 감성은 알 수 없음으로 설정
      })) || [];

      this.logger.log(`[NewsService] 구글 뉴스 검색 성공: '${query}', ${articles.length}개 기사`);
      return articles;
    } catch (error) {
      this.logger.error(`[NewsService] 구글 뉴스 검색 실패: '${query}', 에러: ${error.message}, 응답 데이터: ${error.response?.data ? JSON.stringify(error.response.data) : '없음'}`);
      return [];
    }
  }

  async searchAllNews(query: string, limit: number = 20): Promise<NewsArticle[]> {
    this.logger.log(`[NewsService] 모든 뉴스 검색 시작: '${query}'`);
    const [naverResult, googleResult] = await Promise.allSettled([
      this.searchNaverNews(query),
      this.searchGoogleNews(query),
    ]);

    let allArticles: NewsArticle[] = [];

    if (naverResult.status === 'fulfilled') {
      allArticles = allArticles.concat(naverResult.value);
    } else {
      this.logger.warn(`[NewsService] 네이버 뉴스 검색 Promise rejected: ${naverResult.reason}`);
    }

    if (googleResult.status === 'fulfilled') {
      allArticles = allArticles.concat(googleResult.value);
    } else {
      this.logger.warn(`[NewsService] 구글 뉴스 검색 Promise rejected: ${googleResult.reason}`);
    }

    // `link` 필드를 기준으로 중복 제거
    const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.link, article])).values());

    // pubDate가 있는 경우에만 정렬에 포함 (없는 경우 0으로 처리하여 맨 뒤로)
    uniqueArticles.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA; // 최신순 정렬
    });

    const articlesForAI = uniqueArticles.slice(0, limit);
    this.logger.log(`[NewsService] 통합 뉴스 검색 완료: '${query}', 최종 ${articlesForAI.length}개 기사`);

    return articlesForAI;
  }

  private removeHtmlTags(text: string): string {
    return text.replace(/<[^>]*>/g, '');
  }
}