// src/ai-analysis/ai-analysis.module.ts

import { Module, forwardRef } from '@nestjs/common'; // ⭐ forwardRef를 임포트합니다. ⭐
import { AIAnalysisService } from './ai-analysis.service';
import { ConfigModule } from '@nestjs/config'; // ConfigService를 사용하므로 ConfigModule이 필요합니다.
import { EventsModule } from '../events/events.module'; // ⭐ EventsModule을 임포트합니다. ⭐

@Module({
  imports: [
    ConfigModule, // AIAnalysisService에서 ConfigService를 사용하므로 ConfigModule을 임포트합니다.
    forwardRef(() => EventsModule), // ⭐ EventsGateway를 사용하므로 EventsModule을 임포트합니다. ⭐
  ],
  providers: [AIAnalysisService],
  exports: [AIAnalysisService],
})
export class AIAnalysisModule {}