import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ServicesService ordering by visibility', () => {
  let service: ServicesService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      service: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
      },
    } as any;
    // @ts-ignore
    service = new ServicesService(prisma);
  });

  test('findFeatured returns top 5 by salon visibility weight', async () => {
    const now = Date.now();
    prisma.service.findMany.mockResolvedValue([
      {
        id: 'a',
        createdAt: new Date(now - 5000),
        salon: { visibilityWeight: 1 },
      },
      {
        id: 'b',
        createdAt: new Date(now - 4000),
        salon: { visibilityWeight: 3 },
      },
      {
        id: 'c',
        createdAt: new Date(now - 3000),
        salon: { visibilityWeight: 2 },
      },
      {
        id: 'd',
        createdAt: new Date(now - 2000),
        salon: { visibilityWeight: 5 },
      },
      {
        id: 'e',
        createdAt: new Date(now - 1000),
        salon: { visibilityWeight: 1 },
      },
      {
        id: 'f',
        createdAt: new Date(now - 8000),
        salon: { visibilityWeight: 4 },
      },
    ] as any);

    const result = await service.findFeatured();
    expect(result).toHaveLength(5);
    expect(result.map((s) => s.id)).toEqual(['d', 'f', 'b', 'c', 'e']);
  });

  test('findAllApproved ranks globally before pagination', async () => {
    const now = Date.now();
    prisma.service.findMany.mockResolvedValue([
      {
        id: 'a',
        createdAt: new Date(now - 6000),
        salon: { visibilityWeight: 1 },
      },
      {
        id: 'b',
        createdAt: new Date(now - 5000),
        salon: { visibilityWeight: 3 },
      },
      {
        id: 'c',
        createdAt: new Date(now - 4000),
        salon: { visibilityWeight: 2 },
      },
      {
        id: 'd',
        createdAt: new Date(now - 3000),
        salon: { visibilityWeight: 5 },
      },
      {
        id: 'e',
        createdAt: new Date(now - 2000),
        salon: { visibilityWeight: 1 },
      },
      {
        id: 'f',
        createdAt: new Date(now - 1000),
        salon: { visibilityWeight: 4 },
      },
    ] as any);

    const page1 = await service.findAllApproved(1, 3);
    expect(page1.services.map((s) => s.id)).toEqual(['d', 'f', 'b']);
    expect(page1.currentPage).toBe(1);
    expect(page1.totalPages).toBe(2);

    const page2 = await service.findAllApproved(2, 3);
    expect(page2.services.map((s) => s.id)).toEqual(['c', 'e', 'a']);
  });
});
