
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('🔍 Verifying Location Import...');

    const locationsToCheck = ['Umlazi', 'Soweto', 'Khayelitsha', 'Botshabelo'];

    for (const name of locationsToCheck) {
        const loc = await prisma.seoLocation.findFirst({
            where: { name: { contains: name, mode: 'insensitive' } },
            include: { parentLocation: true }
        });

        if (loc) {
            console.log(`✅ Found ${name}:`);
            console.log(`   - ID: ${loc.id}`);
            console.log(`   - Slug: ${loc.slug}`);
            console.log(`   - Type: ${loc.type}`);
            console.log(`   - Province: ${loc.province}`);
            console.log(`   - Parent: ${loc.parentLocation?.name || 'None'}`);
        } else {
            console.log(`❌ Could NOT find ${name}`);
        }
    }

    const totalCount = await prisma.seoLocation.count();
    console.log(`\n📊 Total Locations in DB: ${totalCount}`);
}

verify()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
