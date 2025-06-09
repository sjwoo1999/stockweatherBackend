// src/events/events.controller.ts

import { Controller, Post, Body, Logger } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Controller('emit')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsGateway: EventsGateway) {}

  @Post()
  async emitToClient(@Body() body: { socketId: string; eventName: string; data: any }) {
    const { socketId, eventName, data } = body;
    this.logger.log(`[EventsController] emit 요청 수신: socketId=${socketId}, eventName=${eventName}`);

    try {
      this.eventsGateway.sendToClient(socketId, eventName, data);
      return { success: true };
    } catch (err) {
      this.logger.error(
        `[EventsController] emit 처리 중 오류 발생: ${err.message}`,
        err.stack,
      );
      return { success: false, error: err.message };
    }
  }
}