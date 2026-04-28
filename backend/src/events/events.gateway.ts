import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnGatewayInit } from '@nestjs/websockets';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: (
      process.env.CORS_ORIGIN || 'http://localhost:3001,http://localhost:3000'
    ).split(','),
    credentials: true,
  },
  maxHttpBufferSize: 1e6, // 1MB max message size
  pingTimeout: 20000, // 20 seconds
  pingInterval: 25000, // 25 seconds
  transports: ['websocket', 'polling'], // Allow fallback
})
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private connectedUsers: Map<string, Set<string>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server) {
    // Only enable Redis if explicitly configured in production
    const enableRedis = process.env.ENABLE_REDIS_ADAPTER === 'true';
    
    if (enableRedis && process.env.NODE_ENV === 'production') {
      try {
        const url = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
        if (url) {
          const pub = new Redis(url);
          const sub = new Redis(url);
          server.adapter(createAdapter(pub as any, sub as any));
          this.logger.log('Socket.IO Redis adapter enabled');
        }
      } catch (err) {
        this.logger.error('Failed to enable Redis adapter for Socket.IO', err instanceof Error ? err.stack : String(err));
      }
    } else {
      this.logger.log('Socket.IO using default in-memory adapter (single instance mode)');
    }

    // Start cleanup interval - remove stale connections every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 5 * 60 * 1000); // 5 minutes
  }

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (userId) {
      this.logger.log(`Authenticated socket connected: ${client.id}`);
      this.registerUserSocket(userId, client.id);
      void client.join(`user:${userId}`);
    } else {
      this.logger.warn(`Rejected unauthorized socket connection: ${client.id}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.connectedUsers.delete(userId);
        }
        break;
      }
    }
  }

  // FIX: Reverted method name to 'sendNotificationToUser'
  sendNotificationToUser(userId: string, event: string, data: any) {
    this.emitToUser(userId, event, data);
  }

  private registerUserSocket(userId: string, socketId: string) {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socketId);
  }

  private extractUserId(client: Socket): string | null {
    try {
      const rawCookie = client.handshake.headers?.cookie;
      const token = this.getCookie(rawCookie, 'access_token');
      if (token) {
        const secret = this.config.get<string>('JWT_SECRET');
        if (secret) {
          const payload = this.jwt.verify(token, { secret });
          if (payload?.sub && typeof payload.sub === 'string') {
            return payload.sub;
          }
        }
      }
    } catch {
      return null;
    }

    return null;
  }

  private getCookie(
    cookieHeader: string | undefined,
    name: string,
  ): string | null {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [k, v] = part.split('=');
      if (k && v && k.trim() === name) {
        try {
          return decodeURIComponent(v.trim());
        } catch {
          return v.trim();
        }
      }
    }
    return null;
  }

  private emitToUser(userId: string, event: string, data: any) {
    const socketIds = this.connectedUsers.get(userId);
    if (!socketIds || socketIds.size === 0) {
      return;
    }
    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, data);
    }
  }

  private cleanupStaleConnections() {
    const beforeSize = this.connectedUsers.size;
    const emptyUsers: string[] = [];

    // Find users with no active sockets
    for (const [userId, sockets] of this.connectedUsers.entries()) {
      if (sockets.size === 0) {
        emptyUsers.push(userId);
      }
    }

    // Remove empty entries
    for (const userId of emptyUsers) {
      this.connectedUsers.delete(userId);
    }

    if (emptyUsers.length > 0) {
      this.logger.log(
        `Cleaned up ${emptyUsers.length} stale user connections (${beforeSize} -> ${this.connectedUsers.size})`
      );
    }
  }

  onModuleDestroy() {
    // Clean up interval on shutdown
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
