import { Controller, Post, Body, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { Response } from 'express'; // express Response 타입 임포트
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // JwtAuthGuard는 인증을 위해 필요합니다.

@Controller('api') // 또는 'stock' 등 적절한 경로
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @UseGuards(JwtAuthGuard)
  @Post('search')
  async searchStock(
    @Body('query') query: string,
    @Body('socketId') socketId: string,
    @Res() res: Response, // Express Response 객체를 주입받습니다.
  ) {
    if (!query || !socketId) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Query and socketId are required.' });
    }

    console.log(`[Backend] Search request received for: '${query}' from socket ID: ${socketId}`);

    try {
      // StockService에서 실제 분석을 시작하고 즉시 HTTP 응답을 보냅니다.
      // 분석 결과는 웹소켓을 통해 나중에 전송됩니다.
      this.stockService.processStockAnalysis(query, socketId); // 비동기 작업 시작

      return res.status(HttpStatus.ACCEPTED).json({ // HTTP 202 Accepted 응답
        message: `Search request for '${query}' received. Processing will continue via WebSocket.`,
        socketId: socketId,
      });
    } catch (error) {
      console.error('[Backend] Error initiating stock analysis:', error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to initiate stock analysis.',
        error: error.message,
      });
    }
  }
}