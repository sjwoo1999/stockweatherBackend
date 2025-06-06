// stockweather-backend/src/stock/stock.controller.ts

import { Controller, Post, Body, UseGuards, HttpStatus, Res, Logger, Get, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';
import { DisclosureService, DartCompanyInfo } from '../disclosure/disclosure.service';


interface SearchRequestDto {
    query: string;
    socketId: string;
    selectedCorpCode?: string;
}

interface StockSuggestionDto {
    name: string;
    code: string; // 반드시 string 타입이어야 함
    stockCode?: string;
}

@Controller('api')
export class StockController {
    private readonly logger = new Logger(StockController.name);

    constructor(
        private readonly stockService: StockService,
        private readonly disclosureService: DisclosureService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('search')
    async searchStock(
        @Body() body: SearchRequestDto,
        @Res() res: Response,
    ) {
        const { query, socketId, selectedCorpCode } = body;
        this.logger.debug(`[StockController] searchStock 요청 수신: query=${query}, socketId=${socketId}, selectedCorpCode=${selectedCorpCode || '없음'}`);

        if (!query || query.trim() === '') {
            this.logger.warn(`[StockController] 유효하지 않은 검색어 요청: query=${query}`);
            return res.status(HttpStatus.BAD_REQUEST).json({ message: '검색어를 입력해주세요.' });
        }
        if (!socketId) {
            this.logger.warn(`[StockController] 소켓 ID 누락 요청: query=${query}`);
            return res.status(HttpStatus.BAD_REQUEST).json({ message: '소켓 ID가 누락되었습니다. 실시간 연결이 필요합니다.' });
        }

        try {
            await this.stockService.getStockAnalysisData(query, socketId, selectedCorpCode);
            this.logger.log(`[StockController] '${query}' 분석 요청 성공적으로 접수: socketId=${socketId}, corpCode=${selectedCorpCode || '자동 매핑'}`);
            return res.status(HttpStatus.ACCEPTED).json({
                message: '분석 요청이 성공적으로 접수되었습니다. 결과는 실시간으로 전송됩니다.',
                query: query,
                socketId: socketId,
                selectedCorpCode: selectedCorpCode
            });
        } catch (error) {
            this.logger.error(`[StockController] '${query}' 분석 요청 중 오류 발생: ${error.message || String(error)}`);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: '분석 요청 중 오류가 발생했습니다.',
                error: error.message || '알 수 없는 서버 오류'
            });
        }
    }

    // @UseGuards(JwtAuthGuard)
    @Get('suggest-stocks')
    async suggestStocks(
        @Query('query') query: string,
        @Res() res: Response,
    ) {
        this.logger.debug(`[StockController] suggestStocks 요청 수신: query=${query}`);

        if (!query || query.trim() === '') {
            this.logger.warn(`[StockController] 종목 제안: 유효하지 않은 검색어 요청: query=${query}`);
            return res.status(HttpStatus.BAD_REQUEST).json({ message: '검색어를 입력해주세요.' });
        }

        try {
            const suggestedCompanies: DartCompanyInfo[] = this.disclosureService.searchCompaniesByName(query);

            // ⭐ 새로운 디버그 로그: DisclosureService에서 받은 원본 DartCompanyInfo 객체들의 corp_code 값 확인 ⭐
            this.logger.debug(`[StockController] DisclosureService에서 받은 raw suggestedCompanies (쿼리: "${query}"):`);
            suggestedCompanies.forEach((company, index) => {
                this.logger.debug(`  [${index}] 회사명: ${company.corp_name}, 고유번호(raw): ${company.corp_code}, 타입: ${typeof company.corp_code}`);
            });
            // ⭐ 디버그 로그 끝 ⭐

            const suggestions: StockSuggestionDto[] = suggestedCompanies.map(company => ({
                name: company.corp_name || '',
                // ⭐ 수정: corp_code를 명시적으로 String으로 캐스팅하여 undefined 또는 null이 넘어오지 않도록 보장 ⭐
                code: String(company.corp_code || ''), 
                stockCode: company.stock_code || undefined,
            }));

            this.logger.log(`[StockController] '${query}'에 대한 종목 제안: ${suggestions.length}개`);
            return res.status(HttpStatus.OK).json(suggestions);
        } catch (error) {
            this.logger.error(`[StockController] 종목 제안 중 오류 발생: ${error.message || String(error)}`);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: '종목 제안 중 오류가 발생했습니다.',
                error: error.message || '알 수 없는 서버 오류'
            });
        }
    }
}
