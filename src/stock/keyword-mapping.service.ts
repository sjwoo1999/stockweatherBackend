// src/stock/keyword-mapping.service.ts
// 이 파일은 새롭게 생성해야 합니다.

import { Injectable, Logger } from '@nestjs/common';
import { stockMappings, StockMapping } from './stock-data'; // stock-data.ts에서 정의한 매핑 데이터 임포트

@Injectable()
export class KeywordMappingService {
  private readonly logger = new Logger(KeywordMappingService.name);

  // 사용자의 검색어를 정규화 (소문자 변환, 공백 제거 등)
  private normalizeQuery(query: string): string {
    return query.toLowerCase().replace(/\s+/g, '');
  }

  /**
   * 사용자의 쿼리에 해당하는 StockMapping 정보를 찾습니다.
   * 미리 정의된 stockMappings 데이터를 기반으로 검색어를 대표 종목명 및 관련 키워드에 매핑합니다.
   *
   * @param userQuery 사용자가 입력한 검색어
   * @returns StockMapping 객체 (primaryName, searchKeywords 포함)
   */
  getMapping(userQuery: string): StockMapping {
    const normalizedUserQuery = this.normalizeQuery(userQuery);

    // 1. primaryName (대표 종목명)에 정확히 일치하는 매핑을 먼저 찾습니다.
    //    이 경우, 사용자가 명확한 종목명을 입력했다고 판단합니다.
    for (const mapping of stockMappings) {
      if (this.normalizeQuery(mapping.primaryName) === normalizedUserQuery) {
        this.logger.debug(`[KeywordMappingService] Exact primaryName match found for: "${userQuery}" -> "${mapping.primaryName}"`);
        return mapping;
      }
    }

    // 2. primaryName에 일치하는 것이 없으면, searchKeywords (연관 키워드)에 일치하는 매핑을 찾습니다.
    //    예: '카카오뱅크' 입력 시 '카카오'의 searchKeywords에 포함될 경우
    for (const mapping of stockMappings) {
      if (mapping.searchKeywords.some(keyword => this.normalizeQuery(keyword) === normalizedUserQuery)) {
        this.logger.debug(`[KeywordMappingService] Keyword match found for: "${userQuery}" -> "${mapping.primaryName}"`);
        return mapping;
      }
    }

    // 3. 미리 정의된 어떤 매핑에도 일치하지 않는 경우,
    //    사용자가 입력한 쿼리 자체를 primaryName으로 사용하고, 해당 쿼리만을 searchKeywords로 반환합니다.
    //    이 경우, AI 분석 및 뉴스 검색은 입력된 쿼리 하나로만 진행됩니다.
    this.logger.warn(`[KeywordMappingService] No specific mapping found for: "${userQuery}". Using raw query.`);
    return {
      primaryName: userQuery,
      searchKeywords: [userQuery],
    };
  }
}