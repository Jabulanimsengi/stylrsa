// frontend/src/context/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';

const SocketContext = createContext<Socket | null>(null);
const SocketStatusContext = createContext({ isConnected: false, isRegistered: false });

export const useSocket = () => {
  return useContext(SocketContext);
};

export const useSocketStatus = () => {
  return useContext(SocketStatusContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState({ isConnected: false, isRegistered: false });
  const { authStatus, user } = useAuth();
  const userId = user?.id;
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (authStatus === 'loading') {
      return;
    }

    if (authStatus !== 'authenticated' || !userId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setStatus({ isConnected: false, isRegistered: false });
      return;
    }

    // Dynamically import socket.io-client to reduce initial bundle size
    const connectionDelay = setTimeout(async () => {
      const { io } = await import('socket.io-client');
      
      const WS_URL = process.env.NEXT_PUBLIC_WS_URL || undefined;
      
      const socketOptions: Parameters<typeof io>[1] = { 
        withCredentials: true,
        query: authStatus === 'authenticated' && userId ? { userId } : {},
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 30000,
        timeout: 30000,
        transports: ['polling', 'websocket'],
      };
      
      const newSocket = io(WS_URL, socketOptions);
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        reconnectAttempts.current = 0;
        setStatus({ isConnected: true, isRegistered: Boolean(userId) });
        if (userId) newSocket.emit('register', userId);
      });

      newSocket.on('disconnect', (reason: string) => {
        console.log('Socket disconnected:', reason);
        setStatus({ isConnected: false, isRegistered: false });
      });

      newSocket.on('connect_error', () => {
        reconnectAttempts.current++;
        setStatus({ isConnected: false, isRegistered: false });
      });

      newSocket.io.on('reconnect_attempt', (attempt: number) => {
        console.log(`Socket reconnecting... (${attempt}/${maxReconnectAttempts})`);
      });

      newSocket.io.on('reconnect_failed', () => {
        console.warn('Socket reconnection failed - backend may be sleeping');
      });

      newSocket.on('newBooking', (data) => {
        try {
          toast.info(`New Booking: ${data?.service?.title || 'Service'} from ${data?.client?.firstName || 'Client'}`);
        } catch { /* ignore */ }
      });

      newSocket.on('bookingUpdate', (data) => {
        try {
          toast.success(`Booking ${data?.status?.toLowerCase() || 'updated'}!`);
        } catch { /* ignore */ }
      });

      newSocket.on('error', () => { /* silently ignore */ });

      setSocket(newSocket);
    }, 2000);

    return () => {
      clearTimeout(connectionDelay);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      setStatus({ isConnected: false, isRegistered: false });
    };
  }, [authStatus, userId]);

  return (
    <SocketContext.Provider value={socket}>
      <SocketStatusContext.Provider value={status}>
        {children}
      </SocketStatusContext.Provider>
    </SocketContext.Provider>
  );
};
