// src/stock/keyword-mapping.service.ts

import { Injectable } from '@nestjs/common';
import { StockMapping, stockMappings } from './stock-data';

@Injectable()
export class KeywordMappingService {
  private readonly defaultMapping: StockMapping = {
    keywords: [],
    primaryName: '알 수 없는 종목',
    corpCode: '', // 여기에 corpCode를 명시적으로 추가
    searchKeywords: ['주식', '시장'],
  };

  /**
   * 사용자의 쿼리에서 가장 적절한 종목 매핑을 찾습니다.
   * @param query 사용자의 입력 쿼리
   * @returns StockMapping 객체 또는 기본 매핑
   */
  getMapping(query: string): StockMapping {
    const lowerCaseQuery = query.toLowerCase().trim();

    // 정확한 매칭부터 시도
    for (const mapping of stockMappings) {
      if (
        mapping.keywords.includes(lowerCaseQuery) ||
        mapping.primaryName.toLowerCase() === lowerCaseQuery
      ) {
        return mapping;
      }
    }

    // 부분 일치 또는 포함 여부 확인 (예: "삼성" -> "삼성전자")
    for (const mapping of stockMappings) {
      if (
        mapping.keywords.some((keyword) => lowerCaseQuery.includes(keyword)) ||
        lowerCaseQuery.includes(mapping.primaryName.toLowerCase())
      ) {
        return mapping;
      }
    }

    // 일치하는 키워드가 없는 경우 검색 키워드를 기반으로 연관성 높은 매핑 반환 시도
    if (stockMappings.length > 0) {
      // query가 특정 종목과 관련이 없어도, 전체 시장의 흐름을 보여주기 위한
      // 일반적인 분석을 요청하는 경우를 고려해볼 수 있습니다.
      // 현재는 query에 해당하는 종목을 찾지 못하면 기본 매핑을 반환합니다.
    }

    return this.defaultMapping;
  }
}
