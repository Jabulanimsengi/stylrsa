import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

jest.setTimeout(30000);

describe('Onboarding flows (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const createdSalonIds: string[] = [];
  const createdProductIds: string[] = [];
  const createdServiceIds: string[] = [];
  const createdUserEmails: string[] = [];

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
    for (const productId of createdProductIds) {
      try {
        await prisma.product.delete({ where: { id: productId } });
      } catch (err) {
        if ((err as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Cleanup product failed', productId, err);
        }
      }
    }

    for (const serviceId of createdServiceIds) {
      try {
        await prisma.service.delete({ where: { id: serviceId } });
      } catch (err) {
        if ((err as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Cleanup service failed', serviceId, err);
        }
      }
    }

    for (const salonId of createdSalonIds) {
      try {
        await prisma.salon.delete({ where: { id: salonId } });
      } catch (err) {
        if ((err as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Cleanup salon failed', salonId, err);
        }
      }
    }

    for (const email of createdUserEmails) {
      try {
        await prisma.user.delete({ where: { email } });
      } catch (err) {
        if ((err as { code?: string }).code !== 'P2025') {
          // eslint-disable-next-line no-console
          console.warn('Cleanup user failed', email, err);
        }
      }
    }

    await prisma.$disconnect();
    await app.close();
  });

  it('allows a salon owner to create a salon and manage plan proof status', async () => {
    const httpServer = app.getHttpServer();
    const agent = request.agent(httpServer);
    const timestamp = Date.now();
    const ownerCredentials = {
      email: `owner-e2e-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Salon',
      lastName: 'Owner',
      role: 'SALON_OWNER',
    };

    await request(httpServer)
      .post('/api/auth/register')
      .send(ownerCredentials)
      .expect(201);
    createdUserEmails.push(ownerCredentials.email);

    await agent
      .post('/api/auth/login')
      .send({
        email: ownerCredentials.email,
        password: ownerCredentials.password,
      })
      .expect(200);

    const operatingHours = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ].map((day) => ({ day, open: '09:00', close: '17:00' }));

    const salonPayload = {
      name: 'E2E Salon',
      description: 'Automated test salon',
      address: '123 Test Street',
      town: 'Testville',
      city: 'Johannesburg',
      province: 'Gauteng',
      phone: '+27821234567',
      email: 'owner-contact@test.com',
      offersMobile: false,
      operatingHours,
      operatingDays: operatingHours.map((entry) => entry.day),
      hasSentProof: true,
      paymentReference: 'E2E-SALON-REF',
    };

    const categoriesResponse = await request(httpServer)
      .get('/api/categories')
      .expect(200);

    const categories = categoriesResponse.body as Array<{ id: string }>;
    expect(Array.isArray(categories) && categories.length > 0).toBe(true);

    const createSalonResponse = await agent
      .post('/api/salons')
      .send(salonPayload)
      .expect(201);

    const createdSalon = createSalonResponse.body;
    expect(createdSalon).toBeDefined();
    expect(createdSalon.planPaymentStatus).toBe('PROOF_SUBMITTED');
    createdSalonIds.push(createdSalon.id);

    const servicePayload = {
      title: 'Premium Wash',
      description: 'Deluxe wash and style',
      price: 350,
      duration: 60,
      images: [],
      salonId: createdSalon.id,
      categoryId: categories[0].id,
    };

    const createServiceResponse = await agent
      .post('/api/services')
      .send(servicePayload)
      .expect(201);

    createdServiceIds.push(createServiceResponse.body.id);

    const planUpdateResponse = await agent
      .patch('/api/salons/mine/plan')
      .send({ hasSentProof: false })
      .expect(200);

    expect(planUpdateResponse.body.planPaymentStatus).toBe('AWAITING_PROOF');

    if (createServiceResponse.body?.id) {
      await agent
        .delete(`/api/services/${createServiceResponse.body.id}`)
        .expect(200);
      const serviceIndex = createdServiceIds.indexOf(
        createServiceResponse.body.id,
      );
      if (serviceIndex >= 0) {
        createdServiceIds.splice(serviceIndex, 1);
      }
    }

    await agent.delete(`/api/salons/${createdSalon.id}`).expect(200);
    const salonIndex = createdSalonIds.indexOf(createdSalon.id);
    if (salonIndex >= 0) {
      createdSalonIds.splice(salonIndex, 1);
    }
  });

  it('allows a product seller to select a plan and create a product', async () => {
    const httpServer = app.getHttpServer();
    const agent = request.agent(httpServer);
    const timestamp = Date.now();
    const sellerCredentials = {
      email: `seller-e2e-${timestamp}@test.com`,
      password: 'Password123!',
      firstName: 'Product',
      lastName: 'Seller',
      role: 'PRODUCT_SELLER',
    };

    await request(httpServer)
      .post('/api/auth/register')
      .send(sellerCredentials)
      .expect(201);
    createdUserEmails.push(sellerCredentials.email);

    await agent
      .post('/api/auth/login')
      .send({
        email: sellerCredentials.email,
        password: sellerCredentials.password,
      })
      .expect(200);

    const sellerPlanResponse = await agent
      .patch('/api/users/me/seller-plan')
      .send({
        planCode: 'STARTER',
        hasSentProof: true,
        paymentReference: 'E2E-SELLER-REF',
      })
      .expect(200);

    expect(sellerPlanResponse.body.sellerPlanPaymentStatus).toBe(
      'PROOF_SUBMITTED',
    );
    expect(sellerPlanResponse.body.sellerPlanCode).toBe('STARTER');

    const productPayload = {
      name: 'E2E Product',
      description: 'Automated test product',
      price: 199.99,
      images: ['https://example.com/e2e-product.jpg'],
      stock: 5,
    };

    const createProductResponse = await agent
      .post('/api/products')
      .send(productPayload)
      .expect(201);

    const createdProduct = createProductResponse.body;
    expect(createdProduct).toBeDefined();
    expect(createdProduct.name).toBe(productPayload.name);
    createdProductIds.push(createdProduct.id);

    await agent.delete(`/api/products/${createdProduct.id}`).expect(204);
    const productIndex = createdProductIds.indexOf(createdProduct.id);
    if (productIndex >= 0) {
      createdProductIds.splice(productIndex, 1);
    }
  });
});
