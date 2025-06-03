// stockweather-backend/src/stock/stock.module.ts

import { Module, forwardRef } from '@nestjs/common'; // ✨ forwardRef 임포트 ✨
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { NewsModule } from '../news/news.module';
import { AIAnalysisModule } from '../ai-analysis/ai-analysis.module';
import { AuthModule } from '../auth/auth.module';
import { KeywordMappingService } from './keyword-mapping.service';
import { EventsModule } from '../events/events.module'; // ✨ 상대 경로 확인: '../events/events.module' ✨

@Module({
  imports: [
    NewsModule,
    forwardRef(() => AIAnalysisModule), // ✨ StockService가 AIAnalysisService를 사용하므로 (순환 참조 가능성 고려) ✨
    AuthModule,
    forwardRef(() => EventsModule), // ✨ StockService가 EventsGateway를 사용하므로 (순환 참조 가능성 고려) ✨
  ],
  providers: [
    StockService,
    KeywordMappingService, // KeywordMappingService도 providers에 포함되어야 함
  ],
  controllers: [StockController],
  exports: [StockService], // StockService를 다른 모듈에서 사용한다면 export
})
export class StockModule {}