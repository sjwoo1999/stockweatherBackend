// src/websocket/websocket-emitter.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WebSocketEmitterService {
  private readonly logger = new Logger(WebSocketEmitterService.name);
  private readonly websocketServerUrl: string;

  constructor(private configService: ConfigService) {
    this.websocketServerUrl =
      this.configService.get<string>('WEBSOCKET_SERVER_URL') || '';

    if (!this.websocketServerUrl) {
      this.logger.error('WEBSOCKET_SERVER_URL 환경 변수가 설정되지 않았습니다.');
      throw new Error('WEBSOCKET_SERVER_URL is not configured.');
    }
  }

  async emit(
    socketId: string,
    eventName: string,
    data: any,
  ): Promise<void> {
    try {
      this.logger.debug(
        `[WebSocketEmitterService] emit 호출: socketId=${socketId}, event=${eventName}`,
      );

      await axios.post(`${this.websocketServerUrl}/emit`, {
        socketId,
        eventName,
        data,
      });

      this.logger.debug(
        `[WebSocketEmitterService] WebSocket emit 성공: socketId=${socketId}, event=${eventName}`,
      );
    } catch (error: any) {
      this.logger.error(
        `[WebSocketEmitterService] WebSocket emit 실패: ${error.message}`,
      );
      if (error.response) {
        this.logger.error(
          `[WebSocketEmitterService] WebSocket 서버 응답 에러: ${JSON.stringify(error.response.data)}`,
        );
      }
    }
  }
}