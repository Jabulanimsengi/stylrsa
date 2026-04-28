import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

const describeDatabaseE2E =
  process.env.RUN_DB_E2E === 'true' ? describe : describe.skip;

describeDatabaseE2E('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((response: { body: { status: string; database: string; timestamp: string; uptime: number } }) => {
        expect(response.body.status).toBe('ok');
        expect(['ok', 'error']).toContain(response.body.database);
        expect(typeof response.body.timestamp).toBe('string');
        expect(typeof response.body.uptime).toBe('number');
      });
  });
});
