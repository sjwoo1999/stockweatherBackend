// stockweather-backend/src/news/news.service.ts

import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { decode } from 'html-entities';

import { NewsArticle } from '../types/stock';

interface CustomAxiosError {
  response?: {
    status?: number;
    data?: any;
  };
  message: string;
}

function hasResponseAndStatus(error: unknown): error is CustomAxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    (error as any).response !== null &&
    'status' in (error as any).response
  );
}

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

interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  pagemap?: {
    metatags?: Array<{
      'article:published_time'?: string;
      'date'?: string;
      'og:updated_time'?: string;
      'sailthru.date'?: string;
      'pubdate'?: string;
      'lastmodified'?: string;
      'timestamp'?: string;
    }>;
    cse_image?: Array<{
      src?: string;
    }>;
    imageobject?: Array<{
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
    this.logger.debug('TEST: [NewsService] Debug level log is working.');
  }

  private removeHtmlTags(text: string): string {
    return decode(text.replace(/<[^>]*>/g, ''));
  }

  async searchNaverNews(
    query: string,
    display: number = 50,
    sort: 'sim' | 'date' = 'date',
  ): Promise<NewsArticle[]> {
    this.logger.debug(`[NewsService] searchNaverNews 함수 진입: query='${query}'`);
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

      this.logger.debug(`[NewsService] 네이버 API 응답 성공: total=${response.data.total}, items length=${response.data.items?.length}, data=${JSON.stringify(response.data).substring(0, 500)}...`);

      const articles: NewsArticle[] = (response.data.items || []).map((item: NaverNewsItem) => ({
        title: this.removeHtmlTags(item.title),
        originallink: item.originallink,
        link: item.link,
        description: this.removeHtmlTags(item.description),
        pubDate: item.pubDate,
        thumbnail: undefined,
        sentiment: 'UNKNOWN',
      }));

      this.logger.log(`[NewsService] 네이버 뉴스 검색 성공: '${query}', ${articles.length}개 기사`);
      return articles;
    } catch (error) {
      if (hasResponseAndStatus(error)) {
          this.logger.error(`[NewsService] 네이버 뉴스 검색 실패 (Axios Error): '${query}', HTTP Status: ${error.response?.status}, 응답 데이터: ${JSON.stringify(error.response?.data)}, 에러 메시지: ${error.message}`);
          if (error.response?.status === 401 || error.response?.status === 403) {
            this.logger.error('[NewsService] 네이버 API 인증 실패! Client ID/Secret 확인 또는 할당량 초과 여부를 확인하세요.');
          } else if (error.response?.status === 400) {
            this.logger.error(`[NewsService] 네이버 API 요청 파라미터 오류: ${error.response?.data?.errorMessage || '확인 필요'}`);
          }
      } else {
          this.logger.error(`[NewsService] 네이버 뉴스 검색 실패 (Non-Axios Error): '${query}', 에러: ${error instanceof Error ? error.message : String(error)}`);
      }
      return [];
    }
  }

  async searchGoogleNews(
    query: string,
    num: number = 10,
  ): Promise<NewsArticle[]> {
    this.logger.debug(`[NewsService] searchGoogleNews 함수 진입: query='${query}'`);
    if (!this.googleCseApiKey || !this.googleCseId) {
      this.logger.warn('[NewsService] 구글 API 키 또는 CSE ID가 설정되지 않아 구글 뉴스 검색을 건너뜜.');
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      // 🚨 변경: dateRestrict 파라미터를 추가하여 최근 1개월 이내 기사만 검색
      // sort=date는 이미 Naver와 합쳐진 최종 정렬에서 처리되므로 여기서는 필수는 아니지만,
      // API 단에서부터 최신순으로 가져오는 것이 효율적일 수 있습니다.
      const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${this.googleCseApiKey}&cx=${this.googleCseId}&q=${encodedQuery}&num=${num}&sort=date&dateRestrict=m1&alt=json`;
      this.logger.debug(`[NewsService] Google News API 요청 URL: ${apiUrl}`);

      const response = await axios.get<GoogleSearchApiResponse>(apiUrl);

      this.logger.debug(`[NewsService] 구글 API 응답 성공: items length=${response.data.items?.length}, data=${JSON.stringify(response.data).substring(0, 500)}...`);

      const articles: NewsArticle[] = (response.data.items || []).map((item: GoogleSearchItem) => {
        const pubDate = item.pagemap?.metatags?.[0]?.['article:published_time']
                      || item.pagemap?.metatags?.[0]?.['date']
                      || item.pagemap?.metatags?.[0]?.['og:updated_time']
                      || item.pagemap?.metatags?.[0]?.['sailthru.date']
                      || item.pagemap?.metatags?.[0]?.['pubdate']
                      || item.pagemap?.metatags?.[0]?.['lastmodified']
                      || item.pagemap?.metatags?.[0]?.['timestamp']
                      || undefined;

        const thumbnail = item.pagemap?.cse_image?.[0]?.src
                        || item.pagemap?.imageobject?.[0]?.url
                        || undefined;

        return {
          title: this.removeHtmlTags(item.title),
          originallink: item.link,
          link: item.link,
          description: this.removeHtmlTags(item.snippet),
          pubDate: pubDate,
          thumbnail: thumbnail,
          sentiment: 'UNKNOWN',
        };
      });

      this.logger.log(`[NewsService] 구글 뉴스 검색 성공: '${query}', ${articles.length}개 기사`);
      return articles;
    } catch (error) {
      if (hasResponseAndStatus(error)) {
          this.logger.error(`[NewsService] 구글 뉴스 검색 실패 (Axios Error): '${query}', HTTP Status: ${error.response?.status}, 응답 데이터: ${JSON.stringify(error.response?.data)}, 에러 메시지: ${error.message}`);
          if (error.response?.status === 400 || error.response?.status === 403) {
            this.logger.error('[NewsService] 구글 CSE API 오류! API 키, CSE ID 또는 할당량을 확인하세요.');
          }
      } else {
          this.logger.error(`[NewsService] 구글 뉴스 검색 실패 (Non-Axios Error): '${query}', 에러: ${error instanceof Error ? error.message : String(error)}`);
      }
      return [];
    }
  }

  async searchAllNews(query: string, limit: number = 20): Promise<NewsArticle[]> {
    this.logger.log(`[NewsService] 모든 뉴스 검색 시작: '${query}', 목표 ${limit}개 기사`);

    const naverLimit = limit;
    const googleLimit = Math.min(limit, 10);

    // 네이버에 보낼 쿼리를 primaryName으로 단순화
    const naverQuery = query.split(' ')[0]; // 첫 단어 (primaryName)만 사용
    this.logger.debug(`[NewsService] 네이버 뉴스 검색에 사용할 쿼리: '${naverQuery}'`);

    const [naverResult, googleResult] = await Promise.allSettled([
      this.searchNaverNews(naverQuery, naverLimit, 'date'),
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

    const uniqueArticles = Array.from(new Map(allArticles.map(article => [article.link, article])).values());
    this.logger.debug(`[NewsService] 중복 제거 후 총 ${uniqueArticles.length}개 기사.`);

    uniqueArticles.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA;
    });

    const articlesForAI = uniqueArticles.slice(0, limit);
    this.logger.log(`[NewsService] 통합 뉴스 검색 완료: '${query}', 최종 ${articlesForAI.length}개 기사 (AI 분석용)`);

    return articlesForAI;
  }
}