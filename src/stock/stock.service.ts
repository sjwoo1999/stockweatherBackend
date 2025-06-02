// src/stock/stock.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { NewsService } from '../news/news.service'; // NewsService가 NewsArticle[]를 반환한다고 가정
import { AIAnalysisService } from '../ai-analysis/ai-analysis.service'; // AIAnalysisService 임포트
import { KeywordMappingService } from './keyword-mapping.service'; // KeywordMappingService 임포트
import {
  StockWeatherResponseDto, // ✨ src/types/stock.ts에서 export된 것 임포트 ✨
  NewsArticle,             // ✨ src/types/stock.ts에서 export된 것 임포트 ✨
  AIAnalysisResult,        // ✨ src/types/stock.ts에서 export된 것 임포트 ✨
  NewsArticleSummary       // AI 분석 결과에 포함될 기사 요약 정보 타입
} from '../types/stock';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly aiAnalysisService: AIAnalysisService,
    private readonly keywordMappingService: KeywordMappingService,
  ) {}

  async searchStock(userQuery: string): Promise<StockWeatherResponseDto> { // 반환 타입을 StockWeatherResponseDto로 지정
    if (!userQuery) {
      throw new BadRequestException('검색어가 누락되었습니다.');
    }

    this.logger.log(`Stock search initiated for user query: "${userQuery}"`);

    const stockMapping = this.keywordMappingService.getMapping(userQuery);
    const { primaryName, searchKeywords } = stockMapping;

    this.logger.log(`Mapped to primaryName: "${primaryName}", Search Keywords: ${searchKeywords.join(', ')}`);

    // 1. 확장된 키워드로 뉴스 기사 검색
    // NewsService.searchAllNews()가 NewsArticle[] 타입을 반환한다고 가정합니다.
    const allArticles: NewsArticle[] = []; // ✨ NewsArticle 타입 사용 ✨
    for (const keyword of searchKeywords) {
      // NewsService에서 원본 기사 데이터를 가져온다고 가정
      const articles = await this.newsService.searchAllNews(keyword);
      allArticles.push(...articles);
    }
    // 중복 기사 제거 (url 기준으로)
    const uniqueArticles = Array.from(new Map(allArticles.map(item => [item['url'], item])).values());
    this.logger.log(`Total unique articles collected: ${uniqueArticles.length}`);

    // 2. AI 분석 실행 (대표 종목명과 수집된 모든 기사 사용)
    // AIAnalysisService.analyzeStock()가 AIAnalysisResult 타입을 반환한다고 가정합니다.
    const analysisResult: AIAnalysisResult = await this.aiAnalysisService.analyzeStock(primaryName, uniqueArticles); // ✨ 두 번째 인자로 NewsArticle[] 전달, 반환 타입 AIAnalysisResult ✨
    this.logger.log(`AI analysis completed for "${primaryName}".`);

    // AIAnalysisResult의 articles는 NewsArticleSummary[] 타입이므로 변환 필요 (선택 사항)
    // AIAnalysisService가 NewsArticleSummary[] 형태의 기사 목록을 직접 반환한다면 이 변환은 필요 없습니다.
    const summarizedArticles: NewsArticleSummary[] = uniqueArticles.map(article => ({
      title: article.title,
      summary: "AI가 요약한 기사 내용...", // 실제 AI 요약이 필요하다면 여기서 한번 더 처리하거나 AIAnalysisService에서 요약해서 넘겨줘야 함
      url: article.link || '', // NewsArticle의 link 필드를 사용
    }));


    return {
      stock: {
        name: primaryName,
        weatherSummary: analysisResult.weatherSummary || "AI 분석 결과입니다.",
        overallSentiment: analysisResult.overallSentiment || "NEUTRAL",
        sentimentScore: analysisResult.sentimentScore || 0.5,
        keywords: analysisResult.keywords || [],
        reportSummary: analysisResult.reportSummary || "AI 분석 결과 요약.",
        articles: summarizedArticles, // NewsArticleSummary[] 타입
        detailedAnalysis: analysisResult.detailedAnalysis || "AI 분석 상세 내용.",
        investmentOpinion: analysisResult.investmentOpinion || { opinion: "유지", confidence: 0.5 },
        relatedStocks: analysisResult.relatedStocks || [],
      },
      weatherIcon: analysisResult.weatherIcon || "cloudy", // ✨ AIAnalysisResult에 weatherIcon이 있으므로 문제 해결 ✨
      timestamp: new Date().toISOString(),
      disclaimer: "본 분석은 AI 기반 예측치이며, 실제 투자 결과와 무관합니다. 투자 결정은 반드시 본인의 판단과 책임 하에 이루어져야 합니다.",
    };
  }
}