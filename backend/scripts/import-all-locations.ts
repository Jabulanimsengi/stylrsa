
import { PrismaClient } from '@prisma/client';
import { locationsData } from '../src/locations/locations.data';

const prisma = new PrismaClient();

// Helper to generate slugs
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars (except spaces and dashes)
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with single dash
        .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes
}

// Major cities for categorization (heuristic)
const MAJOR_CITIES = [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley',
    'Pietermaritzburg', 'George', 'Stellenbosch', 'Paarl', 'Knysna',
    'Soweto', 'Vanderbijlpark', 'Vereeniging', 'Rustenburg', 'Potchefstroom',
    'Witbank', 'Middelburg', 'Upington', 'Newcastle', 'Richards Bay'
];

async function importAllLocations() {
    console.log('🚀 Starting full location import...');

    let totalAdded = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    // 1. Iterate over provinces
    for (const [provinceName, locations] of Object.entries(locationsData)) {
        const provinceSlug = generateSlug(provinceName);

        console.log(`\n📍 Processing Province: ${provinceName} (${provinceSlug})`);

        // Upsert Province
        let province = await prisma.seoLocation.findFirst({
            where: {
                slug: provinceSlug,
                type: 'PROVINCE'
            }
        });

        if (!province) {
            province = await prisma.seoLocation.create({
                data: {
                    name: provinceName,
                    slug: provinceSlug,
                    type: 'PROVINCE',
                    province: provinceName,
                    provinceSlug: provinceSlug,
                    serviceCount: 0,
                    salonCount: 0,
                }
            });
            console.log(`   ✅ Created Province: ${provinceName}`);
        } else {
            console.log(`   ℹ️  Province exists: ${provinceName}`);
        }

        // 2. Process locations for this province
        for (const locName of locations) {
            // Handle names with brackets usually indicating alternate names e.g. "Amanzimtoti (eManzimtoti)"
            // We'll take the primary name (before bracket) for the name, but maybe keep full for searching?
            // SEO best practice: Use the most common name. Usually the first part.

            let cleanName = locName;
            let alternateName = '';

            if (locName.includes('(')) {
                const parts = locName.split('(');
                cleanName = parts[0].trim();
                alternateName = parts[1].replace(')', '').trim();
            }

            const locSlug = generateSlug(cleanName);

            // Determine type
            let type = 'TOWN'; // Default
            if (MAJOR_CITIES.includes(cleanName)) {
                type = 'CITY';
            } else if (cleanName.match(/township|park|ville/i)) {
                // Simple heuristic, not perfect but better than nothing
                // Actually 'Amanzimtoti' is a town. 'Umlazi' is a township.
                // Let's stick to 'TOWN' as a safe fallback for "Populated Place".
            }

            // Check if exists
            const existingLoc = await prisma.seoLocation.findFirst({
                where: {
                    slug: locSlug,
                    provinceSlug: provinceSlug
                }
            });

            if (existingLoc) {
                // Update if needed (mostly just to ensure parent link or type consistency?)
                // For now, we just skip to avoid overwriting robust data if it was manually edited
                // BUT we must ensure it has the correct province link
                // console.log(`      Skipped: ${cleanName} (exists)`);
                totalSkipped++;
                continue;
            }

            // Create new location
            try {
                await prisma.seoLocation.create({
                    data: {
                        name: cleanName, // Use the clean name for display
                        slug: locSlug,
                        type: type,
                        province: provinceName,
                        provinceSlug: provinceSlug,
                        parentLocationId: province!.id, // Link to province as parent
                        serviceCount: 0,
                        salonCount: 0,
                    }
                });
                // console.log(`      + Added: ${cleanName}`);
                totalAdded++;
            } catch (error) {
                console.error(`      ❌ Error adding ${cleanName}:`, error);
            }
        }
    }

    console.log('\n==========================================');
    console.log(`✅ Import Complete`);
    console.log(`   Added: ${totalAdded}`);
    console.log(`   Skipped: ${totalSkipped}`);
    console.log(`   Total Processed: ${totalAdded + totalSkipped + totalUpdated}`);
    console.log('==========================================');
}

importAllLocations()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
