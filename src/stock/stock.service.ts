// stockweather-backend/src/stock/stock.service.ts

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { NewsService } from '../news/news.service';
import { AIAnalysisService } from '../ai-analysis/ai-analysis.service';
import { KeywordMappingService } from './keyword-mapping.service';
import { EventsGateway } from '../events/events.gateway';

import {
  StockWeatherResponseDto,
  NewsArticle,
  AIAnalysisResult,
  NewsArticleSummary
} from '../types/stock';

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
  async processStockAnalysis(userQuery: string, clientId: string): Promise<void> { // 반환 타입을 void로 변경
    if (!userQuery) {
      this.logger.error(`Attempted to process stock analysis without query for client ${clientId}`);
      // 클라이언트에게 에러를 웹소켓으로 알릴 수 있습니다.
      this.eventsGateway.sendProcessingComplete(clientId, { error: '검색어가 누락되었습니다.' });
      return;
    }

    this.logger.log(`[Service] Starting stock analysis for user query: "${userQuery}" for client: ${clientId}`);

    try {
      const stockMapping = this.keywordMappingService.getMapping(userQuery);
      const { primaryName, searchKeywords } = stockMapping;

      this.logger.log(`[Service] Mapped to primaryName: "${primaryName}", Search Keywords: ${searchKeywords.join(', ')}`);

      const allArticles: NewsArticle[] = [];
      for (const keyword of searchKeywords) {
        this.logger.log(`[Service] Fetching news for keyword: "${keyword}"`);
        const articles = await this.newsService.searchAllNews(keyword);
        allArticles.push(...articles);
        await this.delay(500);
      }

      const uniqueArticles = Array.from(new Map(allArticles.map(item => [item.link, item])).values());
      this.logger.log(`[Service] Total unique articles collected: ${uniqueArticles.length}`);

      const analysisResult: AIAnalysisResult = await this.aiAnalysisService.analyzeStock(primaryName, uniqueArticles);
      this.logger.log(`[Service] AI analysis completed for "${primaryName}".`);

      const summarizedArticles: NewsArticleSummary[] = uniqueArticles.map(article => ({
        title: article.title,
        summary: "AI가 요약한 기사 내용...", // 실제 AI 연동 후 수정 필요
        url: article.link,
      }));

      const finalResponse: StockWeatherResponseDto = {
        stock: {
          name: primaryName,
          weatherSummary: analysisResult.weatherSummary || "AI 분석 결과입니다.",
          overallSentiment: analysisResult.overallSentiment || "NEUTRAL",
          sentimentScore: analysisResult.sentimentScore || 0.5,
          keywords: analysisResult.keywords || [],
          reportSummary: analysisResult.reportSummary || "AI 분석 결과 요약.",
          articles: summarizedArticles,
          detailedAnalysis: analysisResult.detailedAnalysis || "AI 분석 상세 내용.",
          investmentOpinion: analysisResult.investmentOpinion || { opinion: "유지", confidence: 0.5 },
          relatedStocks: analysisResult.relatedStocks || [],
        },
        weatherIcon: analysisResult.weatherIcon || "cloudy",
        timestamp: new Date().toISOString(),
        disclaimer: "본 분석은 AI 기반 예측치이며, 실제 투자 결과와 무관합니다. 투자 결정은 반드시 본인의 판단과 책임 하에 이루어져야 합니다.",
      };

      // 분석이 완료되면 Socket.IO를 통해 프론트엔드로 결과를 전송합니다.
      this.eventsGateway.sendProcessingComplete(clientId, finalResponse);
      this.logger.log(`[Service] Analysis complete for '${userQuery}'. Result sent to client ${clientId}.`);

    } catch (error) {
      this.logger.error(`[Service] Error during stock analysis for '${userQuery}' (client: ${clientId}):`, error.message, error.stack);
      // 분석 중 에러가 발생했을 때 클라이언트에게 에러를 웹소켓으로 알립니다.
      this.eventsGateway.sendProcessingComplete(clientId, {
        error: `정보 분석 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`,
        query: userQuery,
      });
    }
  }
}