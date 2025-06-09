import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  process.env.MODE = 'WS'; // 👈 모드 강제 지정

  // 1️⃣ NestFactory → AppModule만 전달 (Express 수동 X)
  const app = await NestFactory.create(AppModule);
  await app.init();

  // 2️⃣ HTTP 서버 생성 (기본 NestAdapter 사용)
  const httpServer = createServer(app.getHttpAdapter().getInstance());

  // 3️⃣ Socket.IO 서버 붙이기
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // 4️⃣ Socket 이벤트 처리
  io.on('connection', (socket) => {
    logger.log(`WebSocket client connected: ${socket.id}`);

    socket.on('message', (msg) => {
      logger.log(`Received message: ${msg}`);
      socket.emit('message', `Echo: ${msg}`);
    });

    socket.on('disconnect', () => {
      logger.log(`WebSocket client disconnected: ${socket.id}`);
    });
  });

  // 5️⃣ Listen on PORT
  const port = process.env.PORT || 8080;
  httpServer.listen(port, () => {
    logger.log(`🚀 WebSocket server running on port ${port}`);
  });
}

bootstrap();