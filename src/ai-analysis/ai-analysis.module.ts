// src/ai-analysis/ai-analysis.module.ts

import { Module } from '@nestjs/common';
import { AIAnalysisService } from './ai-analysis.service'; // AIAnalysisService 임포트

@Module({
  providers: [AIAnalysisService], // AIAnalysisService를 이 모듈의 '제공자'로 등록합니다.
  exports: [AIAnalysisService],   // 다른 모듈에서 AIAnalysisService를 사용할 수 있도록 '내보냅니다'.
})
export class AIAnalysisModule {}