import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Socket } from 'socket.io';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { EventsGateway } from '../src/events/events.gateway';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

jest.setTimeout(60000);

describe('Comprehensive multi-role flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let eventsGateway: EventsGateway;

  const createdUserEmails: string[] = [];
  const createdUserIds: string[] = [];
  const createdSalonIds: string[] = [];
  const createdServiceIds: string[] = [];
  const createdProductIds: string[] = [];
  const createdProductOrderIds: string[] = [];
  const createdBookingIds: string[] = [];
  const createdConversationIds: string[] = [];

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
    eventsGateway = app.get(EventsGateway);
    // Stub websocket server methods used during tests
    eventsGateway.server = {
      to: () => ({ emit: () => undefined }),
      emit: () => undefined,
    } as any;
  });

  afterAll(async () => {
    for (const orderId of createdProductOrderIds) {
      try {
        await prisma.productOrder.delete({ where: { id: orderId } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Order cleanup failed', orderId, error);
        }
      }
    }

    for (const bookingId of createdBookingIds) {
      try {
        await prisma.booking.delete({ where: { id: bookingId } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Booking cleanup failed', bookingId, error);
        }
      }
    }

    for (const productId of createdProductIds) {
      try {
        await prisma.product.delete({ where: { id: productId } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Product cleanup failed', productId, error);
        }
      }
    }

    for (const serviceId of createdServiceIds) {
      try {
        await prisma.service.delete({ where: { id: serviceId } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Service cleanup failed', serviceId, error);
        }
      }
    }

    for (const salonId of createdSalonIds) {
      try {
        await prisma.salon.delete({ where: { id: salonId } });
      } catch (error) {
        if ((error as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Salon cleanup failed', salonId, error);
        }
      }
    }

    if (createdConversationIds.length > 0) {
      await prisma.message.deleteMany({
        where: { conversationId: { in: createdConversationIds } },
      });
      await prisma.conversation.deleteMany({
        where: { id: { in: createdConversationIds } },
      });
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
          // eslint-disable-next-line no-console
          console.warn('User cleanup failed', email, error);
        }
      }
    }

    await prisma.$disconnect();
    await app.close();
  });

  const registerUser = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }) => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(payload)
      .expect(201);
    createdUserEmails.push(payload.email);
  };

  const loginAs = async (
    agent: any,
    credentials: { email: string; password: string },
  ) => {
    const response = await agent
      .post('/api/auth/login')
      .send(credentials)
      .expect(200);
    const user = response.body.user as {
      id: string;
      email: string;
      role: string;
      salonId?: string | null;
    };
    createdUserIds.push(user.id);
    return user;
  };

  const createMockSocket = (userId: string) => {
    const events: Array<{ event: string; payload: any }> = [];
    const mock: any = {
      id: `socket-${userId}-${Math.random().toString(36).slice(2)}`,
      handshake: { query: { userId } },
      emit: (event: string, payload: any) => {
        events.push({ event, payload });
        return true;
      },
      join: jest.fn(),
      leave: jest.fn(),
      emittedEvents: events,
    };
    return mock as Socket & {
      emittedEvents: Array<{ event: string; payload: any }>;
    };
  };

  it('executes full platform flows across all roles', async () => {
    const httpServer = app.getHttpServer();

    const adminAgent = request.agent(httpServer);
    const salonOwnerAgent = request.agent(httpServer);
    const productSellerAgent = request.agent(httpServer);
    const clientAgent = request.agent(httpServer);

    const timestamp = Date.now();

    const adminCredentials = {
      email: `admin-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    };
    await registerUser(adminCredentials);
    const adminUser = await loginAs(adminAgent, adminCredentials);

    const salonOwnerCredentials = {
      email: `owner-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Owner',
      lastName: 'One',
      role: 'SALON_OWNER',
    };
    await registerUser(salonOwnerCredentials);
    const salonOwner = await loginAs(salonOwnerAgent, salonOwnerCredentials);

    const productSellerCredentials = {
      email: `seller-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Seller',
      lastName: 'One',
      role: 'PRODUCT_SELLER',
    };
    await registerUser(productSellerCredentials);
    const productSeller = await loginAs(
      productSellerAgent,
      productSellerCredentials,
    );

    const clientCredentials = {
      email: `client-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Client',
      lastName: 'Tester',
    };
    await registerUser(clientCredentials);
    const clientUser = await loginAs(clientAgent, clientCredentials);

    const categoriesResponse = await request(httpServer)
      .get('/api/categories')
      .expect(200);
    const categories = categoriesResponse.body as Array<{ id: string }>;
    expect(Array.isArray(categories) && categories.length > 0).toBe(true);
    const categoryId = categories[0].id;

    const salonPayload = {
      name: 'Complete Flow Salon',
      description: 'Salon used for full-stack automated testing.',
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
      planCode: 'PREMIUM',
      hasSentProof: true,
      paymentReference: 'FLOW-SALON-REF',
    };

    const createSalonResponse = await salonOwnerAgent
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
      categoryId,
    };

    const createServiceResponse = await salonOwnerAgent
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
    expect(forbiddenResponse.body.userMessage).toBe(
      "You don't have permission to do that.",
    );
    expect(typeof forbiddenResponse.body.referenceId).toBe('string');

    const invalidBookingAttempt = await clientAgent
      .post('/api/bookings')
      .send({
        serviceId: service.id,
        bookingTime: 'not-a-date',
        isMobile: 'nope',
        clientPhone: '1234',
      })
      .expect(400);
    expect(invalidBookingAttempt.body.code).toBe('VALIDATION_FAILED');
    expect(invalidBookingAttempt.body.userMessage).toBe(
      'Please check the form and try again.',
    );
    expect(typeof invalidBookingAttempt.body.referenceId).toBe('string');

    const bookingTime = new Date(Date.now() + 3600000).toISOString();
    const bookingResponse = await clientAgent
      .post('/api/bookings')
      .send({
        serviceId: service.id,
        bookingTime,
        isMobile: false,
        clientPhone: '+27820000001',
      })
      .expect(201);
    const booking = bookingResponse.body;
    expect(booking.status).toBe('PENDING');
    createdBookingIds.push(booking.id);

    const bookingUpdateResponse = await salonOwnerAgent
      .patch(`/api/bookings/${booking.id}/status`)
      .send({ status: 'CONFIRMED' })
      .expect(200);
    expect(bookingUpdateResponse.body.status).toBe('CONFIRMED');

    const clientNotifications = await clientAgent
      .get('/api/notifications')
      .expect(200);
    const bookingNotification = (clientNotifications.body.items as any[]).find(
      (item) =>
        typeof item.message === 'string' &&
        item.message.includes('booking') &&
        item.message.includes('confirmed'),
    );
    expect(bookingNotification).toBeDefined();

    const ownerConversationResponse = await clientAgent
      .post('/api/chat/conversations')
      .send({ recipientId: salonOwner.id })
      .expect(201);
    const ownerConversation = ownerConversationResponse.body;
    createdConversationIds.push(ownerConversation.id);

    const clientSocket = createMockSocket(clientUser.id);
    const ownerSocket = createMockSocket(salonOwner.id);
    await eventsGateway.handleRegister(clientUser.id, clientSocket);
    await eventsGateway.handleRegister(salonOwner.id, ownerSocket);

    await eventsGateway.handleSendMessage(
      {
        conversationId: ownerConversation.id,
        recipientId: salonOwner.id,
        body: 'Looking forward to my appointment!',
      },
      clientSocket,
    );

    const latestMessage = await prisma.message.findFirst({
      where: { conversationId: ownerConversation.id },
      orderBy: { createdAt: 'desc' },
    });
    expect(latestMessage?.content).toContain('Looking forward');

    const sellerPlanResponse = await productSellerAgent
      .patch('/api/users/me/seller-plan')
      .send({
        planCode: 'STARTER',
        hasSentProof: true,
        paymentReference: 'SELLER-PLAN-REF',
      })
      .expect(200);
    expect(sellerPlanResponse.body.sellerPlanPaymentStatus).toBe(
      'PROOF_SUBMITTED',
    );

    await adminAgent
      .patch(`/api/admin/sellers/${productSeller.id}/plan/payment`)
      .send({ status: 'VERIFIED', paymentReference: 'SELLER-VERIFIED' })
      .expect(200);

    const productResponse = await productSellerAgent
      .post('/api/products')
      .send({
        name: 'Hydrating Shampoo',
        description: 'Salon-grade hydrating shampoo.',
        price: 299.99,
        images: ['https://example.com/product.jpg'],
        stock: 10,
      })
      .expect(201);
    const product = productResponse.body;
    createdProductIds.push(product.id);

    await adminAgent
      .patch(`/api/admin/products/${product.id}/status`)
      .send({ approvalStatus: 'APPROVED' })
      .expect(200);

    const productOrderResponse = await clientAgent
      .post('/api/product-orders')
      .send({
        productId: product.id,
        quantity: 2,
        deliveryMethod: 'Courier',
        contactPhone: '+27820000002',
        notes: 'Please deliver after 5pm',
      })
      .expect(201);
    const productOrder = productOrderResponse.body;
    createdProductOrderIds.push(productOrder.id);

    await productSellerAgent
      .patch(`/api/product-orders/${productOrder.id}/status`)
      .send({ status: 'SHIPPED' })
      .expect(200);

    const orderNotifications = await clientAgent
      .get('/api/notifications')
      .expect(200);
    const shipmentNotification = (orderNotifications.body.items as any[]).find(
      (item) =>
        typeof item.message === 'string' &&
        item.message.includes('order') &&
        item.message.includes('shipped'),
    );
    expect(shipmentNotification).toBeDefined();

    const sellerConversationResponse = await clientAgent
      .post('/api/chat/conversations')
      .send({ recipientId: productSeller.id })
      .expect(201);
    const sellerConversation = sellerConversationResponse.body;
    createdConversationIds.push(sellerConversation.id);

    const sellerSocket = createMockSocket(productSeller.id);
    await eventsGateway.handleRegister(productSeller.id, sellerSocket);

    await eventsGateway.handleSendMessage(
      {
        conversationId: sellerConversation.id,
        recipientId: productSeller.id,
        body: 'Thanks for shipping so quickly!',
      },
      clientSocket,
    );

    const sellerMessage = await prisma.message.findFirst({
      where: { conversationId: sellerConversation.id },
      orderBy: { createdAt: 'desc' },
    });
    expect(sellerMessage?.content).toContain('Thanks for shipping');

    await adminAgent
      .delete(`/api/admin/salons/${salon.id}`)
      .send({ reason: 'Routine test cleanup' })
      .expect(200);

    const deletedSalon = await prisma.salon.findUnique({
      where: { id: salon.id },
    });
    expect(deletedSalon).toBeNull();
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

    const dbUser = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    expect(dbUser).toBeDefined();
    expect(dbUser?.role).toBe('SALON_OWNER');
  });
});
