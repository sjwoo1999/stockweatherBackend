// src/events/events.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/', // ⭐️ 네임스페이스 명시
  cors: {
    origin: '*', // 배포 시엔 도메인 명시 추천
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`[EventsGateway] Client connected: ${client.id}`);

    // 현재 연결된 소켓 목록 출력 (디버그용)
    const connectedSocketIds = Array.from(this.server.sockets.sockets.keys());
    this.logger.debug(`[EventsGateway] Connected socketIds: ${JSON.stringify(connectedSocketIds)}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[EventsGateway] Client disconnected: ${client.id}`);

    const connectedSocketIds = Array.from(this.server.sockets.sockets.keys());
    this.logger.debug(`[EventsGateway] Remaining socketIds after disconnect: ${JSON.stringify(connectedSocketIds)}`);
  }

  sendToClient(socketId: string, eventName: string, data: any): void {
    try {
      this.logger.log(
        `[EventsGateway] Sending event "${eventName}" to socketId="${socketId}"`,
      );
  
      // Socket.IO 공식 방식으로 emit → 이게 REST API 경유 / WebSocket 둘 다 잘 됨
      this.server.to(socketId).emit(eventName, data);
  
      this.logger.log(
        `[EventsGateway] Successfully sent "${eventName}" to socketId="${socketId}"`,
      );
    } catch (err) {
      this.logger.error(
        `[EventsGateway] Error sending event "${eventName}" to client ${socketId}: ${err.message}`,
        err.stack,
      );
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.logger.log(`[EventsGateway] Message from client ${client.id}: ${JSON.stringify(payload)}`);
  }
}