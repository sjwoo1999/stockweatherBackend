// stockweather-backend/src/events/events.module.ts

import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway], // EventsGateway를 이 모듈의 'providers'로 등록합니다.
  exports: [EventsGateway], // 다른 모듈(StockModule)에서 EventsGateway를 사용할 수 있도록 '내보냅니다'.
  // ✨ AIAnalysisModule은 EventsGateway의 생성자에 주입되지 않으므로, 여기서는 임포트할 필요 없음. ✨
  // 만약 EventsGateway가 직접 AIAnalysisService를 사용한다면 forwardRef(() => AiAnalysisModule)을 추가해야 함.
})
export class EventsModule {}
