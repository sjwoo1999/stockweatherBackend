// stockweather-backend/src/ai-analysis/ai-analysis.service.ts

import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common'; // forwardRef 추가
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  AIAnalysisResult,
  KeywordSentiment,
  InvestmentOpinion,
  RelatedStock,
} from '../types/stock'; // AIAnalysisResult는 백엔드 types/stock에 정의되어 있다고 가정
import { DisclosureItem } from '../disclosure/interfaces/disclosure-item.interface';
import { EventsGateway } from '../events/events.gateway'; // EventsGateway import

@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private openai: OpenAI;
  private readonly model: string;

  constructor(
    private configService: ConfigService,
    // EventsGateway를 AIAnalysisService에 주입 (순환 의존성 발생 시 forwardRef 사용)
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {
    const apiKey = this.configService.get<string>('CHATGPT_API_KEY');
    if (!apiKey) {
      this.logger.error('CHATGPT_API_KEY 환경 변수가 설정되지 않았습니다.');
      throw new Error('ChatGPT API Key is not configured.');
    }
    this.openai = new OpenAI({ apiKey });
    this.model = this.configService.get<string>('CHATGPT_MODEL') || 'gpt-4o'; // 기본 모델을 gpt-4o로 설정
  }

  /**
   * 주어진 공시 정보들을 기반으로 특정 종목에 대한 AI 분석을 수행합니다.
   * AI 분석 결과는 AIAnalysisResult 인터페이스에 정의된 JSON 형식으로 반환됩니다.
   * @param stockName 분석할 주식 종목명 (예: "삼성전자")
   * @param disclosures 분석에 사용할 공시 정보 배열 (DisclosureItem[] 타입)
   * @param socketId 클라이언트의 WebSocket ID (진행 상황 알림용)
   * @param corpCode 종목 코드 (진행 상황 알림용)
   * @param query 초기 검색 쿼리 (진행 상황 알림용)
   * @returns AIAnalysisResult 형식의 분석 결과 객체
   */
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

    if (disclosures.length === 0) {
      this.logger.warn(
        `[AIAnalysisService] 공시 정보 부족. '${stockName}'에 대한 기본 분석 결과 반환.`,
      );
      return this.createDefaultAnalysisResult(
        stockName,
        '공시 정보가 부족하여 분석을 수행하기 어렵습니다.',
      );
    }

    // 공시 내용을 프롬프트에 포함하기 위한 텍스트 형식화
    const disclosureText = disclosures
      .map(
        (item, index) =>
          `공시 ${index + 1}:\n보고서명: ${item.report_nm}\n제출인: ${item.flr_nm}\n회사명: ${item.corp_name}\n접수일: ${item.rcept_dt}\n접수번호: ${item.rcept_no}\n${item.rmk ? `비고: ${item.rmk}\n` : ''}${item.reprt_code ? `보고서코드: ${item.reprt_code}\n` : ''}${item.bsns_year ? `사업연도: ${item.bsns_year}` : ''}`,
      )
      .join('\n---\n'); // 각 공시를 구분하기 위한 구분선

    const prompt = `
    너는 숙련된 주식 시장 전문가이자 금융 분석가이다.
    주어진 [종목명] 관련 DART 공시 정보들을 심층적으로 분석하여, 현재 주가 및 향후 주가에 미칠 영향을 예측하고, 이에 따른 투자 의견을 제시해야 한다.
    분석은 객관적이고 사실에 기반해야 하며, 각 판단의 근거는 반드시 공시 정보 내용에서 찾아 제시해야 한다.

    ### 분석 지시 사항:
    1.  **날씨 요약 (weatherSummary)**: [종목명]의 현재 주식 시장 상황을 한 문장으로 간결하게 요약해라. 이 요약은 긍정적, 부정적, 중립적 분위기를 포함해야 한다. (예: "불확실한 대외 환경 속 낙폭 확대", "신사업 기대감에 긍정적 흐름")
    2.  **전반적 감성 (overallSentiment)**: 주어진 공시 정보들을 종합하여 [종목명]에 대한 전반적인 시장 심리를 다음 5가지 중 하나로 판단하라:
        * 'VERY_POSITIVE': 매우 긍정적 (강한 상승 기대)
        * 'POSITIVE': 긍정적 (상승 기대)
        * 'NEUTRAL': 중립 (큰 변동성 없음, 관망)
        * 'NEGATIVE': 부정적 (하락 우려)
        * 'VERY_NEGATIVE': 매우 부정적 (강한 하락 우려)
        판단 근거를 1~2문장으로 설명하라.
    3.  **감성 점수 (sentimentScore)**: 전반적 감성을 0부터 1 사이의 부동 소수점 값으로 표현하라. (0: 매우 부정, 0.25: 부정, 0.5: 중립, 0.75: 긍정, 1: 매우 긍정)
    4.  **키워드 (keywords)**: 분석에 중요하게 사용된 핵심 키워드들을 5개 이내로 제시하고, 각 키워드에 대한 감성 ('POSITIVE', 'NEGATIVE', 'NEUTRAL')을 함께 제시하라.
        예: [{"text": "사업보고서", "sentiment": "NEUTRAL"}, {"text": "유상증자", "sentiment": "NEGATIVE"}]
    5.  **보고서 요약 (reportSummary)**: 전체 분석 보고서의 핵심 내용을 2~3문장으로 요약하여, 한눈에 주식의 상태를 파악할 수 있도록 작성하라.
    6.  **상세 분석 (detailedAnalysis)**: 다음 항목들을 포함하여 상세하게 분석하라:
        * **긍정적 요인**: 공시가 제시하는 긍정적인 측면과 그 구체적인 근거(공시 내용 인용 포함 가능).
        * **부정적 요인**: 공시가 제시하는 부정적인 측면과 그 구체적인 근거(공시 내용 인용 포함 가능).
        * **중립적 요인**: 주가에 직접적인 영향을 미치지 않거나, 긍정/부정 판단을 유보하게 만드는 중립적 정보와 그 근거.
        * **종합 의견**: 위 요인들을 바탕으로 [종목명]의 현재와 미래 주가에 대한 종합적인 전망을 제시하고, 투자자가 참고할 만한 핵심 포인트를 요약하라.
    7.  **투자 의견 (investmentOpinion)**:
        * **opinion**: '매수', '적정 매수', '관망', '적정 매도', '매도' 중 하나를 선택하라.
        * **confidence**: 투자 의견에 대한 너의 확신도를 0부터 1 사이의 부동 소수점 값으로 표현하라. (0: 확신 없음, 1: 매우 확신)
        * **reason**: 해당 투자 의견을 제시한 핵심적인 이유를 1~2문장으로 간결하게 설명하라.
    8.  **관련 주식 (relatedStocks)**: 공시에 언급되거나 [종목명]과 연관성이 높은 다른 주식 종목들을 2~3개 추출하고, 각 종목과의 관계(예: 경쟁사, 협력사, 자회사, 동종 산업, 공급망 등)를 구체적으로 설명하며, 해당 주식에 대한 간단한 투자 의견과 확신도를 제시하라.
        예: [{"name": "삼성전자", "opinion": "유지", "confidence": 0.7, "relationship": "주요 경쟁사"}]
    9. **전체 공시 요약 (overallNewsSummary)**: 모든 공시를 종합하여 하나의 포괄적인 요약 문단을 제공하라. 이 요약은 보고서 요약(reportSummary)보다 넓은 시야를 가지고 해당 종목의 전반적인 상황을 설명해야 한다.

    ### 중요 지시 사항:
    * **정보 부족 시 대처**: 만약 주어진 공시 정보만으로는 위 분석 항목들을 충분히 채울 수 없다고 판단되면, 해당 항목에 대해 "정보 부족" 또는 "판단 불가"로 명시하고, 왜 그렇게 판단했는지 간략하게 설명하라. 억지로 내용을 채우려 하지 마라.
    * **출력 형식**: 모든 응답은 반드시 다음 JSON 형식으로만 제공해야 한다. 추가적인 설명이나 서론/결론, 인사말 등은 절대 포함하지 마라.
    * **한글 사용**: 모든 응답 내용은 한국어로 작성해야 한다.
    * **최신성**: 제공된 공시는 최근 정보이므로, 과거 정보에 기반한 판단은 피하라.

    ### 제공된 DART 공시 정보:
    ${disclosureText}

    ### 출력할 JSON 형식:
    \`\`\`json
    {
      "weatherSummary": "...",
      "overallSentiment": "VERY_POSITIVE" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "VERY_NEGATIVE",
      "sentimentScore": 0.0,
      "keywords": [{"text": "...", "sentiment": "POSITIVE"}],
      "reportSummary": "...",
      "detailedAnalysis": {
        "positiveFactors": "...",
        "negativeFactors": "...",
        "neutralFactors": "...",
        "overallOpinion": "..."
      },
      "investmentOpinion": {
        "opinion": "매수" | "적정 매수" | "관망" | "적정 매도" | "매도",
        "confidence": 0.0,
        "reason": "..."
      },
      "relatedStocks": [
        {"name": "...", "opinion": "매수", "confidence": 0.0, "relationship": "..."},
        {"name": "...", "opinion": "매수", "confidence": 0.0, "relationship": "..."}
      ],
      "overallNewsSummary": "..."
    }
    \`\`\`
    `;

    try {
      // 1단계 진행 상황 알림 (AI API 호출 전)
      this.eventsGateway.sendToClient(socketId, 'analysisProgress', {
        query: query,
        corpCode: corpCode,
        socketId: socketId,
        message: `AI가 '${stockName}'의 공시 데이터를 분석 중입니다. (1/2단계)`,
      });
      this.logger.debug(
        `[AIAnalysisService] Emitting 'analysisProgress' (1/2) to ${socketId}`,
      );

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `[종목명]: ${stockName}` },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const rawResponse = completion.choices[0].message.content;
      if (!rawResponse) {
        throw new Error('AI 응답 내용이 비어 있습니다.');
      }
      this.logger.debug(`[AIAnalysisService] Raw AI Response: ${rawResponse}`);

      // 2단계 진행 상황 알림 (AI API 호출 후 JSON 파싱 전)
      this.eventsGateway.sendToClient(socketId, 'analysisProgress', {
        query: query,
        corpCode: corpCode,
        socketId: socketId,
        message: `AI 분석 결과를 요약 중입니다. (2/2단계)`,
      });
      this.logger.debug(
        `[AIAnalysisService] Emitting 'analysisProgress' (2/2) to ${socketId}`,
      );

      let parsedResult: AIAnalysisResult;
      try {
        parsedResult = JSON.parse(rawResponse);
        // 응답 데이터 유효성 검사 및 타입 강제 변환/기본값 설정

        // overallSentiment 유효성 검사 및 수정
        const validSentiments = [
          'VERY_POSITIVE',
          'POSITIVE',
          'NEUTRAL',
          'NEGATIVE',
          'VERY_NEGATIVE',
        ];
        if (!validSentiments.includes(parsedResult.overallSentiment)) {
          this.logger.warn(
            `[AIAnalysisService] Invalid overallSentiment received: ${parsedResult.overallSentiment}. Setting to NEUTRAL.`,
          );
          parsedResult.overallSentiment = 'NEUTRAL';
        }

        // sentimentScore 유효성 검사
        if (
          typeof parsedResult.sentimentScore !== 'number' ||
          parsedResult.sentimentScore < 0 ||
          parsedResult.sentimentScore > 1
        ) {
          this.logger.warn(
            `[AIAnalysisService] Invalid sentimentScore received: ${parsedResult.sentimentScore}. Setting to 0.5.`,
          );
          parsedResult.sentimentScore = 0.5;
        }

        // keywords 유효성 검사
        if (
          !Array.isArray(parsedResult.keywords) ||
          !parsedResult.keywords.every(
            (k) =>
              typeof k.text === 'string' &&
              validSentiments.includes(k.sentiment),
          )
        ) {
          this.logger.warn(
            `[AIAnalysisService] Keywords field is not in expected format. Attempting to fix.`,
          );
          parsedResult.keywords = ((parsedResult.keywords as any[]) || []).map(
            (k) => ({
              text: k.text || 'unknown',
              sentiment: validSentiments.includes(k.sentiment)
                ? k.sentiment
                : 'NEUTRAL',
            }),
          ) as KeywordSentiment[];
        }

        // detailedAnalysis 유효성 검사
        if (
          typeof parsedResult.detailedAnalysis !== 'object' ||
          parsedResult.detailedAnalysis === null
        ) {
          this.logger.warn(
            `[AIAnalysisService] detailedAnalysis field is not an object or is null after parsing. Fixing.`,
          );
          parsedResult.detailedAnalysis = {
            positiveFactors:
              (parsedResult.detailedAnalysis as any)?.positiveFactors ||
              '분석 결과가 올바르지 않습니다.',
            negativeFactors:
              (parsedResult.detailedAnalysis as any)?.negativeFactors ||
              '분석 결과가 올바르지 않습니다.',
            neutralFactors:
              (parsedResult.detailedAnalysis as any)?.neutralFactors ||
              '분석 결과가 올바르지 않습니다.',
            overallOpinion:
              (parsedResult.detailedAnalysis as any)?.overallOpinion ||
              'AI 응답 형식 오류.',
          };
        }

        // investmentOpinion 유효성 검사
        const validOpinions = [
          '매수',
          '적정 매수',
          '관망',
          '적정 매도',
          '매도',
        ];
        if (
          typeof parsedResult.investmentOpinion !== 'object' ||
          parsedResult.investmentOpinion === null ||
          !validOpinions.includes(parsedResult.investmentOpinion.opinion) ||
          typeof parsedResult.investmentOpinion.confidence !== 'number'
        ) {
          this.logger.warn(
            `[AIAnalysisService] investmentOpinion field is not in expected format. Fixing.`,
          );
          parsedResult.investmentOpinion = {
            opinion: validOpinions.includes(
              parsedResult.investmentOpinion?.opinion,
            )
              ? parsedResult.investmentOpinion.opinion
              : '관망',
            confidence:
              typeof parsedResult.investmentOpinion?.confidence === 'number'
                ? parsedResult.investmentOpinion.confidence
                : 0,
            reason:
              parsedResult.investmentOpinion?.reason || 'AI 응답 형식 오류.',
          };
        }

        // relatedStocks 유효성 검사
        if (!Array.isArray(parsedResult.relatedStocks)) {
          this.logger.warn(
            `[AIAnalysisService] relatedStocks field is not an array. Fixing.`,
          );
          parsedResult.relatedStocks = [];
        } else {
          parsedResult.relatedStocks = parsedResult.relatedStocks.map((rs) => ({
            name: rs.name || 'unknown',
            opinion: validOpinions.includes(rs.opinion) ? rs.opinion : '관망',
            confidence: typeof rs.confidence === 'number' ? rs.confidence : 0,
            relationship: rs.relationship || 'unknown',
          }));
        }

        // overallNewsSummary 유효성 검사
        if (typeof parsedResult.overallNewsSummary !== 'string') {
          this.logger.warn(
            `[AIAnalysisService] overallNewsSummary is not a string. Setting to default.`,
          );
          parsedResult.overallNewsSummary =
            '전체 공시 요약 정보를 불러올 수 없습니다.';
        }
      } catch (jsonError) {
        this.logger.error(
          `[AIAnalysisService] JSON 파싱 실패: ${jsonError.message}, 원본 응답: ${rawResponse}`,
        );
        throw new Error(`AI 응답 파싱 실패: ${jsonError.message}`);
      }

      this.logger.log(
        `[AIAnalysisService] AI analysis successful for '${stockName}'.`,
      );
      return parsedResult;
    } catch (error) {
      this.logger.error(
        `[AIAnalysisService] Error during AI analysis for '${stockName}': ${error.message}`,
      );
      if (error.response) {
        this.logger.error(
          `[AIAnalysisService] OpenAI API Response Error: ${JSON.stringify(error.response.data)}`,
        );
      }
      return this.createDefaultAnalysisResult(
        stockName,
        `AI 분석 중 오류 발생: ${error.message}`,
      );
    }
  }

  /**
   * AI 분석 중 에러가 발생하거나 공시 정보가 부족할 때 반환할 기본 분석 결과를 생성합니다.
   * @param stockName 주식 종목명
   * @param errorMessage 에러 메시지 또는 부족한 정보에 대한 설명
   * @returns AIAnalysisResult 형식의 기본 분석 결과 객체
   */
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
      overallNewsSummary: errorMessage, // overallNewsSummary 필드 추가
    };
  }
}
