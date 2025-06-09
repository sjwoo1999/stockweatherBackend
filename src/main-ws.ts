// src/main-ws.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  process.env.MODE = 'WS'; // 👈 모드 강제 지정

  const app = await NestFactory.create(AppModule);
  await app.init();

  const httpServer = createServer(app.getHttpAdapter().getInstance());

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

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

  const port = process.env.PORT || 8080;

  httpServer.listen(port, () => {
    logger.log(`🚀 WebSocket server running on port ${port}`);
  });
}

bootstrap();