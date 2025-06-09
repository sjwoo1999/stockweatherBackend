import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsController } from './events.controller'; // 추가

@Module({
  providers: [EventsGateway],
  controllers: [EventsController], // 추가!
  exports: [EventsGateway],
})
export class EventsModule {}