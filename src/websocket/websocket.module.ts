// src/websocket/websocket.module.ts

import { Module } from '@nestjs/common';
import { WebSocketEmitterService } from './websocket-emitter.service';

@Module({
  providers: [WebSocketEmitterService],
  exports: [WebSocketEmitterService], // 외부에서 사용 가능하도록
})
export class WebSocketModule {}