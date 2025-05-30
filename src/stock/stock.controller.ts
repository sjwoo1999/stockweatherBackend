// stockweather-backend/src/stock/stock.controller.ts
import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { StockService } from './stock.service';

import { StockSearchResult } from '../types/stock'; // StockSearchResult 타입 임포트

@Controller('stock') // 기본 경로를 '/stock'으로 설정
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('search') // GET /stock/search 엔드포인트
  async searchStock(
    @Query('query') query: string, // URL 쿼리 파라미터 'query'를 받음
  ): Promise<StockSearchResult> {
    try {
      const result = await this.stockService.searchStockInfo(query);
      return result;
    } catch (error) {
      // StockService에서 던진 NotFoundException을 그대로 다시 던집니다.
      // NestJS가 이를 404 HTTP 응답으로 변환합니다.
      throw error; 
    }
  }

  // 만약 나중에 특정 종목의 상세 정보를 ID로 가져오고 싶다면:
  // @Get(':id') // GET /stock/:id 엔드포인트
  // async getStockById(@Param('id') id: string): Promise<StockSearchResult> {
  //   // ... 서비스 호출 로직 ...
  // }
}