// stockweather-backend/src/stock/stock.service.ts

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIAnalysisService } from '../ai-analysis/ai-analysis.service';
import { EventsGateway } from '../events/events.gateway';
import { KeywordMappingService } from './keyword-mapping.service';
import {
  DisclosureService,
  DartCompanyInfo,
} from '../disclosure/disclosure.service';
import { UsersService } from '../users/users.service';
import axios from 'axios';

import {
  StockWeatherResponseDto,
  StockData,
  AIAnalysisResult, // AIAnalysisResult는 백엔드 전용이므로 백엔드 types/stock에 정의되어 있다고 가정합니다.
} from '../types/stock'; // 백엔드의 types/stock.ts에서 DTO를 가져옵니다.

import { DisclosureItem } from '../disclosure/interfaces/disclosure-item.interface'; // 올바른 DisclosureItem 임포트

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    @Inject(forwardRef(() => AIAnalysisService))
    private aiAnalysisService: AIAnalysisService,
    private eventsGateway: EventsGateway,
    private keywordMappingService: KeywordMappingService,
    private disclosureService: DisclosureService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async sendEventToWebSocket(socketId: string, eventName: string, data: any) {
    const websocketUrl = this.configService.get<string>('WEBSOCKET_SERVER_URL'); // 예: https://stockweather-websocket.../emit
  
    try {
      await axios.post(`${websocketUrl}/emit`, {
        socketId,
        eventName,
        data,
      });
      this.logger.debug(`[StockService] WebSocket 서버에 이벤트 전송 성공: socketId=${socketId}, event=${eventName}`);
    } catch (error) {
      this.logger.error(
        `[StockService] WebSocket 서버 이벤트 전송 실패: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * 주식 분석 데이터를 가져오고 WebSocket으로 클라이언트에 전송합니다.
   * 이제 DART 공시 정보만을 기반으로 AI 분석을 수행합니다.
   * @param query 사용자가 검색한 종목명 또는 관련 키워드
   * @param socketId 클라이언트의 WebSocket ID
   * @param selectedCorpCode 사용자가 명시적으로 선택한 기업 고유번호 (선택적)
   */
  async getStockAnalysisData(
    query: string,
    socketId: string,
    selectedCorpCode?: string,
  ): Promise<void> {
    this.logger.log(
      `[StockService] getStockAnalysisData 호출: query=${query}, socketId=${socketId}, selectedCorpCode=${selectedCorpCode || '없음'}`,
    );
    let companyName: string = query;
    let corpCode: string | undefined = selectedCorpCode;

    try {
      // 1. DART에서 회사 정보 조회 및 corpCode 확정
      await this.sendEventToWebSocket(socketId, 'analysisProgress', {
        query: query,
        corpCode: corpCode || 'UNKNOWN',
        socketId: socketId,
        message: `'${query}'에 대한 회사 정보를 확인 중입니다.`,
      });

      if (!corpCode) {
        this.logger.debug(
          `[StockService] corpCode 미제공. DART에서 회사 정보 검색 시작: query=${query}`,
        );
        const companies = this.disclosureService.searchCompaniesByName(query);
        if (companies.length > 0) {
          const mainCompany = companies[0];
          companyName = mainCompany.corp_name;
          corpCode = mainCompany.corp_code;
          this.logger.log(
            `[StockService] DART에서 회사 정보 매핑 성공: query=${query} -> 회사명=${companyName}, corpCode=${corpCode}`,
          );
        } else {
          this.logger.warn(
            `[StockService] DART에서 '${query}'에 대한 회사 정보를 찾을 수 없습니다. 기본 분석 결과 전송.`,
          );
          const defaultAnalysisResult: AIAnalysisResult =
            this.aiAnalysisService.createDefaultAnalysisResult(
              query,
              '회사 정보를 찾을 수 없어 AI 분석을 수행할 수 없습니다.',
            );
          const stockData: StockData = {
            name: query,
            code: corpCode,
            weatherSummary: defaultAnalysisResult.weatherSummary,
            overallSentiment: defaultAnalysisResult.overallSentiment,
            sentimentScore: defaultAnalysisResult.sentimentScore,
            keywords: defaultAnalysisResult.keywords,
            reportSummary: defaultAnalysisResult.reportSummary,
            detailedAnalysis: defaultAnalysisResult.detailedAnalysis,
            investmentOpinion: defaultAnalysisResult.investmentOpinion,
            relatedStocks: defaultAnalysisResult.relatedStocks,
            articles: [], // 공시가 없으므로 빈 배열
          };
          await this.sendEventToWebSocket(socketId, 'processingComplete', {
            // ⭐ 이벤트 이름 수정: 'processingComplete' ⭐
            stock: stockData,
            weatherIcon: 'unknown',
            timestamp: new Date().toISOString(),
            disclaimer:
              '제공된 정보는 투자 자문이 아니며, 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.',
            error: `"${query}"에 대한 회사 정보를 찾을 수 없어 AI 분석을 수행할 수 없습니다.`,
            query: query,
            socketId: socketId, // ⭐ socketId 추가 ⭐
            newsCount: 0, // 공시 개수 0
          } as StockWeatherResponseDto);
          return;
        }
      } else {
        const companyInfo = this.disclosureService.getCorpInfoByCode(corpCode);
        if (companyInfo) {
          companyName = companyInfo.corp_name;
          this.logger.log(
            `[StockService] 선택된 corpCode로 회사명 확인: corpCode=${corpCode} -> 회사명=${companyName}`,
          );
        } else {
          this.logger.warn(
            `[StockService] 선택된 corpCode '${corpCode}'에 대한 회사 정보를 찾을 수 없습니다. 쿼리 '${query}'를 회사명으로 사용.`,
          );
          // 이 경우에도 defaultAnalysisResult를 보내는 것이 안전합니다.
          const defaultAnalysisResult: AIAnalysisResult =
            this.aiAnalysisService.createDefaultAnalysisResult(
              query,
              `선택된 회사 코드 '${corpCode}'에 대한 정보를 찾을 수 없습니다.`,
            );
          const stockData: StockData = {
            name: query,
            code: corpCode,
            weatherSummary: defaultAnalysisResult.weatherSummary,
            overallSentiment: defaultAnalysisResult.overallSentiment,
            sentimentScore: defaultAnalysisResult.sentimentScore,
            keywords: defaultAnalysisResult.keywords,
            reportSummary: defaultAnalysisResult.reportSummary,
            detailedAnalysis: defaultAnalysisResult.detailedAnalysis,
            investmentOpinion: defaultAnalysisResult.investmentOpinion,
            relatedStocks: defaultAnalysisResult.relatedStocks,
            articles: [],
          };
          await this.sendEventToWebSocket(socketId, 'processingComplete', {
            stock: stockData,
            weatherIcon: 'unknown',
            timestamp: new Date().toISOString(),
            disclaimer:
              '제공된 정보는 투자 자문이 아니며, 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.',
            error: `선택된 회사 코드 '${corpCode}'에 대한 정보를 찾을 수 없습니다.`,
            query: query,
            socketId: socketId,
            newsCount: 0,
          } as StockWeatherResponseDto);
          return;
        }
      }

      if (!corpCode) {
        this.logger.error(
          `[StockService] 최종적으로 corpCode를 확보하지 못했습니다: query=${query}, selectedCorpCode=${selectedCorpCode || '없음'}`,
        );
        throw new Error('회사 고유번호를 확인할 수 없습니다.');
      }

      // 2. DART에서 최신 공시 정보 조회
      await this.sendEventToWebSocket(socketId, 'analysisProgress', {
        query: query,
        corpCode: corpCode,
        socketId: socketId,
        message: `'${companyName}'(${corpCode})의 최근 공시 정보를 조회 중입니다.`,
      });
      this.logger.debug(
        `[StockService] DART 공시 정보 조회 시작: corpCode=${corpCode}`,
      );
      const recentDisclosures: DisclosureItem[] =
        await this.disclosureService.getRecentDisclosures(corpCode, 5); // 최근 5개 공시

      if (!recentDisclosures || recentDisclosures.length === 0) {
        this.logger.warn(
          `[StockService] '${companyName}'(${corpCode})에 대한 최근 공시 정보가 없습니다. 기본 분석 결과 전송.`,
        );
        const defaultAnalysisResult: AIAnalysisResult =
          this.aiAnalysisService.createDefaultAnalysisResult(
            query,
            '최근 공시 정보가 없어 AI 분석을 수행할 수 없습니다.',
          );
        const stockData: StockData = {
          name: companyName,
          code: corpCode,
          weatherSummary: defaultAnalysisResult.weatherSummary,
          overallSentiment: defaultAnalysisResult.overallSentiment,
          sentimentScore: defaultAnalysisResult.sentimentScore,
          keywords: defaultAnalysisResult.keywords,
          reportSummary: defaultAnalysisResult.reportSummary,
          detailedAnalysis: defaultAnalysisResult.detailedAnalysis,
          investmentOpinion: defaultAnalysisResult.investmentOpinion,
          relatedStocks: defaultAnalysisResult.relatedStocks,
          articles: [], // 공시가 없으므로 빈 배열
        };
        await this.sendEventToWebSocket(socketId, 'processingComplete', {
          // ⭐ 이벤트 이름 수정: 'processingComplete' ⭐
          stock: stockData,
          weatherIcon: 'unknown',
          timestamp: new Date().toISOString(),
          disclaimer:
            '제공된 정보는 투자 자문이 아니며, 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.',
          error: `"${companyName}"에 대한 최근 공시 정보가 없어 AI 분석을 수행할 수 없습니다.`,
          query: query,
          socketId: socketId, // ⭐ socketId 추가 ⭐
          newsCount: 0, // 공시 개수 0
        } as StockWeatherResponseDto);
        return;
      }

      // 3. AI 분석 서비스 호출
      await this.sendEventToWebSocket(socketId, 'analysisProgress', {
        query: query,
        corpCode: corpCode,
        socketId: socketId,
        message: `AI가 '${companyName}'의 공시 데이터를 분석 중입니다. (${recentDisclosures.length}개 공시)`,
      });
      this.logger.log(
        `[StockService] AI 분석 서비스 호출: 회사명=${companyName}, 공시 ${recentDisclosures.length}개`,
      );
      let aiAnalysisResult: AIAnalysisResult;
      try {
        aiAnalysisResult = await this.aiAnalysisService.analyzeStockData(
          companyName,
          recentDisclosures,
          socketId, // ⭐ AIAnalysisService로 socketId 전달 ⭐
          corpCode, // ⭐ AIAnalysisService로 corpCode 전달 ⭐
          query, // ⭐ AIAnalysisService로 query 전달 ⭐
        );
        this.logger.log(
          `[StockService] AI 분석 성공: 회사명=${companyName}, 요약=${aiAnalysisResult.weatherSummary}`,
        );
      } catch (aiError) {
        this.logger.error(
          `[StockService] AI 분석 중 오류 발생 (${companyName}): ${aiError.message}`,
        );
        aiAnalysisResult = this.aiAnalysisService.createDefaultAnalysisResult(
          query,
          `AI 분석 중 오류 발생: ${aiError.message}`,
        );
      }

      // 4. 최종 DTO 구성 및 클라이언트에 전송
      const stockData: StockData = {
        name: companyName,
        code: corpCode,
        weatherSummary: aiAnalysisResult.weatherSummary,
        overallSentiment: aiAnalysisResult.overallSentiment,
        sentimentScore: aiAnalysisResult.sentimentScore,
        keywords: aiAnalysisResult.keywords,
        reportSummary: aiAnalysisResult.reportSummary,
        detailedAnalysis: aiAnalysisResult.detailedAnalysis,
        investmentOpinion: aiAnalysisResult.investmentOpinion,
        relatedStocks: aiAnalysisResult.relatedStocks,
        articles: recentDisclosures, // 조회된 공시 정보를 articles 필드에 포함
        overallNewsSummary: aiAnalysisResult.overallNewsSummary, // AIAnalysisResult에 있다면 사용
      };

      const weatherIcon = this.getWeatherIconBasedOnSentiment(
        aiAnalysisResult.overallSentiment,
      );

      const finalResponse: StockWeatherResponseDto = {
        stock: stockData,
        weatherIcon: weatherIcon,
        timestamp: new Date().toISOString(),
        disclaimer:
          '제공된 정보는 투자 자문이 아니며, 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.',
        query: query,
        socketId: socketId, // ⭐ socketId 필수 포함 ⭐
        newsCount: recentDisclosures.length, // 조회된 공시 개수 포함
      };

      await this.sendEventToWebSocket(
        socketId,
        'processingComplete',
        finalResponse,
      ); // ⭐ 이벤트 이름 수정: 'processingComplete' ⭐
      this.logger.log(
        `[StockService] '${companyName}' 분석 결과 클라이언트에 성공적으로 전송 (socketId: ${socketId})`,
      );
    } catch (error) {
      this.logger.error(
        `[StockService] 주식 분석 중 치명적인 오류 발생: ${error.message}`,
        error.stack,
      );
      await this.sendEventToWebSocket(socketId, 'processingComplete', {
        // ⭐ 이벤트 이름 수정: 'processingComplete' ⭐
        stock: {
          name: companyName,
          code: corpCode,
          weatherSummary: '오류 발생으로 분석을 완료할 수 없습니다.',
          overallSentiment: 'UNKNOWN',
          sentimentScore: 0,
          keywords: [],
          reportSummary: '오류 발생으로 분석을 완료할 수 없습니다.',
          detailedAnalysis: {
            positiveFactors: '',
            negativeFactors: '',
            neutralFactors: '',
            overallOpinion:
              '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          },
          investmentOpinion: { opinion: '관망', confidence: 0 },
          relatedStocks: [],
          articles: [],
          overallNewsSummary: '분석 중 오류가 발생했습니다.',
        },
        weatherIcon: 'unknown',
        timestamp: new Date().toISOString(),
        disclaimer:
          '제공된 정보는 투자 자문이 아니며, 투자 결정은 본인의 판단과 책임 하에 이루어져야 합니다.',
        error: error.message || '알 수 없는 서버 오류가 발생했습니다.',
        query: query,
        socketId: socketId, // ⭐ socketId 필수 포함 ⭐
        newsCount: 0, // 오류 발생 시 공시 개수 0
      } as StockWeatherResponseDto);
    }
  }

  /**
   * AI 분석 감성에 따라 날씨 아이콘을 반환합니다.
   * @param sentiment AI 분석의 전반적 감성
   * @returns 날씨 아이콘 문자열
   */
  private getWeatherIconBasedOnSentiment(
    sentiment: StockData['overallSentiment'],
  ): StockWeatherResponseDto['weatherIcon'] {
    switch (sentiment) {
      case 'VERY_POSITIVE':
      case 'POSITIVE':
        return 'sunny';
      case 'NEUTRAL':
        return 'partly-cloudy';
      case 'NEGATIVE':
        return 'cloudy';
      case 'VERY_NEGATIVE':
        return 'stormy';
      default:
        return 'unknown';
    }
  }
}
