// stockweather-backend/src/stock/stock.controller.ts

import { Controller, Get, Query, UseGuards, Req, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StockService } from './stock.service';
import { StockSearchResult } from '../types/stock';
import { Request } from 'express'; // req.user 타입 힌트를 위해 임포트 (필요한 경우)

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('search')
  async searchStock(
    @Query('query') query: string,
    @Req() req: Request
  ): Promise<StockSearchResult> {
    // 1. 입력 유효성 검사
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new BadRequestException('검색어는 필수이며 유효한 문자열이어야 합니다.');
    }

    try {
      // req.user에 대한 명시적인 타입이 없다면, 여기에서 바로 사용하지 않는 것이 좋습니다.
      // const userId = (req.user as any)?.userId; // 예시: JWT 페이로드에서 userId 추출
      // console.log(`[StockController] User ${userId} requested search for: ${query}`);

      const result = await this.stockService.searchStock(query);
      return result;
    } catch (error) {
      // 2. 에러 핸들링 강화
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof BadRequestException) {
        throw error;
      } else {
        console.error(`[StockController] 검색 중 예상치 못한 오류 발생: ${error.message}`, error.stack);
        throw new InternalServerErrorException('주식 정보를 검색하는 중 서버 오류가 발생했습니다.');
      }
    }
  }

  // 만약 나중에 특정 종목의 상세 정보를 ID로 가져오고 싶다면:
  // @Get(':id')
  // @UseGuards(AuthGuard('jwt'))
  // async getStockById(@Param('id') id: string): Promise<StockSearchResult> {
  //   // ... 서비스 호출 로직 ...
  // }
}