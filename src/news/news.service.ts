// stockweather-backend/src/news/news.service.ts

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { decode } from 'html-entities'; // HTML 엔티티 디코딩을 위해 추가

// src/types/stock.ts에서 정의된 NewsArticle 사용
import { NewsArticle } from '../types/stock';

// 네이버 API 응답 타입 정의
interface NaverNewsItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string; // RFC 2822 format
}
interface NaverNewsApiResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

// 구글 Custom Search API 응답 타입 정의 수정
interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string; // 요약 내용
  pagemap?: { // pagemap 추가
    metatags?: Array<{
      'article:published_time'?: string; // 뉴스 발행일 (일반적인 메타태그)
      'date'?: string; // 일반적인 날짜 메타태그
      'og:updated_time'?: string; // Open Graph updated time 메타태그
      'sailthru.date'?: string; // Sailthru 플랫폼 사용 시 날짜 메타태그
      'pubdate'?: string; // 추가적으로 'pubdate' 메타태그도 있을 수 있음
      'lastmodified'?: string; // 'lastmodified' 메타태그도 있을 수 있음
      'timestamp'?: string; // 'timestamp' 메타태그도 있을 수 있음
    }>;
    cse_image?: Array<{ // CSE가 인식한 이미지
      src?: string;
    }>;
    imageobject?: Array<{ // Schema.org ImageObject
      url?: string;
    }>;
  };
}
interface GoogleSearchApiResponse {
  items?: GoogleSearchItem[];
}

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly naverClientId: string;
  private readonly naverClientSecret: string;
  private readonly googleCseApiKey: string;
  private readonly googleCseId: string;

  constructor(private configService: ConfigService) {
    // 🚨 수정: get<string>()의 반환값이 undefined일 수 있으므로 기본값 할당
    this.naverClientId = this.configService.get<string>('NAVER_CLIENT_ID') || '';
    this.naverClientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET') || '';
    this.googleCseApiKey = this.configService.get<string>('GOOGLE_CSE_API_KEY') || '';
    this.googleCseId = this.configService.get<string>('GOOGLE_CSE_ID') || '';

    this.logger.log(`[NewsService] 초기화 - NAVER_CLIENT_ID 로드됨: ${!!this.naverClientId}`);
    this.logger.log(`[NewsService] 초기화 - NAVER_CLIENT_SECRET 로드됨: ${!!this.naverClientSecret}`);
    this.logger.log(`[NewsService] 초기화 - GOOGLE_CSE_API_KEY 로드됨: ${!!this.googleCseApiKey}`);
    this.logger.log(`[NewsService] 초기화 - GOOGLE_CSE_ID 로드됨: ${!!this.googleCseId}`);

    if (!this.naverClientId || !this.naverClientSecret) {
      this.logger.error('NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET 환경 변수가 설정되지 않았습니다. 네이버 뉴스 검색이 비활성화됩니다.');
    }
    if (!this.googleCseApiKey || !this.googleCseId) {
      this.logger.warn('GOOGLE_CSE_API_KEY 또는 GOOGLE_CSE_ID 환경 변수가 설정되지 않았습니다. 구글 뉴스 검색이 비활성화됩니다.');
    }
  }

  private removeHtmlTags(text: string): string {
    return decode(text.replace(/<[^>]*>/g, ''));
  }

  async searchNaverNews(
    query: string,
    display: number = 50, // 네이버는 최대 100개까지 가능
    sort: 'sim' | 'date' = 'date',
  ): Promise<NewsArticle[]> {
    if (!this.naverClientId || !this.naverClientSecret) {
        this.logger.warn('[NewsService] 네이버 API 키가 없어 네이버 뉴스 검색을 건너뜜.');
        return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const apiUrl = `https://openapi.naver.com/v1/search/news.json?query=${encodedQuery}&display=${display}&sort=${sort}`;
      this.logger.debug(`[NewsService] Naver News API 요청 URL: ${apiUrl}`);

      const response = await axios.get<NaverNewsApiResponse>(apiUrl, {
        headers: {
          'X-Naver-Client-Id': this.naverClientId,
          'X-Naver-Client-Secret': this.naverClientSecret,
        },
      });

      // 🚨 디버깅: 네이버 API 응답 전체 로깅
      this.logger.debug(`[NewsService] 네이버 API 응답 (total: ${response.data.total}, items length: ${response.data.items?.length}): ${JSON.stringify(response.data).substring(0, 500)}...`);

      const articles: NewsArticle[] = (response.data.items || []).map((item: NaverNewsItem) => ({
        title: this.removeHtmlTags(item.title),
        originallink: item.originallink,
        link: item.link,
        description: this.removeHtmlTags(item.description),
        pubDate: item.pubDate,
        thumbnail: undefined, // 네이버 뉴스 API에는 썸네일 필드가 없음
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
    num: number = 10, // Google CSE는 한 번에 최대 10개까지 가져올 수 있습니다.
  ): Promise<NewsArticle[]> {
    if (!this.googleCseApiKey || !this.googleCseId) {
      this.logger.warn('[NewsService] 구글 API 키 또는 CSE ID가 설정되지 않아 구글 뉴스 검색을 건너뜜.');
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      // 🚨 수정된 부분: `&searchType=news` 파라미터를 제거했습니다.
      // Google Custom Search API는 이 파라미터를 직접 지원하지 않습니다.
      // 뉴스 검색은 Custom Search Engine의 설정(검색할 사이트 지정 등)에 의존합니다.
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleCseApiKey}&cx=${this.googleCseId}&q=${encodedQuery}&num=${num}&alt=json`;
      this.logger.debug(`[NewsService] Google News API 요청 URL: ${apiUrl}`);

      const response = await axios.get<GoogleSearchApiResponse>(apiUrl);

      // 🚨 디버깅: 구글 API 응답 전체 로깅
      this.logger.debug(`[NewsService] 구글 API 응답 (items length: ${response.data.items?.length}): ${JSON.stringify(response.data).substring(0, 500)}...`);

      const articles: NewsArticle[] = (response.data.items || []).map((item: GoogleSearchItem) => {
        // 여러 메타태그에서 날짜를 시도하여 가져옵니다.
        const pubDate = item.pagemap?.metatags?.[0]?.['article:published_time']
                      || item.pagemap?.metatags?.[0]?.['date']
                      || item.pagemap?.metatags?.[0]?.['og:updated_time']
                      || item.pagemap?.metatags?.[0]?.['sailthru.date']
                      || item.pagemap?.metatags?.[0]?.['pubdate'] // 추가된 날짜 메타태그
                      || item.pagemap?.metatags?.[0]?.['lastmodified'] // 추가된 날짜 메타태그
                      || item.pagemap?.metatags?.[0]?.['timestamp'] // 추가된 날짜 메타태그
                      || undefined;

        // 여러 메타태그에서 썸네일을 시도하여 가져옵니다.
        const thumbnail = item.pagemap?.cse_image?.[0]?.src
                        || item.pagemap?.imageobject?.[0]?.url
                        || undefined;

        return {
          title: this.removeHtmlTags(item.title),
          originallink: item.link,
          link: item.link,
          description: this.removeHtmlTags(item.snippet),
          pubDate: pubDate, // 문자열 형태의 날짜
          thumbnail: thumbnail,
          sentiment: 'UNKNOWN',
        };
      });

      this.logger.log(`[NewsService] 구글 뉴스 검색 성공: '${query}', ${articles.length}개 기사`);
      return articles;
    } catch (error) {
      this.logger.error(`[NewsService] 구글 뉴스 검색 실패: '${query}', 에러: ${error.message}, 응답 데이터: ${error.response?.data ? JSON.stringify(error.response.data) : '없음'}`);
      return [];
    }
  }

  async searchAllNews(query: string, limit: number = 20): Promise<NewsArticle[]> {
    this.logger.log(`[NewsService] 모든 뉴스 검색 시작: '${query}', 목표 ${limit}개 기사`);

    // Google CSE는 한 번에 최대 10개이므로, 각 API에 대해 적절한 요청 수를 전달합니다.
    const naverLimit = limit;
    const googleLimit = Math.min(limit, 10); // Google CSE는 최대 10개

    const [naverResult, googleResult] = await Promise.allSettled([
      this.searchNaverNews(query, naverLimit, 'date'), // 네이버는 최신순 'date'로 정렬 요청
      this.searchGoogleNews(query, googleLimit),
    ]);

    let allArticles: NewsArticle[] = [];

    if (naverResult.status === 'fulfilled') {
      allArticles = allArticles.concat(naverResult.value);
      this.logger.debug(`[NewsService] 네이버 뉴스 검색 ${naverResult.value.length}개 추가됨.`);
    } else {
      this.logger.warn(`[NewsService] 네이버 뉴스 검색 Promise rejected: ${naverResult.reason}`);
    }

    if (googleResult.status === 'fulfilled') {
      allArticles = allArticles.concat(googleResult.value);
      this.logger.debug(`[NewsService] 구글 뉴스 검색 ${googleResult.value.length}개 추가됨.`);
    } else {
      this.logger.warn(`[NewsService] 구글 뉴스 검색 Promise rejected: ${googleResult.reason}`);
    }

    // 링크(link)를 기준으로 중복 제거
    const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.link, article])).values());
    this.logger.debug(`[NewsService] 중복 제거 후 총 ${uniqueArticles.length}개 기사.`);

    // pubDate를 기준으로 최신순 정렬 (유효하지 않은 날짜는 가장 오래된 것으로 간주)
    uniqueArticles.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA; // 내림차순 (최신순)
    });

    // 요청된 limit 개수만큼만 잘라내기
    const articlesForAI = uniqueArticles.slice(0, limit);
    this.logger.log(`[NewsService] 통합 뉴스 검색 완료: '${query}', 최종 ${articlesForAI.length}개 기사 (AI 분석용)`);

    return articlesForAI;
  }
}