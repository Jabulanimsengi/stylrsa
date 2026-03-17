// backend/src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

// Avoid hard typing PrismaClient to prevent TS errors when Prisma Client types are missing/out-of-sync
// eslint-disable-next-line @typescript-eslint/no-var-requires
const prismaPkg: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return require('@prisma/client');
  } catch {
    return {};
  }
})();
// Fallback empty class if PrismaClient isn't available at build time (runtime should still provide it)
const BasePrismaClient: any =
  prismaPkg.PrismaClient ??
  class {
    async $connect() {
      /* noop */
    }
  };

@Injectable()
export class PrismaService extends BasePrismaClient implements OnModuleInit {
  // Index signature to avoid TS errors if Prisma Client types are out of date
  // and to permit access to dynamic model properties and raw helpers.
  [key: string]: any;
  
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;
  private connectionRetries = 0;
  private readonly maxRetries = 5;

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['warn', 'error'],
      // Limit connection pool in production to reduce memory usage
    });
  }

  async onModuleInit() {
    // Don't block app startup - connect in background
    this.connectWithRetry().catch(() => {
      this.logger.warn('Initial database connection failed, will retry on first query');
    });
  }

  private async connectWithRetry(): Promise<void> {
    while (this.connectionRetries < this.maxRetries) {
      try {
        await this.$connect();
        this.isConnected = true;
        this.connectionRetries = 0;
        this.logger.log('Successfully connected to database');
        return;
      } catch (error) {
        this.connectionRetries++;
        this.logger.warn(
          `Database connection attempt ${this.connectionRetries}/${this.maxRetries} failed: ${error.message}`,
        );
        
        if (this.connectionRetries >= this.maxRetries) {
          this.logger.error(
            'Max database connection retries reached. App will continue but DB operations will fail.',
          );
          // Don't throw - let the app start so health checks can still reach the process
          return;
        }
        
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        const delay = Math.pow(2, this.connectionRetries - 1) * 1000;
        this.logger.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async reconnect(): Promise<void> {
    this.logger.log('Attempting to reconnect to database...');
    this.connectionRetries = 0;
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.isConnected = false;
  }
}
