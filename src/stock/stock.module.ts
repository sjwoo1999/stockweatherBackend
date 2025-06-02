// stockweather-backend/src/stock/stock.module.ts

import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { NewsModule } from '../news/news.module';
import { AIAnalysisModule } from '../ai-analysis/ai-analysis.module';
import { AuthModule } from '../auth/auth.module';
import { KeywordMappingService } from './keyword-mapping.service'; // ✨ KeywordMappingService 임포트 필요 ✨

@Module({
  imports: [
    NewsModule,
    AIAnalysisModule,
    AuthModule,
  ],
  providers: [
    StockService,
    KeywordMappingService, // ✨ KeywordMappingService를 providers에 추가 ✨
  ],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}