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
  namespace: '/',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Map<string, { socket: Socket; connectedAt: Date }>();

  handleConnection(client: Socket) {
    this.logger.log(`[EventsGateway] Client connected: ${client.id}`);
    
    // 클라이언트 정보 저장
    this.connectedClients.set(client.id, {
      socket: client,
      connectedAt: new Date(),
    });

    // 연결 확인 이벤트 전송
    client.emit('connectionConfirmed', { socketId: client.id, timestamp: new Date().toISOString() });

    // 현재 연결된 소켓 목록 출력 (디버그용)
    const connectedSocketIds = Array.from(this.server.sockets.sockets.keys());
    this.logger.debug(`[EventsGateway] Connected socketIds: ${JSON.stringify(connectedSocketIds)}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[EventsGateway] Client disconnected: ${client.id}`);
    
    // 클라이언트 정보 제거
    this.connectedClients.delete(client.id);

    const connectedSocketIds = Array.from(this.server.sockets.sockets.keys());
    this.logger.debug(`[EventsGateway] Remaining socketIds after disconnect: ${JSON.stringify(connectedSocketIds)}`);
  }

  sendToClient(socketId: string, eventName: string, data: any): void {
    try {
      // 소켓이 실제로 연결되어 있는지 확인
      const socket = this.server.sockets.sockets.get(socketId);
      if (!socket) {
        this.logger.warn(`[EventsGateway] Socket ${socketId} is not connected. Cannot send event "${eventName}"`);
        return;
      }

      this.logger.log(
        `[EventsGateway] Sending event "${eventName}" to socketId="${socketId}"`,
      );
  
      // Socket.IO 공식 방식으로 emit
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

  // 소켓 ID 유효성 검사 메서드 추가
  isSocketConnected(socketId: string): boolean {
    return this.server.sockets.sockets.has(socketId);
  }

  // 연결된 모든 소켓 ID 반환
  getConnectedSocketIds(): string[] {
    return Array.from(this.server.sockets.sockets.keys());
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.logger.log(`[EventsGateway] Message from client ${client.id}: ${JSON.stringify(payload)}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket): void {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }
}