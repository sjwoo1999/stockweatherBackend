// src/main.ts

import { createApp } from './bootstrap-app';
import { initializeDatabase } from './utils/database';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const mode = process.env.MODE || 'REST';
  const port = process.env.PORT || 8080;

  console.log(`Current MODE: ${mode}`);
  console.log(`Listening on PORT: ${port}`);

  const app = await createApp();

  if (mode === 'WS') {
    const httpServer = createServer(app.getHttpAdapter().getInstance());
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log(`WebSocket client connected: ${socket.id}`);
      socket.on('message', (msg) => {
        console.log(`Received message: ${msg}`);
        socket.emit('message', `Echo: ${msg}`);
      });
      socket.on('disconnect', () => {
        console.log(`WebSocket client disconnected: ${socket.id}`);
      });
    });

    httpServer.listen(port, () => {
      console.log(`🚀 WebSocket server running on port ${port}`);
    });

  } else {
    // REST MODE
    const config = new DocumentBuilder()
      .setTitle('StockWeather Backend API')
      .setDescription('The StockWeather Backend API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(port);
    console.log(`🚀 REST API server running on port ${port}`);

    await initializeDatabase(app);
  }
}

bootstrap();
