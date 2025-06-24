import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  ServerToClientEvents,
  ClientToServerEvents,
  StockWeatherResponseDto,
} from '../types/stock';

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  socketId: string | null;
  socketConnected: boolean;
  requestingSocketId: string | null;
  setRequestingSocketId: (id: string | null) => void;
  processingResult: StockWeatherResponseDto | null;
  setProcessingResult: (result: StockWeatherResponseDto | null) => void;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);
  const [requestingSocketId, setRequestingSocketId] = useState<string | null>(null);
  const [processingResult, setProcessingResult] = useState<StockWeatherResponseDto | null>(null);

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3000';

  const createSocketConnection = () => {
    if (typeof window === 'undefined') return null;

    const storedToken = localStorage.getItem('jwtToken');
    if (!storedToken) return null;

    const newSocket = io(socketUrl, {
      auth: { token: storedToken },
      transports: ['websocket', 'polling'], // 폴링도 허용하여 연결 안정성 향상
      forceNew: true, // 새로운 연결 강제 생성
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    return newSocket;
  };

  const setupSocketListeners = (socketInstance: Socket) => {
    socketInstance.on('connect', () => {
      const id = socketInstance.id;
      console.log('[Socket.IO] Connected to server:', id);
      setSocketId(id);
      setSocketConnected(true);
      
      // 연결 확인 이벤트 수신
      socketInstance.on('connectionConfirmed', (data) => {
        console.log('[Socket.IO] Connection confirmed:', data);
        if (data.socketId !== id) {
          console.warn('[Socket.IO] Socket ID mismatch detected');
          setSocketId(data.socketId);
        }
      });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server:', reason);
      setSocketConnected(false);
      setSocketId(null);
      
      // 소켓 ID 불일치 시 요청 ID 초기화
      if (requestingSocketId) {
        console.warn('[Socket.IO] Clearing requestingSocketId due to disconnect');
        setRequestingSocketId(null);
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('[Socket.IO] Connection Error:', err.message, err);
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
    });

    socketInstance.on('error', (err) => {
      console.error('[Socket.IO] General Error:', err);
    });

    socketInstance.on('processingComplete', (data: StockWeatherResponseDto) => {
      console.log('[SocketContext] processingComplete received:', data);
      setProcessingResult(data);
    });

    // 핑/퐁으로 연결 상태 확인
    socketInstance.on('pong', (data) => {
      console.log('[Socket.IO] Pong received:', data);
    });
  };

  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    const newSocket = createSocketConnection();
    if (newSocket) {
      setupSocketListeners(newSocket);
      socketRef.current = newSocket;
      setSocket(newSocket);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('jwtToken');

    if (!storedToken) {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
      setSocket(null);
      setSocketConnected(false);
      setSocketId(null);
      setRequestingSocketId(null);
      setProcessingResult(null);
      return;
    }

    // 기존 소켓이 있고 토큰이 같다면 재사용
    if (socketRef.current && socketRef.current.connected) {
      const currentAuth = socketRef.current.auth;
      if (currentAuth && typeof currentAuth === 'object' && 'token' in currentAuth && currentAuth.token === storedToken) {
        setSocket(socketRef.current);
        setSocketConnected(true);
        setSocketId(socketRef.current.id || null);
        return;
      }
    }

    // 새로운 소켓 연결 생성
    const newSocket = createSocketConnection();
    if (newSocket) {
      setupSocketListeners(newSocket);
      socketRef.current = newSocket;
      setSocket(newSocket);
    }

    return () => {
      if (socketRef.current) {
        console.log('[Socket.IO] Cleaning up Socket.IO listeners.');
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        socketRef.current.off('error');
        socketRef.current.off('processingComplete');
        socketRef.current.off('connectionConfirmed');
        socketRef.current.off('pong');
      }
    };
  }, []);

  // 소켓 ID 불일치 감지 및 처리
  useEffect(() => {
    if (requestingSocketId && socketId && socket?.connected) {
      const isStaleRequest = socket.id !== requestingSocketId;
  
      if (isStaleRequest) {
        console.warn('[SocketContext] Socket ID mismatch detected. Clearing stale request.');
        console.warn(`[SocketContext] Requesting: ${requestingSocketId}, Current: ${socket.id}`);
        setRequestingSocketId(null);
      }
    }
  }, [socket, socketId, requestingSocketId]);

  // 주기적으로 연결 상태 확인
  useEffect(() => {
    if (socketConnected && socket) {
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping');
        }
      }, 30000); // 30초마다 핑

      return () => clearInterval(pingInterval);
    }
  }, [socketConnected, socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketId,
        socketConnected,
        requestingSocketId,
        setRequestingSocketId,
        processingResult,
        setProcessingResult,
        reconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 