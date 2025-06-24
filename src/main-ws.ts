import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import jwt from 'jsonwebtoken';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  process.env.MODE = 'WS'; // 👈 모드 강제 지정

  // Hybrid 패턴 적용 (명시적 ExpressAdapter 사용)
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  await app.init();

  // 헬스체크 엔드포인트 추가
  expressApp.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      connected_clients: io.engine.clientsCount,
      server: 'NestJS-WebSocket'
    });
  });

  const httpServer = createServer(expressApp);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    transports: ['websocket'],
    maxHttpBufferSize: 1 * 1024 * 1024, // 1MB
  });

  // JWT 인증 미들웨어
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization'];
    if (!token) {
      socket.emit('auth_error', { message: 'JWT token required' });
      logger.error(`[Socket Auth] JWT token required. id=${socket.id}`);
      return next(new Error('JWT token required'));
    }
    
    // JWT_SECRET 확인 및 설정
    let jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('[Socket Auth] JWT_SECRET 환경변수가 설정되지 않았습니다.');
      logger.error('[Socket Auth] Cloud Run에서 JWT_SECRET 시크릿을 설정해주세요.');
      return next(new Error('JWT_SECRET not configured'));
    }
    
    try {
      const payload = jwt.verify(token, jwtSecret);
      socket.data.user = payload; // 사용자 정보 저장
      logger.log(`[Socket Auth] JWT 검증 성공: ${payload.sub || 'unknown'}, id=${socket.id}`);
      next();
    } catch (err) {
      socket.emit('auth_error', { message: 'Invalid or expired token' });
      logger.error(`[Socket Auth] JWT 검증 실패: ${err.message}, id=${socket.id}`);
      return next(new Error('Invalid or expired token'));
    }
  });

  // 연결 상태 모니터링 및 로깅
  function logClientCount() {
    logger.log(`[WebSocket] 현재 연결 수: ${io.engine.clientsCount}`);
  }

  io.on('connection', (socket) => {
    logger.log(`[WebSocket] Client connected: ${socket.id}`);
    logClientCount();

    socket.on('message', (msg) => {
      logger.log(`Received message: ${msg}`);
      socket.emit('message', `Echo: ${msg}`);
    });

    socket.on('disconnect', (reason) => {
      logger.log(`[WebSocket] Client disconnected: ${socket.id}, reason: ${reason}`);
      logClientCount();
    });
  });

  // 30초마다 연결 상태 체크
  setInterval(() => {
    logger.log(`[WebSocket] 연결 상태 체크: ${io.engine.clientsCount}명 연결 중`);
  }, 30000);

  // 안정적인 이벤트 전송 함수 (재시도 포함)
  async function emitWithRetry(socket, event, data, maxRetries = 3) {
    let attempt = 0;
    let delay = 1000;
    while (attempt < maxRetries) {
      try {
        if (socket.connected) {
          socket.emit(event, { ...data, socketId: socket.id });
          logger.log(`[Emit Retry] ${event} 성공 (시도 ${attempt + 1}): ${socket.id}`);
          return true;
        }
      } catch (err) {
        logger.error(`[Emit Retry] ${event} 실패 (시도 ${attempt + 1}): ${err}`);
      }
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
      attempt++;
    }
    logger.error(`[Emit Retry] ${event} 최종 실패: ${socket.id}`);
    return false;
  }

  const port = process.env.PORT || 8080;
  httpServer.listen(port, () => {
    logger.log(`🚀 WebSocket server running on port ${port}`);
  });
}

bootstrap();