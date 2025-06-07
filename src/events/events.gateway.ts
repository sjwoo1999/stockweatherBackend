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
  cors: {
    origin: '*', // 실제 배포 시에는 특정 도메인으로 제한하는 것이 좋습니다.
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`[${EventsGateway.name}] Client connected: ${client.id}`);
    // 필요에 따라 여기에 연결된 클라이언트 관리 로직 추가
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `[${EventsGateway.name}] Client disconnected: ${client.id}`,
    );
    // 필요에 따라 여기에 연결 해제된 클라이언트 관리 로직 추가
  }

  // ⭐ sendEventToClient -> sendToClient 메서드 이름 변경 ⭐
  sendToClient(socketId: string, eventName: string, data: any): void {
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
  }

  @SubscribeMessage('message') // 예시: 클라이언트로부터 'message' 이벤트를 수신
  handleMessage(client: Socket, payload: any): void {
    this.logger.log(
      `[${EventsGateway.name}] Message from client ${client.id}: ${JSON.stringify(payload)}`,
    );
    // 여기서는 별도의 응답 없이 로그만 남깁니다.
  }
}
