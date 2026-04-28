import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

jest.setTimeout(60000);

const describeDatabaseE2E =
  process.env.RUN_DB_E2E === 'true' ? describe : describe.skip;

describeDatabaseE2E('Core multi-role flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const createdUserEmails: string[] = [];
  const createdUserIds: string[] = [];
  const createdSalonIds: string[] = [];
  const createdServiceIds: string[] = [];
  const createdBookingIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    for (const bookingId of createdBookingIds) {
      try {
        await prisma.booking.delete({ where: { id: bookingId } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          console.warn('Booking cleanup failed', bookingId, error);
        }
      }
    }

    for (const serviceId of createdServiceIds) {
      try {
        await prisma.service.delete({ where: { id: serviceId } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          console.warn('Service cleanup failed', serviceId, error);
        }
      }
    }

    for (const salonId of createdSalonIds) {
      try {
        await prisma.salon.delete({ where: { id: salonId } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          console.warn('Salon cleanup failed', salonId, error);
        }
      }
    }

    if (createdUserIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
    }

    for (const email of createdUserEmails) {
      try {
        await prisma.user.delete({ where: { email } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          console.warn('User cleanup failed', email, error);
        }
      }
    }

    await prisma.$disconnect();
    await app.close();
  });

  const createVerifiedUser = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'SALON_OWNER' | 'CLIENT';
  }) => {
    const passwordHash = await argon2.hash(payload.password);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        password: passwordHash,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role,
        onboardingStatus:
          payload.role === 'SALON_OWNER' ? 'PROVIDER_SETUP_REQUIRED' : 'COMPLETE',
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    createdUserEmails.push(payload.email);
    createdUserIds.push(user.id);
    return user;
  };

  const loginAs = async (
    agent: any,
    credentials: { email: string; password: string },
  ) => {
    const response = await agent
      .post('/api/auth/login')
      .send(credentials)
      .expect(200);

    return response.body.user as {
      id: string;
      email: string;
      role: string;
      salonId?: string | null;
    };
  };

  it('supports admin approval, salon setup, and booking confirmation across active roles', async () => {
    const httpServer = app.getHttpServer();
    const adminAgent = request.agent(httpServer);
    const ownerAgent = request.agent(httpServer);
    const clientAgent = request.agent(httpServer);
    const timestamp = Date.now();

    const adminCredentials = {
      email: `admin-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN' as const,
    };
    const ownerCredentials = {
      email: `owner-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Owner',
      lastName: 'One',
      role: 'SALON_OWNER' as const,
    };
    const clientCredentials = {
      email: `client-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Client',
      lastName: 'Tester',
      role: 'CLIENT' as const,
    };

    const adminUser = await createVerifiedUser(adminCredentials);
    const ownerUser = await createVerifiedUser(ownerCredentials);
    const clientUser = await createVerifiedUser(clientCredentials);

    await loginAs(adminAgent, adminCredentials);
    await loginAs(ownerAgent, ownerCredentials);
    await loginAs(clientAgent, clientCredentials);

    const categoriesResponse = await request(httpServer)
      .get('/api/categories')
      .expect(200);
    const categories = categoriesResponse.body as Array<{ id: string }>;
    expect(categories.length).toBeGreaterThan(0);

    const salonPayload = {
      name: 'Complete Flow Salon',
      description: 'Salon used for current multi-role testing.',
      address: '45 Flow Street',
      town: 'Testown',
      city: 'Cape Town',
      province: 'Western Cape',
      phone: '+27821234568',
      email: 'contact@flow-salon.test',
      offersMobile: true,
      operatingHours: [
        { day: 'Monday', open: '09:00', close: '17:00' },
        { day: 'Tuesday', open: '09:00', close: '17:00' },
      ],
      operatingDays: ['Monday', 'Tuesday'],
      hasSentProof: true,
      paymentReference: 'FLOW-SALON-REF',
    };

    const createSalonResponse = await ownerAgent
      .post('/api/salons')
      .send(salonPayload)
      .expect(201);
    const salon = createSalonResponse.body;
    expect(salon.planPaymentStatus).toBe('PROOF_SUBMITTED');
    createdSalonIds.push(salon.id);

    await adminAgent
      .patch(`/api/admin/salons/${salon.id}/plan/payment`)
      .send({ status: 'VERIFIED', paymentReference: 'FLOW-SALON-VERIFIED' })
      .expect(200);

    await adminAgent
      .patch(`/api/admin/salons/${salon.id}/status`)
      .send({ approvalStatus: 'APPROVED' })
      .expect(200);

    const servicePayload = {
      title: 'Signature Cut',
      description: 'Precision haircut and style.',
      price: 450,
      duration: 60,
      images: ['https://example.com/service.jpg'],
      salonId: salon.id,
      categoryId: categories[0].id,
    };

    const createServiceResponse = await ownerAgent
      .post('/api/services')
      .send(servicePayload)
      .expect(201);
    const service = createServiceResponse.body;
    createdServiceIds.push(service.id);

    await adminAgent
      .patch(`/api/admin/services/${service.id}/status`)
      .send({ approvalStatus: 'APPROVED' })
      .expect(200);

    const forbiddenResponse = await clientAgent
      .get('/api/admin/salons/pending')
      .expect(403);
    expect(forbiddenResponse.body.code).toBe('PERMISSION_DENIED');

    const bookingTime = new Date(Date.now() + 3600000).toISOString();
    const bookingResponse = await clientAgent
      .post('/api/bookings')
      .send({
        serviceId: service.id,
        bookingTime,
        isMobile: false,
        clientPhone: '0820000001',
      })
      .expect(201);
    const booking = bookingResponse.body;
    expect(booking.status).toBe('PENDING');
    createdBookingIds.push(booking.id);

    const bookingUpdateResponse = await ownerAgent
      .patch(`/api/bookings/${booking.id}/status`)
      .send({ status: 'CONFIRMED' })
      .expect(200);
    expect(bookingUpdateResponse.body.status).toBe('CONFIRMED');

    const clientNotifications = await clientAgent
      .get('/api/notifications')
      .expect(200);
    const bookingNotification = (clientNotifications.body.items as Array<{ message?: string }>).find(
      (item) =>
        typeof item.message === 'string' &&
        item.message.includes('booking') &&
        item.message.includes('confirmed'),
    );
    expect(bookingNotification).toBeDefined();

    await adminAgent
      .delete(`/api/admin/salons/${salon.id}`)
      .send({ reason: 'Routine test cleanup' })
      .expect(200);

    createdSalonIds.splice(createdSalonIds.indexOf(salon.id), 1);

    const deletedSalon = await prisma.salon.findUnique({
      where: { id: salon.id },
    });
    expect(deletedSalon).toBeNull();

    expect(adminUser.role).toBe('ADMIN');
    expect(ownerUser.role).toBe('SALON_OWNER');
    expect(clientUser.role).toBe('CLIENT');
  });

  it('allows a user to sign up as a salon owner via Google OAuth', async () => {
    const httpServer = app.getHttpServer();
    const timestamp = Date.now();
    const googleUser = {
      provider: 'google',
      providerAccountId: `google-test-id-${timestamp}`,
      email: `salon-owner-${timestamp}@test.com`,
      name: 'Salon Owner',
      role: 'SALON_OWNER',
    };

    createdUserEmails.push(googleUser.email);

    const response = await request(httpServer)
      .post('/api/auth/sso')
      .send(googleUser)
      .expect(200);

    expect(response.body.user.role).toBe('SALON_OWNER');
    expect(response.body.user.onboardingStatus).toBe('PROVIDER_SETUP_REQUIRED');

    const dbUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    expect(dbUser).toBeDefined();
    expect(dbUser?.role).toBe('SALON_OWNER');
    expect(dbUser?.emailVerified).toBe(true);
  });
});
