// src/main-ws.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as express from 'express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  process.env.MODE = 'WS'; // 👈 모드 강제 지정

  // Express 인스턴스 수동 생성
  const expressApp = express();
  expressApp.use(express.json());

  // Nest 애플리케이션을 Express 위에 올리기
  const app = await NestFactory.create(AppModule, expressApp as any);
  await app.init();

  // Socket.io와 HTTP 서버 결합
  const httpServer = createServer(expressApp);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // 연결된 소켓 관리
  const connectedSockets = new Map<string, any>();

  io.on('connection', (socket) => {
    logger.log(`WebSocket client connected: ${socket.id}`);
    connectedSockets.set(socket.id, socket);

    socket.on('message', (msg) => {
      logger.log(`Received message: ${msg}`);
      socket.emit('message', `Echo: ${msg}`);
    });

    socket.on('disconnect', () => {
      logger.log(`WebSocket client disconnected: ${socket.id}`);
      connectedSockets.delete(socket.id);
    });
  });

  // REST API endpoint 추가 (중요)
  expressApp.post('/emit', (req, res) => {
    const { socketId, eventName, data } = req.body;
    const targetSocket = connectedSockets.get(socketId);

    if (targetSocket) {
      targetSocket.emit(eventName, data);
      logger.log(`Sent event '${eventName}' to client ${socketId}`);
      res.status(200).send({ success: true });
    } else {
      logger.warn(`Socket ${socketId} not found`);
      res.status(404).send({ error: 'Socket not found' });
    }
  });

  const port = process.env.PORT || 8080;
  httpServer.listen(port, () => {
    logger.log(`🚀 WebSocket server running on port ${port}`);
  });
}

bootstrap();