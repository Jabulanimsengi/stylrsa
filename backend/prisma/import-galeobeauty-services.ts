import { ApprovalStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RawService = {
  category: string;
  title: string;
  price: number;
  duration: number;
  discountPercentage?: number;
};

const CATEGORY_MAP: Record<string, string> = {
  'Hart aesthetics': 'Aesthetics & Advanced Skin',
  'Fat Freezing': 'Wellness & Holistic Spa',
  'Dermalogica treatments': 'Skin Care & Facials',
  'IPL hair removal': 'Waxing & Hair Removal',
  'make up': 'Makeup & Beauty',
  Medical: 'Aesthetics & Advanced Skin',
  'Permanent make up': 'Makeup & Beauty',
  'pro skin': 'Skin Care & Facials',
  'QMS Facial': 'Skin Care & Facials',
  sunbed: 'Wellness & Holistic Spa',
  Waxing: 'Waxing & Hair Removal',
  'Hair & Styling': 'Haircuts & Styling',
  Nails: 'Nail Care',
  'Eyebrows & eyelashes': 'Lashes & Brows',
  Massages: 'Massage & Body Treatments',
};

const RAW_SERVICES = `
Hart aesthetics
Nefertiti lift|R7,950.00|1hr|
non surgical liquid face lift|R10,000.00|1hr|
Collagen biostimulator injections 10ml|R5,000.00|1hr|
Tox per unit|R59.60|1hr|
Under eye skin booster two treatments|R4,000.00|1hr|
Under eye skin booster one treatment|R2,800.00|1hr|
Dermal cheek fillers 2ml|R6,000.00|1hr|
Dermal cheek fillers 1ml|R3,500.00|1hr|
Dermal russian lilp fillers 1ml|R3,000.00|1hr|
dermal filler 1ml|R2,800.00|1hr|
Fat Freezing
Fat freezing per session|R799.20|1hr|
EMS slimming machine|R2,345.55|1hr|
Dermalogica treatments
Multivitamin skin treatment|R690.00|45 minutes|
Pro dermaplaning 30 min|R604.90|30 minutes|
Neurosculpt 30 min|R650.00|30 mins|
pro skin treatment|R1,098.70|55 minutes|
pro calm skin treatment|R1,100.00|55 minutes|
pro bright skin treatment|R1,100.00|55 mins|
pro firm treatment|R1,100.00|55 minutes|
pro power peel|R1,100.00|55 minutes|
pro dermaplaning skin treatment|R890.00|55 minutes|
neurosculpt|R1,250.00|55 minutes|
infusion and under eye peel|R1,350.00|55 minutes|
luminfusion|R1,100.00|55 minutes|
melanopro peel|R6,999.00|55 minutes|
hydraderm|R1,400.00|55 minutes|
pro microneedling|R1,950.00|55 minutes|
nanoinfusion|R1,400.00|55 minutes|
ultra calming facial|R999.94|1hr|save up to 10%
skin clearing facial|R999.94|1hr|save up to 10%
skin brightening facial|R999.94|1hr|save up to 10%
age smart facial|R999.94|1hr|save up to 10%
power peel 30 min|R720.00|1hr|save up to 10%
power peel 60 min|R990.00|1hr|save up to 10%
facial 30 min|R555.52|1hr|save up to 10%
facial 60 min|R999.94|1hr|save up to 10%
IPL hair removal
Full leg ipl|R2,555.41|1hr|save up to 10%
full arm ipl|R1,666.57|1hr|save up to 10%
neck ipl men|R611.08|1hr|save up to 10%
moustache ipl|R333.31|1hr|save up to 10%
beardline ipl|R611.08|1hr|save up to 10%
brazillian ipl|R944.39|1hr|save up to 10%
full buttocks ipl|R1,444.36|1hr|save up to 10%
neck ipl|R611.08|1hr|save up to 10%
tatoo removal|R555.52|1hr|save up to 10%
full face ipl|R1,166.60|1hr|save up to 10%
toes and feet ipl|R555.52|1hr|save up to 10%
half leg ipl|R1,611.02|1hr|save up to 10%
full leg ipl|R2,555.41|1hr|save up to 10%
hollywood ipl|R1,222.15|1hr|save up to 10%
bikin sides ipl|R666.63|1hr|save up to 10%
under arm ipl|R495.00|1hr|save up to 10%
belly button ipl|R555.52|1hr|save up to 10%
stomach ipl|R944.39|1hr|save up to 10%
full arm ipl|R1,666.57|1hr|save up to 10%
half arm ipl|R944.39|1hr|save up to 10%
full face and neck|R945.00|1hr|save up to 10%
make up
bridal make up|R1,999.89|1hr|save up to 10%
evening make up|R733.29|1hr|save up to 10%
day makeup|R599.97|1hr|save up to 10%
Medical
Vaginal tightning|R6,110.77|1hr|save up to 10%
fractional laser full face|R2,999.83|1hr|save up to 10%
plasmage|R899.10|1hr|save up to 10%
Permanent make up
powderpixel brows|R2,110.99|1hr|save up to 10%
eyeliner bottom|R888.84|1hr|save up to 10%
eyeliner top|R888.84|1hr|save up to 10%
microblading|R1,666.57|1hr|save up to 10%
full lips contour|R2,999.83|1hr|save up to 10%
lip liner|R1,888.78|1hr|save up to 10%
hybrid brows|R1,710.00|1hr|save up to 10%
pro skin
dermaplaning|R1,080.00|1hr|save up to 10%
dermaplaning maintenance|R388.87|1hr|save up to 10%
micro needling hands|R648.00|1hr|save up to 10%
microneedling|R1,866.56|1hr|save up to 10%
high frequency facial|R720.00|1hr|save up to 10%
QMS Facial
chemical peel|R998.84|1hr|save up to 10%
sensitive skin facial|R666.63|1hr|save up to 10%
activator treatment|R844.40|1hr|save up to 10%
rejuvinating facial|R944.39|1hr|save up to 10%
deep pore cleansing facial|R833.29|1hr|save up to 10%
basic facial|R811.06|1hr|save up to 10%
collagen facial|R799.20|1hr|save up to 10%
sunbed
spraytan|R599.97|1hr|save up to 10%
sunbed 20 session|R777.73|1hr|save up to 10%
sunbed 10 sessions|R388.87|1hr|save up to 10%
sunbed per session|R54.00|1hr|save up to 10%
Waxing
full tummy wax|R444.42|1hr|save up to 10%
butt wax|R222.21|1hr|save up to 10%
men back wax|R644.41|1hr|save up to 10%
under arm wax|R194.44|1hr|save up to 10%
lip wax|R111.10|1hr|save up to 10%
full leg wax|R599.97|1hr|save up to 10%
half leg wax|R322.20|1hr|save up to 10%
hollywood wax|R555.52|1hr|save up to 10%
brazillian wax|R477.76|1hr|save up to 10%
ear wax|R133.33|1hr|save up to 10%
nose wax|R99.99|1hr|save up to 10%
chest wax|R266.65|1hr|save up to 10%
full back wax|R322.20|1hr|save up to 10%
half back wax|R277.76|1hr|save up to 10%
full arm wax|R288.87|1hr|save up to 10%
half arm wax|R161.10|1hr|save up to 10%
cheek wax|R194.44|1hr|save up to 10%
Hair & Styling
medium upstyle|R888.84|1hr|save up to 10%
long hair upstyle|R1,111.05|1hr|save up to 10%
short hair upstyle|R666.63|1hr|save up to 10%
long hair toner|R555.52|1hr|save up to 10%
medium hair toner|R466.64|1hr|save up to 10%
short hair toner|R422.20|1hr|save up to 10%
pensioner cut and blow|R311.09|1hr|save up to 10%
care keratin mask|R611.08|1hr|save up to 10%
care vital mask|R611.08|1hr|save up to 10%
osmo silver mask|R388.87|1hr|save up to 10%
botox long hair treat|R999.94|1hr|save up to 10%
botox treat medium hair|R888.84|1hr|save up to 10%
botox treat short|R777.73|1hr|save up to 10%
osmo intensive mask|R355.54|1hr|save up to 10%
extra long full head foils|R1,611.20|1hr|save up to 10%
long full head foils|R1,170.00|1hr|save up to 10%
medium full head foils|R1,277.71|1hr|save up to 10%
short full head foils|R999.94|1hr|save up to 10%
cap highlights|R540.00|1hr|save up to 10%
long half head foils|R1,277.71|1hr|save up to 10%
extra long half head foils|R1,388.81|1hr|save up to 10%
medium half head foils|R1,055.50|1hr|save up to 10%
short half head foils|R944.39|1hr|save up to 10%
extra long color|R1,388.81|1hr|save up to 10%
long color|R1,499.92|1hr|save up to 10%
medium color|R1,222.15|1hr|save up to 10%
short color|R999.94|1hr|save up to 10%
brazillian blow extra long|R2,077.67|1hr|save up to 10%
brazillian blow long|R1,911.01|1hr|save up to 10%
brazillian blow medium|R1,599.91||save up to 10%
brazillian blow short|R1,277.71|1hr|save up to 10%
extra long blow package 10x|R2,333.20|1hr|save up to 10%
long blow package 10x|R1,999.89|1hr|save up to 10%
medium blow package 10x|R1,666.57|1hr|save up to 10%
short blow package 10x|R1,333.26|1hr|save up to 10%
extra long blow|R466.64|1hr|save up to 10%
medium blow|R366.64|1hr|save up to 10%
cut 0-5 years|R99.00|30 mins|save up to 10%
haircut medium|R466.64|1hr|save up to 10%
haircut long|R577.75|1hr|save up to 10%
haircut short|R355.54|1hr|save up to 10%
roots|R833.29|1hr 15 mins|save up to 10%
long blow|R468.00|1hr|save up to 10%
Nails
acrylic soak off|R133.33|1hr|save up to 10%
gel soak off|R111.10|1hr|save up to 10%
nail repair|R55.55|1hr|save up to 10%
buff only|R77.78|1hr|save up to 10%
rubber base fill|R199.99|1hr|save up to 10%
acrylic fill|R466.64|1hr|save up to 10%
gel fill|R466.64|1hr|save up to 10%
gel toes|R311.09|1hr|save up to 10%
pedicure with gel|R666.63|1hr|save up to 10%
full set designer nails|R799.96|1hr|save up to 10%
acrylic overlay|R511.08|1hr|save up to 10%
gel overlay|R466.64|1hr|save up to 10%
scuplted acrylic with forms|R733.29|1hr|save up to 10%
full set acrylic with tips|R666.63|1hr|save up to 10%
manicure|R288.87|45 mins|save up to 10%
Eyebrows & eyelashes
hybrid lashes|R888.84|1hr|save upto 10%
lash fill|R443.41|1hr|save upto 10%
glamour lashes|R1,111.05|1hr|save upto 10%
full set silk lashes|R555.52|1hr|save upto 10%
full set volume lashes|R777.73|1hr|save upto 10%
full set classic lashes|R777.73|1hr|save upto 10%
brow henna|R555.52|1hr|save upto 10%
lash lamilnation|R611.08|1hr|save upto 10%
brow tint|R111.10|1hr|save upto 10%
lash tint|R133.33|1hr|save upto 10%
lash lift|R522.00|1hr|save upto 10%
brow lamination|R423.00|1hr|save upto 10%
Massages
Full body massage|R1,172.78|1hr|
Back and neck massage|R728.36|30 mins|
Aromatherapy massage|R1,172.78|55 mins|
Swedish massage|R753.04|55 mins|
Foot massage|R666.63|30 mins|
45 Minutes Bellabaci Massage|R680.00|45 mins|
Full body exfoliation|R699.00|1hr|
Bellabaci Detox cupping massage|R950.00|1hr|
Hot stone 60 minuites massage|R750.00|55 mins|
90 minutes Bellabaci massage|R1,400.00|1hr|
60 min sports massage|R950.00|1hr|
60 min Deep tissue Bellabaci massage|R850.00|1hr|
`;

function parsePrice(value: string) {
  return Number(value.replace(/[R,\s]/g, ''));
}

function parseDuration(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return 60;
  }

  let minutes = 0;
  const hourMatch = normalized.match(/(\d+)\s*(hr|hour)/);
  const minuteMatch = normalized.match(/(\d+)\s*(min|minute)/);

  if (hourMatch) {
    minutes += Number(hourMatch[1]) * 60;
  }

  if (minuteMatch) {
    minutes += Number(minuteMatch[1]);
  }

  return minutes || 60;
}

function parseDiscount(value: string) {
  const match = value.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : undefined;
}

function titleCase(value: string) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bIpl\b/g, 'IPL')
    .replace(/\bQms\b/g, 'QMS')
    .replace(/\bEms\b/g, 'EMS');
}

function parseServices() {
  const services: RawService[] = [];
  let category = '';

  for (const line of RAW_SERVICES.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (!trimmed.includes('|')) {
      category = trimmed;
      continue;
    }

    const [title, price, duration, discount] = trimmed.split('|');
    services.push({
      category,
      title: titleCase(title),
      price: parsePrice(price),
      duration: parseDuration(duration),
      discountPercentage: parseDiscount(discount || ''),
    });
  }

  const unique = new Map<string, RawService>();
  for (const service of services) {
    const key = [
      service.category.toLowerCase(),
      service.title.toLowerCase(),
      service.price,
      service.duration,
      service.discountPercentage ?? '',
    ].join('|');

    if (!unique.has(key)) {
      unique.set(key, service);
    }
  }

  return {
    services: [...unique.values()],
    duplicatesRemoved: services.length - unique.size,
  };
}

async function findGaleoBeautySalon() {
  const salon = await prisma.salon.findFirst({
    where: {
      OR: [
        { slug: 'galeobeauty' },
        { slug: 'galeo-beauty' },
        { name: { equals: 'galeobeauty', mode: 'insensitive' } },
        { name: { equals: 'galeo beauty', mode: 'insensitive' } },
        { name: { contains: 'galeo', mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, slug: true },
  });

  if (!salon) {
    throw new Error('Could not find the Galeo Beauty salon. Check the salon slug/name in the database.');
  }

  return salon;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const { services, duplicatesRemoved } = parseServices();
  const salon = await findGaleoBeautySalon();

  console.log(`Salon: ${salon.name} (${salon.slug || 'no-slug'})`);
  console.log(`Services parsed: ${services.length}`);
  console.log(`Duplicate rows removed: ${duplicatesRemoved}`);

  if (dryRun) {
    const categoryCounts = services.reduce<Record<string, number>>((acc, service) => {
      acc[service.category] = (acc[service.category] || 0) + 1;
      return acc;
    }, {});
    console.table(categoryCounts);
    return;
  }

  const categories = new Map<string, string>();
  for (const categoryName of new Set(Object.values(CATEGORY_MAP))) {
    const category = await prisma.serviceCategory.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
      select: { id: true, name: true },
    });
    categories.set(category.name, category.id);
  }

  let created = 0;
  let updated = 0;

  for (const service of services) {
    const mappedCategory = CATEGORY_MAP[service.category];
    const categoryId = mappedCategory ? categories.get(mappedCategory) : undefined;
    const description = `${service.title} at Galeo Beauty.`;

    const existing = await prisma.service.findFirst({
      where: {
        salonId: salon.id,
        title: { equals: service.title, mode: 'insensitive' },
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    const data = {
      title: service.title,
      description,
      price: service.price,
      discountPercentage: service.discountPercentage,
      duration: service.duration,
      images: [] as string[],
      approvalStatus: ApprovalStatus.APPROVED,
      categoryId,
      salonId: salon.id,
    };

    if (existing) {
      await prisma.service.update({
        where: { id: existing.id },
        data,
      });
      updated += 1;
    } else {
      await prisma.service.create({ data });
      created += 1;
    }
  }

  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log('Galeo Beauty service import complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
