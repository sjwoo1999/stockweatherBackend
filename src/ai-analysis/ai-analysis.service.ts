import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DisclosureItem } from '../disclosure/interfaces/disclosure-item.interface';
import { AIAnalysisResult } from '../types/stock';
import axios from 'axios';

@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private readonly openaiFunctionUrl: string;
  private readonly websocketServerUrl: string;

  constructor(private configService: ConfigService) {
    this.openaiFunctionUrl =
      this.configService.get<string>('OPENAI_FUNCTION_URL') || '';
    if (!this.openaiFunctionUrl) {
      this.logger.error('OPENAI_FUNCTION_URL 환경 변수가 설정되지 않았습니다.');
      throw new Error('OPENAI_FUNCTION_URL is not configured.');
    }

    this.websocketServerUrl =
      this.configService.get<string>('WEBSOCKET_SERVER_URL') || '';
    if (!this.websocketServerUrl) {
      this.logger.error('WEBSOCKET_SERVER_URL 환경 변수가 설정되지 않았습니다.');
      throw new Error('WEBSOCKET_SERVER_URL is not configured.');
    }

    this.logger.log(
      `[AIAnalysisService] Initialized with OPENAI_FUNCTION_URL=${this.openaiFunctionUrl}, WEBSOCKET_SERVER_URL=${this.websocketServerUrl}`,
    );
  }

  async analyzeStockData(
    stockName: string,
    disclosures: DisclosureItem[],
    socketId: string,
    corpCode: string,
    query: string,
  ): Promise<AIAnalysisResult> {
    this.logger.log(
      `[AIAnalysisService] analyzeStockData 호출됨. 종목: '${stockName}', 공시 수: ${disclosures.length}`,
    );

    // 1단계 진행 상황 알림
    await this.emitToWebSocket(socketId, 'analysisProgress', {
      query,
      corpCode,
      socketId,
      message: `AI가 '${stockName}'의 공시 데이터를 분석 중입니다. (1/2단계)`,
    });

    try {
      const response = await axios.post(
        this.openaiFunctionUrl,
        {
          stockName,
          disclosures,
        },
        {
          timeout: 60000, // 60초 타임아웃
        },
      );

      this.logger.debug(`[AIAnalysisService] AI Function 응답: ${JSON.stringify(response.data)}`);

      // 2단계 진행 상황 알림
      await this.emitToWebSocket(socketId, 'analysisProgress', {
        query,
        corpCode,
        socketId,
        message: `AI 분석 결과를 요약 중입니다. (2/2단계)`,
      });

      const result = response.data as AIAnalysisResult;

      this.logger.log(`[AIAnalysisService] AI 분석 성공: '${stockName}'`);
      return result;
    } catch (error: any) {
      this.logger.error(
        `[AIAnalysisService] AI 분석 오류 발생: ${error.message}`,
      );
      if (error.response) {
        this.logger.error(
          `[AIAnalysisService] Function 응답 에러: ${JSON.stringify(error.response.data)}`,
        );
      }

      // fallback result
      return this.createDefaultAnalysisResult(
        stockName,
        `AI 분석 중 오류 발생: ${error.message}`,
      );
    }
  }

  private async emitToWebSocket(
    socketId: string,
    eventName: string,
    data: any,
  ): Promise<void> {
    try {
      this.logger.debug(
        `[AIAnalysisService] emitToWebSocket 호출: socketId=${socketId}, event=${eventName}`,
      );

      await axios.post(`${this.websocketServerUrl}/emit`, {
        socketId,
        eventName,
        data,
      });

      this.logger.debug(
        `[AIAnalysisService] WebSocket emit 성공: socketId=${socketId}, event=${eventName}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[AIAnalysisService] WebSocket emit 실패: ${error.message}`,
      );
      if (error.response) {
        this.logger.error(
          `[AIAnalysisService] WebSocket 서버 응답 에러: ${JSON.stringify(error.response.data)}`,
        );
      }
    }
  }

  public createDefaultAnalysisResult(
    stockName: string,
    errorMessage: string,
  ): AIAnalysisResult {
    return {
      weatherSummary: '분석 중 오류 발생 또는 정보 부족',
      overallSentiment: 'NEUTRAL',
      sentimentScore: 0.5,
      keywords: [],
      reportSummary: errorMessage,
      detailedAnalysis: {
        positiveFactors: '공시 정보가 부족하거나 분석에 실패했습니다.',
        negativeFactors: '공시 정보가 부족하거나 분석에 실패했습니다.',
        neutralFactors: '공시 정보가 부족하거나 분석에 실패했습니다.',
        overallOpinion: errorMessage,
      },
      investmentOpinion: {
        opinion: '관망',
        confidence: 0.5,
        reason: errorMessage,
      },
      relatedStocks: [],
      overallNewsSummary: errorMessage,
    };
  }
}