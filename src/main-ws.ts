import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { Server } from 'socket.io';

async function bootstrap() {
  const logger = new Logger('WebSocketBootstrap');
  
  // NestJS 앱 생성 (HTTP 서버 필요 없으면 미사용도 가능)
  const app = await NestFactory.create(AppModule, { cors: true });

  // HTTP 서버 래핑
  const httpServer = createServer(app.getHttpAdapter().getInstance());

  // WebSocket 서버 생성
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // TODO: 실제 프로덕션에선 안전하게 설정
    },
  });

  io.on('connection', (socket) => {
    logger.log(`Client connected: ${socket.id}`);

    socket.on('message', (msg) => {
      logger.log(`Received message: ${msg}`);
      socket.emit('message', `Echo: ${msg}`);
    });

    socket.on('disconnect', () => {
      logger.log(`Client disconnected: ${socket.id}`);
    });
  });

  const port = process.env.PORT || 8080;
  httpServer.listen(port, () => {
    logger.log(`🚀 WebSocket server is running on port ${port}`);
  });
}

bootstrap();
