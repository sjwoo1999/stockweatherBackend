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
      // 올바른 접근법 👇
      const clientSocket = this.server.sockets.sockets.get(socketId);

      if (clientSocket) {
        clientSocket.emit(eventName, data);
        this.logger.debug(
          `[${EventsGateway.name}] Event "${eventName}" sent to client ${socketId}`,
        );
      } else {
        this.logger.warn(
          `[${EventsGateway.name}] Client with socketId ${socketId} not found. Could not send event "${eventName}".`,
        );
      }
    } catch (err) {
      this.logger.error(
        `[${EventsGateway.name}] Error sending event "${eventName}" to client ${socketId}: ${err.message}`,
        err.stack,
      );
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.logger.log(`[EventsGateway] Message from client ${client.id}: ${JSON.stringify(payload)}`);
  }
}