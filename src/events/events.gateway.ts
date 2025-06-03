// stockweather-backend/src/events/events.gateway.ts

import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  // ✨ 중요: NestJS의 IoAdapter는 main.ts에서 설정된 CORS를 따르므로,
  //          여기서는 불필요하게 중복 설정하거나 충돌을 일으킬 수 있는 cors 설정을 제거하는 것을 권장합니다.
  //          만약 특정 Gateway에만 다른 CORS 정책을 적용하려면 여기에 명시할 수 있지만,
  //          일반적으로 main.ts에서 전역 설정을 따르는 것이 좋습니다.
  // cors: { // 이 부분을 제거하거나 main.ts의 origin과 동일하게 맞춰주세요.
  //   origin: 'http://localhost:3000', // ✨ 실제 프론트엔드 애플리케이션의 URL로 변경하세요. ✨
  //   methods: ['GET', 'POST'],
  //   credentials: true,
  // },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server; // Socket.IO 서버 인스턴스

  private readonly logger = new Logger(EventsGateway.name);

  // WebSocket Gateway 초기화 시 호출됩니다.
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  // 클라이언트가 연결되었을 때 호출되는 메서드
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // 연결된 클라이언트에게 특정 초기 메시지를 보낼 수도 있습니다.
    // client.emit('welcome', `Hello, client ${client.id}!`);
  }

  // 클라이언트의 연결이 끊어졌을 때 호출되는 메서드
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * 특정 클라이언트에게 데이터 처리 완료 이벤트를 전송합니다.
   * @param clientId 데이터를 요청한 클라이언트의 ID
   * @param data 클라이언트에 전달할 결과 데이터
   */
  sendProcessingComplete(clientId: string, data: any) {
    // 특정 클라이언트에게 'processingComplete' 이벤트를 보냅니다.
    this.server.to(clientId).emit('processingComplete', data);
    this.logger.log(`'processingComplete' event sent to client ${clientId}`);
  }

  // 클라이언트로부터 'message' 이벤트를 수신하는 예시 (현재 시나리오에서는 사용되지 않을 수 있습니다)
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
    this.logger.log(`Received message from client ${client.id}: ${data}`);
    // 클라이언트에게 메시지를 다시 보내거나 다른 로직을 수행할 수 있습니다.
    client.emit('messageAck', `Server received: ${data}`);
  }
}