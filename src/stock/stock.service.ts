import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { NewsService } from '../news/news.service';
import { AIAnalysisService } from '../ai-analysis/ai-analysis.service';
import { KeywordMappingService } from './keyword-mapping.service';
import { EventsGateway } from '../events/events.gateway';

import {
  StockWeatherResponseDto,
  NewsArticle,
  AIAnalysisResult,
  NewsArticleSummary,
} from '../types/stock';

import { stockMappings, StockMapping } from './stock-data';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly aiAnalysisService: AIAnalysisService,
    private readonly keywordMappingService: KeywordMappingService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 사용자 쿼리를 기반으로 주식 관련 뉴스 검색 및 AI 분석을 비동기적으로 수행합니다.
   * 이 메서드는 HTTP 응답과 별개로 백그라운드에서 실행되며,
   * 최종 결과는 WebSocket을 통해 클라이언트에게 전송됩니다.
   * @param userQuery 사용자 입력 검색어 (예: "카카오", "삼성전자")
   * @param clientId 데이터를 요청한 클라이언트의 Socket ID (WebSockets 통신용)
   */
  async processStockAnalysis(userQuery: string, clientId: string): Promise<void> {
    if (!userQuery) {
      this.logger.error(`Attempted to process stock analysis without query for client ${clientId}`);
      // 클라이언트에게 에러를 웹소켓으로 알립니다.
      this.eventsGateway.sendProcessingComplete(clientId, { error: '검색어가 누락되었습니다.', query: userQuery, socketId: clientId });
      return;
    }

    this.logger.log(`[StockService] Starting stock analysis for user query: "${userQuery}" for client: ${clientId}`);

    try {
      const stockMapping: StockMapping = this.keywordMappingService.getMapping(userQuery);
      const { primaryName, searchKeywords } = stockMapping;

      this.logger.log(`[StockService] Mapped to primaryName: "${primaryName}", Search Keywords: ${searchKeywords.join(', ')}`);

      // 1. 뉴스 검색 시작 알림
      this.eventsGateway.sendAnalysisProgress(
        clientId,
        'NEWS_SEARCH_STARTED',
        `'${primaryName}'에 대한 뉴스를 찾아보고 있어요...`,
        userQuery
      );
      this.logger.log(`[StockService] Notified client: News search started for '${primaryName}'.`);

      // 🚨 변경점: 뉴스 검색 로직 최적화
      // primaryName과 searchKeywords를 결합하여 단일 쿼리로 NewsService 호출
      // Google CSE는 OR 연산자를 지원하므로, 여러 키워드를 'OR'로 연결하여 검색 범위를 확장
      const combinedQuery = `${primaryName} ${searchKeywords.join(' OR ')}`; // 예: "삼성전자 반도체 OR HBM OR AI"
      const NEWS_FETCH_LIMIT = 20; // AI 분석에 필요한 뉴스 기사 수 (조절 가능)

      this.logger.log(`[StockService] Combined news search query: "${combinedQuery}", fetching up to ${NEWS_FETCH_LIMIT} articles.`);

      // NewsService의 searchAllNews 메서드가 이미 중복 제거, 최신순 정렬, limit 적용까지 해줌
      const articlesForAI: NewsArticle[] = await this.newsService.searchAllNews(combinedQuery, NEWS_FETCH_LIMIT);

      if (articlesForAI.length === 0) {
        this.logger.warn(`[StockService] No news articles found for '${combinedQuery}'. Sending 'no news' response to client.`);
        // 뉴스 기사가 없으므로 AI 분석 없이 바로 결과 반환 (또는 에러 처리)
        this.eventsGateway.sendProcessingComplete(clientId, {
          stock: {
            name: primaryName,
            weatherSummary: '관련 뉴스 기사를 찾을 수 없습니다.',
            overallSentiment: 'UNKNOWN',
            sentimentScore: 0,
            keywords: [],
            reportSummary: '분석에 필요한 뉴스 데이터가 부족합니다.',
            articles: [], // 기사 없음
            detailedAnalysis: { positiveFactors: '', negativeFactors: '', neutralFactors: '', overallOpinion: '뉴스 기사가 없어 분석을 수행할 수 없습니다. 검색어를 다시 확인하거나, 나중에 다시 시도해주세요.' },
            investmentOpinion: { opinion: '관망', confidence: 0 },
            relatedStocks: [],
            overallNewsSummary: `[${primaryName}] 관련 뉴스 기사 없음.`,
          },
          weatherIcon: 'unknown',
          timestamp: new Date().toISOString(),
          disclaimer: '뉴스 부족으로 인한 분석 불가.',
          query: userQuery,
          newsCount: 0,
          socketId: clientId,
        });
        return;
      }

      this.logger.log(`[StockService] Articles collected for AI analysis: ${articlesForAI.length} articles.`);

      // 2. AI 분석 시작 알림
      this.eventsGateway.sendAnalysisProgress(
        clientId,
        'AI_ANALYSIS_STARTED',
        `AI가 '${primaryName}'의 주식 전망에 대해 분석하고 있어요...`,
        userQuery
      );
      this.logger.log(`[StockService] Notified client: AI analysis started for '${primaryName}'.`);

      // AI 분석 요청
      const analysisResult: AIAnalysisResult = await this.aiAnalysisService.analyzeStock(primaryName, articlesForAI);
      this.logger.log(`[StockService] AI analysis completed for "${primaryName}".`);

      // AI 분석 결과의 overallSentiment를 기반으로 날씨 아이콘 결정
      let weatherIcon: StockWeatherResponseDto['weatherIcon'] = 'unknown';
      if (analysisResult.overallSentiment === 'VERY_POSITIVE') {
        weatherIcon = 'sunny';
      } else if (analysisResult.overallSentiment === 'POSITIVE') {
        weatherIcon = 'partly-cloudy';
      } else if (analysisResult.overallSentiment === 'NEUTRAL') {
        weatherIcon = 'cloudy';
      } else if (analysisResult.overallSentiment === 'NEGATIVE') {
        weatherIcon = 'rainy';
      } else if (analysisResult.overallSentiment === 'VERY_NEGATIVE') {
        weatherIcon = 'stormy';
      }

      // 최종 StockWeatherResponseDto 구성 시, articles 필드는 NewsArticleSummary[]로 변환하여 할당합니다.
      // 여기서는 AI에 전달된 articlesForAI 중에서 TOP 5만 UI에 표시하도록 했습니다.
      const summarizedArticlesForDto: NewsArticleSummary[] = articlesForAI.slice(0, 5).map(article => ({
        title: article.title,
        summary: article.description,
        url: article.link,
        thumbnailUrl: article.thumbnail,
        sentiment: article.sentiment || 'UNKNOWN',
      }));

      const finalResponse: StockWeatherResponseDto = {
        stock: {
          name: primaryName,
          weatherSummary: analysisResult.weatherSummary || "AI 분석 결과입니다.",
          overallSentiment: analysisResult.overallSentiment || "NEUTRAL",
          sentimentScore: analysisResult.sentimentScore || 0,
          keywords: analysisResult.keywords || [],
          reportSummary: analysisResult.reportSummary || "AI 분석 결과 요약.",
          articles: summarizedArticlesForDto, // UI에 표시할 뉴스 요약 (최대 5개)
          detailedAnalysis: analysisResult.detailedAnalysis || { positiveFactors: '', negativeFactors: '', neutralFactors: '', overallOpinion: '' }, // 상세 분석 객체 초기화
          investmentOpinion: analysisResult.investmentOpinion || { opinion: "관망", confidence: 0 },
          relatedStocks: analysisResult.relatedStocks || [],
          overallNewsSummary: analysisResult.overallNewsSummary || `[${primaryName}] 관련 뉴스 요약 없음.`,
        },
        weatherIcon: weatherIcon,
        timestamp: new Date().toISOString(),
        disclaimer: "본 분석은 AI 기반 예측치이며, 실제 투자 결과와 무관합니다. 투자 결정은 반드시 본인의 판단과 책임 하에 이루어져야 합니다.",
        query: userQuery,
        newsCount: articlesForAI.length, // AI 분석에 사용된 고유 뉴스 기사 수
        socketId: clientId, // 최종 응답에도 socketId 포함
      };

      // 🚨 디버깅을 위한 로그 추가: 최종 전송될 기사 수와 첫 번째 기사 제목 확인
      this.logger.log(`[StockService] Sending final response for '${userQuery}' to client ${clientId}. Articles count: ${finalResponse.stock.articles.length}`);
      if (finalResponse.stock.articles.length > 0) {
        this.logger.debug(`[StockService] First article title (in finalResponse): "${finalResponse.stock.articles[0].title}"`);
      }

      // 분석이 완료되면 Socket.IO를 통해 프론트엔드로 결과를 전송합니다.
      this.eventsGateway.sendProcessingComplete(clientId, finalResponse);
      this.logger.log(`[StockService] Analysis complete for '${userQuery}'. Result sent to client ${clientId}.`);

    } catch (error) {
      this.logger.error(`[StockService] Error during stock analysis for '${userQuery}' (client: ${clientId}):`, error.message, error.stack);
      // 분석 중 에러가 발생했을 때 클라이언트에게 에러를 웹소켓으로 알립니다.
      const errorResponse: StockWeatherResponseDto = {
        stock: {
          name: userQuery,
          weatherSummary: '분석 중 오류가 발생했습니다.',
          overallSentiment: 'UNKNOWN',
          sentimentScore: 0,
          keywords: [],
          reportSummary: '데이터를 가져오거나 분석하는 중 문제가 발생했습니다.',
          articles: [], // 에러 발생 시 기사 없음
          detailedAnalysis: { positiveFactors: '', negativeFactors: '', neutralFactors: '', overallOpinion: '서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' },
          investmentOpinion: { opinion: '관망', confidence: 0 },
          relatedStocks: [],
          overallNewsSummary: `[${userQuery}] 뉴스 요약 실패.`,
        },
        weatherIcon: 'unknown',
        timestamp: new Date().toISOString(),
        disclaimer: '이 분석 결과는 AI에 의해 생성된 것으로, 투자 결정에 대한 최종 책임은 사용자에게 있습니다.',
        error: `분석 실패: ${error.message || '알 수 없는 오류'}`,
        query: userQuery,
        newsCount: 0,
        socketId: clientId,
      };
      this.eventsGateway.sendProcessingComplete(clientId, errorResponse);
    }
  }
}