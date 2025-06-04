// src/ai-analysis/ai-analysis.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { NewsArticle, AIAnalysisResult } from '../types/stock'; // 필요한 타입 임포트

@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private openai: OpenAI;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('CHATGPT_API_KEY');
    if (!apiKey) {
      this.logger.error('CHATGPT_API_KEY 환경 변수가 설정되지 않았습니다.');
      throw new Error('ChatGPT API Key is not configured.');
    }
    this.openai = new OpenAI({ apiKey });
    // AI 모델은 환경 변수에서 가져오고, 없으면 'gpt-4o'를 기본값으로 사용합니다.
    // 'gpt-4o'는 성능이 좋고 JSON 응답 처리가 강력하여 추천합니다.
    this.model = this.configService.get<string>('CHATGPT_MODEL') || 'gpt-4o';
  }

  /**
   * 주어진 뉴스 기사들을 기반으로 특정 종목에 대한 AI 분석을 수행합니다.
   * AI 분석 결과는 AIAnalysisResult 인터페이스에 정의된 JSON 형식으로 반환됩니다.
   * @param stockName 분석할 주식 종목명 (예: "삼성전자")
   * @param articles 분석에 사용할 뉴스 기사 배열
   * @returns AIAnalysisResult 형식의 분석 결과 객체
   */
  async analyzeStock(stockName: string, articles: NewsArticle[]): Promise<AIAnalysisResult> {
    this.logger.log(`[AIAnalysisService] Analyzing stock: '${stockName}' with ${articles.length} articles.`);

    // 뉴스 기사가 없으면 기본 분석 결과 반환
    if (articles.length === 0) {
      this.logger.warn(`[AIAnalysisService] No articles provided for '${stockName}'. Returning default analysis.`);
      return this.createDefaultAnalysisResult(stockName, "뉴스 기사가 부족하여 분석을 수행하기 어렵습니다.");
    }

    // 뉴스 기사들을 프롬프트에 전달하기 쉬운 텍스트 형식으로 결합
    const newsText = articles.map((article, index) =>
      `기사 ${index + 1}:\n제목: ${article.title}\n설명: ${article.description}\n링크: ${article.link}\n발행일: ${article.pubDate || '알 수 없음'}\n썸네일: ${article.thumbnail || '없음'}`
    ).join('\n---\n'); // 각 기사 사이에 명확한 구분자 추가

    // AI에게 전달할 프롬프트 정의
    const prompt = `
    너는 숙련된 주식 시장 전문가이자 금융 분석가이다.
    주어진 [종목명] 관련 뉴스 기사들을 심층적으로 분석하여, 현재 주가 및 향후 주가에 미칠 영향을 예측하고, 이에 따른 투자 의견을 제시해야 한다.
    분석은 객관적이고 사실에 기반해야 하며, 각 판단의 근거는 반드시 뉴스 기사 내용에서 찾아 제시해야 한다.

    ### 분석 지시 사항:
    1.  **날씨 요약 (weatherSummary)**: [종목명]의 현재 주식 시장 상황을 한 문장으로 간결하게 요약해라. 이 요약은 긍정적, 부정적, 중립적 분위기를 포함해야 한다. (예: "불확실한 대외 환경 속 낙폭 확대", "신사업 기대감에 긍정적 흐름")
    2.  **전반적 감성 (overallSentiment)**: 주어진 뉴스 기사들을 종합하여 [종목명]에 대한 전반적인 시장 심리를 다음 5가지 중 하나로 판단하라:
        * 'VERY_POSITIVE': 매우 긍정적 (강한 상승 기대)
        * 'POSITIVE': 긍정적 (상승 기대)
        * 'NEUTRAL': 중립 (큰 변동성 없음, 관망)
        * 'NEGATIVE': 부정적 (하락 우려)
        * 'VERY_NEGATIVE': 매우 부정적 (강한 하락 우려)
        판단 근거를 1~2문장으로 설명하라.
    3.  **감성 점수 (sentimentScore)**: 전반적 감성을 0부터 1 사이의 부동 소수점 값으로 표현하라. (0: 매우 부정, 0.25: 부정, 0.5: 중립, 0.75: 긍정, 1: 매우 긍정)
    4.  **키워드 (keywords)**: 분석에 중요하게 사용된 핵심 키워드들을 5개 이내로 제시하라. (예: ["실적 발표", "AI 반도체", "신사업 진출"])
    5.  **보고서 요약 (reportSummary)**: 전체 분석 보고서의 핵심 내용을 2~3문장으로 요약하여, 한눈에 주식의 상태를 파악할 수 있도록 작성하라.
    6.  **상세 분석 (detailedAnalysis)**: 다음 항목들을 포함하여 상세하게 분석하라:
        * **긍정적 요인**: 뉴스가 제시하는 긍정적인 측면과 그 구체적인 근거(뉴스 내용 인용 포함 가능).
        * **부정적 요인**: 뉴스가 제시하는 부정적인 측면과 그 구체적인 근거(뉴스 내용 인용 포함 가능).
        * **중립적 요인**: 주가에 직접적인 영향을 미치지 않거나, 긍정/부정 판단을 유보하게 만드는 중립적 정보와 그 근거.
        * **종합 의견**: 위 요인들을 바탕으로 [종목명]의 현재와 미래 주가에 대한 종합적인 전망을 제시하고, 투자자가 참고할 만한 핵심 포인트를 요약하라.
    7.  **투자 의견 (investmentOpinion)**:
        * **opinion**: '매수', '적정 매수', '관망', '적정 매도', '매도' 중 하나를 선택하라.
        * **confidence**: 투자 의견에 대한 너의 확신도를 0부터 1 사이의 부동 소수점 값으로 표현하라. (0: 확신 없음, 1: 매우 확신)
        * **reason**: 해당 투자 의견을 제시한 핵심적인 이유를 1~2문장으로 간결하게 설명하라.
    8.  **관련 주식 (relatedStocks)**: 뉴스에 언급되거나 [종목명]과 연관성이 높은 다른 주식 종목들을 2~3개 추출하고, 각 종목과의 관계(예: 경쟁사, 협력사, 자회사, 동종 산업, 공급망 등)를 구체적으로 설명하라. (예: [{"name": "삼성전자", "relationship": "주요 경쟁사"}, {"name": "LG에너지솔루션", "relationship": "배터리 산업 동종업계"}])
    9.  **전반적인 뉴스 요약 (overallNewsSummary)**: 제공된 모든 뉴스 기사의 내용을 통합하여 2~3문장으로 간결하게 요약하라. 이 요약은 개별 기사 내용을 넘어선 전체적인 흐름을 담아야 한다.

    ### 중요 지시 사항:
    * **정보 부족 시 대처**: 만약 주어진 뉴스 기사만으로는 위 분석 항목들을 충분히 채울 수 없다고 판단되면, 해당 항목에 대해 "정보 부족" 또는 "판단 불가"로 명시하고, 왜 그렇게 판단했는지 간략하게 설명하라. 억지로 내용을 채우려 하지 마라.
    * **출력 형식**: 모든 응답은 반드시 다음 JSON 형식으로만 제공해야 한다. 추가적인 설명이나 서론/결론, 인사말 등은 절대 포함하지 마라.
    * **한글 사용**: 모든 응답 내용은 한국어로 작성해야 한다.
    * **최신성**: 제공된 뉴스는 최근 뉴스이므로, 과거 정보에 기반한 판단은 피하라.

    ### 제공된 뉴스 기사:
    ${newsText}

    ### 출력할 JSON 형식:
    \`\`\`json
    {
      "weatherSummary": "...",
      "overallSentiment": "VERY_POSITIVE" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "VERY_NEGATIVE",
      "sentimentScore": 0.0,
      "keywords": ["...", "..."],
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
        {"name": "...", "relationship": "..."},
        {"name": "...", "relationship": "..."}
      ],
      "overallNewsSummary": "..."
    }
    \`\`\`
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `[종목명]: ${stockName}` },
        ],
        temperature: 0.7, // 창의성 조절 (0.0 - 1.0, 너무 낮으면 반복적, 너무 높으면 엉뚱함)
        response_format: { type: "json_object" }, // JSON 응답 강제 (중요!)
      });

      const rawResponse = completion.choices[0].message.content;
      if (!rawResponse) {
        throw new Error("AI 응답 내용이 비어 있습니다.");
      }
      this.logger.debug(`[AIAnalysisService] Raw AI Response: ${rawResponse}`);

      // JSON 파싱 시 발생할 수 있는 에러 처리 강화
      let parsedResult: AIAnalysisResult;
      try {
        parsedResult = JSON.parse(rawResponse);
        // 🚨 디버깅을 위한 추가 로그: 파싱된 detailedAnalysis의 실제 타입과 내용 확인
        this.logger.debug(`[AIAnalysisService] Parsed detailedAnalysis type: ${typeof parsedResult.detailedAnalysis}`);
        this.logger.debug(`[AIAnalysisService] Parsed detailedAnalysis content: ${JSON.stringify(parsedResult.detailedAnalysis)}`);
      } catch (jsonError) {
        this.logger.error(`[AIAnalysisService] JSON 파싱 실패: ${jsonError.message}, 원본 응답: ${rawResponse}`);
        throw new Error(`AI 응답 파싱 실패: ${jsonError.message}`);
      }

      this.logger.log(`[AIAnalysisService] AI analysis successful for '${stockName}'.`);

      // 파싱된 결과의 유효성을 최종적으로 검사하고 필요한 경우 기본값 설정
      // 예를 들어, detailedAnalysis가 객체가 아닌 경우를 대비한 방어 로직 (드물게 발생할 수 있음)
      if (typeof parsedResult.detailedAnalysis !== 'object' || parsedResult.detailedAnalysis === null) {
        this.logger.warn(`[AIAnalysisService] detailedAnalysis field is not an object or is null after parsing. Fixing... Raw: ${rawResponse}`);
        parsedResult.detailedAnalysis = {
          positiveFactors: (parsedResult.detailedAnalysis as any)?.positiveFactors || '분석 결과가 올바르지 않습니다.',
          negativeFactors: (parsedResult.detailedAnalysis as any)?.negativeFactors || '분석 결과가 올바르지 않습니다.',
          neutralFactors: (parsedResult.detailedAnalysis as any)?.neutralFactors || '분석 결과가 올바르지 않습니다.',
          overallOpinion: (parsedResult.detailedAnalysis as any)?.overallOpinion || 'AI 응답 형식 오류.',
        };
      }


      return parsedResult;

    } catch (error) {
      this.logger.error(`[AIAnalysisService] Error during AI analysis for '${stockName}': ${error.message}`);
      if (error.response) { // Axios 에러일 경우 (OpenAI API 에러도 여기에 해당될 수 있음)
        this.logger.error(`[AIAnalysisService] OpenAI API Response Error: ${JSON.stringify(error.response.data)}`);
      }
      // 에러 발생 시 기본값 반환
      return this.createDefaultAnalysisResult(stockName, `AI 분석 중 오류 발생: ${error.message}`);
    }
  }

  /**
   * AI 분석 중 에러가 발생하거나 뉴스 기사가 부족할 때 반환할 기본 분석 결과를 생성합니다.
   * @param stockName 주식 종목명
   * @param errorMessage 에러 메시지 또는 부족한 정보에 대한 설명
   * @returns AIAnalysisResult 형식의 기본 분석 결과 객체
   */
  private createDefaultAnalysisResult(stockName: string, errorMessage: string): AIAnalysisResult {
    return {
      weatherSummary: '분석 중 오류 발생 또는 정보 부족',
      overallSentiment: 'UNKNOWN',
      sentimentScore: 0,
      keywords: [],
      reportSummary: errorMessage,
      detailedAnalysis: { // 🚨 이 부분도 객체 형태로 올바르게 초기화되어 있습니다.
        positiveFactors: '뉴스 기사가 부족하거나 분석에 실패했습니다.',
        negativeFactors: '뉴스 기사가 부족하거나 분석에 실패했습니다.',
        neutralFactors: '뉴스 기사가 부족하거나 분석에 실패했습니다.',
        overallOpinion: errorMessage,
      },
      investmentOpinion: { opinion: '관망', confidence: 0 },
      relatedStocks: [],
      overallNewsSummary: `[${stockName}] 뉴스 요약 불가: ${errorMessage}`,
    };
  }
}