// stockweather-backend/src/stock/stock.module.ts
import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller'; // StockController 임포트

@Module({
  providers: [StockService],
  controllers: [StockController], // 여기에 StockController 추가
  exports: [StockService], // 다른 모듈에서 StockService를 사용하려면 export 필요
})
export class StockModule {}