// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');
  // Seed plans
  const plans = [
    { code: 'PREMIUM', name: 'Service Listing Plan', priceCents: 39900, visibilityWeight: 5, maxListings: 9999 },
    { code: 'FREE', name: 'Free', priceCents: 0, visibilityWeight: 0, maxListings: 1 },
    { code: 'STARTER', name: 'Starter', priceCents: 4900, visibilityWeight: 1, maxListings: 3 },
    { code: 'ESSENTIAL', name: 'Essential', priceCents: 9900, visibilityWeight: 2, maxListings: 7 },
    { code: 'GROWTH', name: 'Growth', priceCents: 19900, visibilityWeight: 3, maxListings: 15 },
    { code: 'PRO', name: 'Pro', priceCents: 29900, visibilityWeight: 4, maxListings: 27 },
    { code: 'ELITE', name: 'Elite', priceCents: 49900, visibilityWeight: 5, maxListings: 9999 },
  ];
  for (const p of plans) {
    await prisma.plan.upsert({
      where: { code: p.code as any },
      update: { name: p.name, priceCents: p.priceCents, visibilityWeight: p.visibilityWeight, maxListings: p.maxListings },
      create: { code: p.code as any, name: p.name, priceCents: p.priceCents, visibilityWeight: p.visibilityWeight, maxListings: p.maxListings },
    });
  }
  
  const categories = [
    'Haircuts & Styling',
    'Hair Color & Treatments',
    'Nail Care',
    'Skin Care & Facials',
    'Massage & Body Treatments',
    'Makeup & Beauty',
    'Waxing & Hair Removal',
    'Braiding & Weaving',
    'Men\'s Grooming',
    'Bridal Services',
    'Wig Installations',
    'Natural Hair Specialists',
    'Lashes & Brows',
    'Aesthetics & Advanced Skin',
    'Tattoos & Piercings',
    'Wellness & Holistic Spa',
  ];

  for (const categoryName of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
      },
    });
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
