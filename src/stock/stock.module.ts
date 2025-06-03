// stockweather-backend/src/stock/stock.module.ts

import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { NewsModule } from '../news/news.module';
import { AIAnalysisModule } from '../ai-analysis/ai-analysis.module';
import { AuthModule } from '../auth/auth.module';
import { KeywordMappingService } from './keyword-mapping.service';
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [
    NewsModule,
    AIAnalysisModule,
    AuthModule,
    EventsModule, // EventsModule을 imports 배열에 추가합니다.
  ],
  providers: [
    StockService,
    KeywordMappingService,
  ],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}