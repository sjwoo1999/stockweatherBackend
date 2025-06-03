// stockweather-backend/src/events/events.gateway.ts

// ⭐ 수정된 import 문: @nestjs/websockets에서 웹소켓 관련 데코레이터와 인터페이스 임포트 (MessageBody, ConnectedSocket 포함)
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody, // ⭐ 여기에 추가
    ConnectedSocket, // ⭐ 여기에 추가
  } from '@nestjs/websockets';
  
  // ⭐ socket.io에서 Server, Socket 타입 직접 임포트
  import { Server, Socket } from 'socket.io';
  
  // Logger만 @nestjs/common에서 임포트
  import { Logger } from '@nestjs/common';
  import { StockWeatherResponseDto } from '../types/stock';
  
  // 클라이언트 -> 서버 이벤트 (현재는 사용하지 않지만 정의)
  interface ClientToServerEvents {
    // noop: () => void; // 예시
  }
  
  // 서버 -> 클라이언트 이벤트 정의
  interface ServerToClientEvents {
    processingComplete: (data: StockWeatherResponseDto | { error: string, query?: string, socketId?: string }) => void;
    analysisProgress: (data: { status: string; message: string; query: string; socketId: string }) => void;
  }
  
  @WebSocketGateway({
    cors: {
      origin: '*', // 실제 배포 시에는 특정 도메인으로 제한하는 것이 좋습니다.
      credentials: true,
    },
  })
  export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server<ClientToServerEvents, ServerToClientEvents>;
    private readonly logger = new Logger(EventsGateway.name);
  
    afterInit(server: Server) {
      this.logger.log('WebSocket Gateway Initialized');
    }
  
    handleConnection(client: Socket, ...args: any[]) {
      this.logger.log(`Client connected: ${client.id}`);
      // 필요한 경우 클라이언트 연결 시 초기 로직 수행
    }
  
    handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`);
      // 클라이언트 연결 해제 시 정리 로직 수행
    }
  
    /**
     * 특정 클라이언트에게 분석 진행 상황을 보냅니다.
     * @param clientId 보낼 클라이언트의 Socket ID
     * @param status 현재 진행 단계의 상태 코드 (예: 'NEWS_SEARCH_STARTED', 'AI_ANALYSIS_STARTED')
     * @param message 클라이언트에 표시할 메시지
     * @param query 사용자가 검색한 원본 쿼리
     */
    sendAnalysisProgress(clientId: string, status: string, message: string, query: string) {
      this.server.to(clientId).emit('analysisProgress', { status, message, query, socketId: clientId });
      this.logger.debug(`'analysisProgress' event sent to client ${clientId}: ${status} - ${message}`);
    }
  
    /**
     * 특정 클라이언트에게 분석 완료 또는 오류 메시지를 보냅니다.
     * @param clientId 보낼 클라이언트의 Socket ID
     * @param data 최종 분석 결과 DTO 또는 오류 객체
     */
    sendProcessingComplete(clientId: string, data: StockWeatherResponseDto | { error: string, query?: string, socketId?: string }) {
      this.server.to(clientId).emit('processingComplete', data);
      if ('error' in data) {
        this.logger.error(`'processingComplete' (error) event sent to client ${clientId}: ${data.error}`);
      } else {
        this.logger.log(`'processingComplete' (success) event sent to client ${clientId}: Stock ${data.stock.name}`);
      }
    }
  
    // 예시: 클라이언트로부터 메시지를 받는 메서드
    // @SubscribeMessage('messageFromClient')
    // handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
    //   this.logger.log(`Received message from ${client.id}: ${data}`);
    //   client.emit('messageFromServer', `Server received: ${data}`);
    // }
  }