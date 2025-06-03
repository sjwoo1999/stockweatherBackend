import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'; // OpenAI 라이브러리 임포트
import { NewsArticle, AIAnalysisResult, InvestmentOpinion, RelatedStock, KeywordSentiment } from '../types/stock'; // 필요한 타입 임포트

@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private openai: OpenAI; // OpenAI 클라이언트 인스턴스

  constructor(private configService: ConfigService) {
    const openAIApiKey = this.configService.get<string>('CHATGPT_API_KEY'); // 환경 변수 이름 확인

    if (!openAIApiKey) {
      this.logger.error('CHATGPT_API_KEY 환경 변수가 설정되지 않았습니다. AI 분석 서비스가 작동하지 않습니다.');
      // 실제 배포 환경에서는 여기에 throw new Error('API Key not configured.'); 를 추가하는 것이 좋습니다.
      // 개발 중에는 목업 데이터 반환 등으로 대체하여 서비스가 다운되지 않게 할 수 있습니다.
    } else {
      this.openai = new OpenAI({ apiKey: openAIApiKey });
      this.logger.log('[AIAnalysisService] OpenAI client initialized.');
    }
  }

  /**
   * AI 분석을 수행하여 주식 관련 분석 결과 (AIAnalysisResult)를 반환합니다.
   * 실제 ChatGPT API를 호출하여 뉴스 기사들을 기반으로 분석을 수행합니다.
   * @param stockName 분석할 종목명
   * @param articles 분석에 사용할 뉴스 기사 배열
   * @returns AIAnalysisResult AI 분석 결과 인터페이스
   */
  async analyzeStock(stockName: string, articles: NewsArticle[]): Promise<AIAnalysisResult> {
    this.logger.log(`[AIAnalysisService] Analyzing stock: ${stockName} with ${articles.length} articles.`);

    // API 키가 없으면 목업 데이터 또는 에러를 즉시 반환
    if (!this.openai) {
      this.logger.warn('[AIAnalysisService] OpenAI client not initialized. Returning mock analysis result.');
      return this.createDefaultAnalysisResult(stockName, 'OpenAI API 키가 설정되지 않아 AI 분석을 수행할 수 없습니다.');
    }

    if (articles.length === 0) {
      this.logger.warn(`[AIAnalysisService] No articles provided for ${stockName}. Returning default analysis.`);
      return this.createDefaultAnalysisResult(stockName, "뉴스 기사가 부족하여 분석이 어렵습니다.");
    }

    // 1. 뉴스 데이터를 프롬프트에 적합한 형태로 가공
    const newsContext = articles.map(news => {
      // pubDate가 유효한 Date 문자열인지 확인하여 ISO 형식으로 변환
      let formattedPubDate = 'N/A';
      try {
        if (news.pubDate) {
          const date = new Date(news.pubDate);
          if (!isNaN(date.getTime())) { // 유효한 날짜인지 확인
            formattedPubDate = date.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        this.logger.warn(`Failed to parse pubDate for article "${news.title}": ${news.pubDate}`);
      }

      return `
        <ARTICLE>
        <TITLE>${news.title}</TITLE>
        <DESCRIPTION>${news.description}</DESCRIPTION>
        <DATE>${formattedPubDate}</DATE>
        <LINK>${news.link}</LINK>
        </ARTICLE>
      `;
    }).join('\n');

    // 2. LLM에 보낼 프롬프트 생성
    const prompt = `
      You are an expert stock analyst specialized in interpreting Korean news sentiment for investment advice. Your task is to analyze the provided news articles about a specific stock and generate a concise, actionable report for an individual investor. **Base your analysis strictly on the provided news content.** If the news content is insufficient or contradictory, reflect that in your confidence score and analysis.

      ---
      [Context Information]
      **Stock Name:** ${stockName}
      **Recent News Articles (Past ${articles.length} articles - ordered by recency):**
      ${newsContext}

      ---
      [Instructions for Analysis and Output Format]
      Analyze the sentiment and implications of the provided news articles for '${stockName}'. Then, generate a JSON object with the following structure and content, in Korean:

      {
        "weatherSummary": "이 주식에 대한 AI 분석 결과 날씨를 요약해주세요. (예: 맑음, 비, 흐림 등 은유적 표현 포함)",
        "overallSentiment": "뉴스 내용을 종합하여 전체적인 감성(VERY_POSITIVE, POSITIVE, NEUTRAL, NEGATIVE, VERY_NEGATIVE, UNKNOWN 중 하나)을 판단해주세요.",
        "sentimentScore": [전체적인 감성 점수를 -1.0(매우 부정)에서 1.0(매우 긍정) 사이의 실수로 제시해주세요. (예: 0.75)],
        "keywords": [ // 뉴스에서 추출한 핵심 키워드 3-5개를 선정하고, 각 키워드에 대한 감성(POSITIVE, NEGATIVE, NEUTRAL, UNKNOWN)을 판단해주세요.
          { "text": "키워드1", "sentiment": "POSITIVE" },
          { "text": "키워드2", "sentiment": "NEGATIVE" }
        ],
        "reportSummary": "최신 뉴스들을 종합 분석하여 현재 시장 분위기(긍정적, 중립적, 부정적)를 한 문장으로 요약하고, 그 근거가 되는 핵심적인 내용 2-3문장을 포함해주세요. 제공된 뉴스만으로 판단하기 어렵다면 '정보 부족으로 판단하기 어렵습니다.'라고 명시하세요.",
        "detailedAnalysis": "AI 분석 상세 내용: 제공된 뉴스 기사들을 바탕으로 심층 분석을 수행하고, 각 키워드별로 어떤 뉴스에서 언급되었는지, 해당 뉴스의 감성은 어떠했는지 등에 대한 상세한 근거를 5-7문장으로 생성해주세요.",
        "investmentOpinion": {
          "opinion": "제시된 정보들을 바탕으로 구체적인 투자 조언(매수, 적정 매수, 유지, 적정 매도, 매도, 관망)을 내려주세요. 관련 종목의 opinion 타입에 정의된 '추가 매수', '적정 매수'는 사용하지 마세요. 오직 '매수', '매도', '유지', '관망' 중 하나를 선택하세요.",
          "confidence": [당신의 조언에 대한 신뢰도를 0.0에서 1.0 사이의 실수로 제시해주세요. (예: 0.7)]
        },
        "relatedStocks": [ // 분석된 '${stockName}'과 관련하여 투자자들이 관심 가질 만한 2-3개의 다른 종목을 추천해주세요. 각 종목에 대해 간략한 투자 의견(매수, 적정 매수, 유지, 적정 매도, 매도, 관망, 추가 매수, 적정 매수)과 해당 추천에 대한 신뢰도(0.0-1.0 사이의 실수)를 함께 제시해주세요. 관련 종목을 찾기 어렵다면 빈 배열로 반환하세요.
          { "name": "관련 종목명1", "opinion": "추가 매수", "confidence": 0.8 },
          { "name": "관련 종목명2", "opinion": "유지", "confidence": 0.6 }
        ],
        "overallNewsSummary": "[${stockName}] 주요 뉴스 요약: ${stockName}과 관련된 모든 뉴스 기사의 핵심 내용을 종합하여 2-3문장으로 요약해주세요. 특히 긍정적/부정적 포인트를 언급해주세요."
      }
      
      Important: Ensure the entire response is a single, valid JSON object. Do not include any text before or after the JSON.
    `;

    this.logger.log(`[AIAnalysisService] Generated prompt for ${stockName}: \n${prompt.substring(0, 1000)}... (truncated)`);

    try {
      // 3. ChatGPT API 호출
      const chatCompletion = await this.openai.chat.completions.create({
        model: "gpt-4o", // 현재 최신 강력 모델 (또는 gpt-3.5-turbo-0125 등 비용 효율적인 모델 선택)
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }, // JSON 형식 응답 강제 (매우 중요!)
        temperature: 0.7, // 0.0 (보수적) ~ 1.0 (창의적) 사이, 분석에서는 0.5-0.7 적합
        max_tokens: 2000, // LLM 응답의 최대 토큰 수
      });

      const llmResponseContent = chatCompletion.choices[0].message.content;
      if (!llmResponseContent) {
        throw new Error('ChatGPT 응답 내용이 비어 있습니다.');
      }
      this.logger.log(`[AIAnalysisService] Raw LLM response for ${stockName}: \n${llmResponseContent.substring(0, 1000)}... (truncated)`);

      // 4. LLM 응답 파싱
      const parsedResult: AIAnalysisResult = JSON.parse(llmResponseContent);
      this.logger.log(`[AIAnalysisService] Parsed LLM response for ${stockName}`);

      // 파싱된 결과의 유효성 검사 (강력 권장)
      // LLM이 항상 완벽한 응답을 주는 것은 아니므로, 주요 필드가 존재하는지 확인하고 타입 캐스팅
      const finalResult: AIAnalysisResult = {
        weatherSummary: parsedResult.weatherSummary || '분석 요약 없음',
        overallSentiment: parsedResult.overallSentiment || 'UNKNOWN',
        sentimentScore: parsedResult.sentimentScore !== undefined ? (parsedResult.sentimentScore > 1 ? parsedResult.sentimentScore / 100 : parsedResult.sentimentScore) : 0,
        keywords: Array.isArray(parsedResult.keywords) ? parsedResult.keywords.filter(k => k.text && k.sentiment) : [],
        reportSummary: parsedResult.reportSummary || '리포트 요약 없음',
        detailedAnalysis: parsedResult.detailedAnalysis || '상세 분석 없음',
        investmentOpinion: {
          opinion: parsedResult.investmentOpinion?.opinion || '관망',
          confidence: parsedResult.investmentOpinion?.confidence !== undefined ? (parsedResult.investmentOpinion.confidence > 1 ? parsedResult.investmentOpinion.confidence / 100 : parsedResult.investmentOpinion.confidence) : 0,
        },
        relatedStocks: Array.isArray(parsedResult.relatedStocks) ? parsedResult.relatedStocks.map(rs => ({
          name: rs.name,
          opinion: rs.opinion,
          confidence: rs.confidence !== undefined ? (rs.confidence > 1 ? rs.confidence / 100 : rs.confidence) : 0,
        })) : [],
        overallNewsSummary: parsedResult.overallNewsSummary || `[${stockName}] 전체 뉴스 요약 없음.`,
      };


      return finalResult;

    } catch (error) {
      this.logger.error(`[AIAnalysisService] Error calling LLM API or parsing response for ${stockName}:`, error.message, error.stack);
      // API 호출 실패 시 또는 파싱 오류 시 기본값 반환
      return this.createDefaultAnalysisResult(stockName, `AI 분석 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  // 오류 발생 시 또는 뉴스 기사 부족 시 반환할 기본 분석 결과
  private createDefaultAnalysisResult(stockName: string, errorMessage: string): AIAnalysisResult {
    return {
      weatherSummary: '분석 중 오류가 발생했습니다.',
      overallSentiment: 'UNKNOWN',
      sentimentScore: 0,
      keywords: [],
      reportSummary: errorMessage,
      detailedAnalysis: '현재 분석이 어렵습니다. 잠시 후 다시 시도해주세요.',
      investmentOpinion: { opinion: '관망', confidence: 0 },
      relatedStocks: [],
      overallNewsSummary: `[${stockName}] 뉴스 분석에 실패했습니다.`,
    };
  }
}