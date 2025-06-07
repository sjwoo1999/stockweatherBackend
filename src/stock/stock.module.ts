// src/stock/stock.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { AIAnalysisModule } from '../ai-analysis/ai-analysis.module';
import { AuthModule } from '../auth/auth.module';
import { KeywordMappingService } from './keyword-mapping.service';
import { EventsModule } from '../events/events.module';
import { DisclosureModule } from '../disclosure/disclosure.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../users/users.module'; // ⭐ 추가: UsersModule 임포트 ⭐

@Module({
  imports: [
    forwardRef(() => AIAnalysisModule),
    AuthModule,
    forwardRef(() => EventsModule),
    DisclosureModule,
    ConfigModule,
    UsersModule, // ⭐ 중요: UsersModule 추가 ⭐
  ],
  providers: [StockService, KeywordMappingService],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}
