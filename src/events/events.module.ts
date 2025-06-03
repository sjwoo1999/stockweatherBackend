// stockweather-backend/src/events/events.module.ts

import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway'; // EventsGateway를 import 합니다.

@Module({
  providers: [EventsGateway], // EventsGateway를 이 모듈의 'providers'로 등록합니다.
  exports: [EventsGateway],   // <--- 중요: 다른 모듈(StockModule)에서 EventsGateway를 사용할 수 있도록 'exports'합니다.
})
export class EventsModule {}