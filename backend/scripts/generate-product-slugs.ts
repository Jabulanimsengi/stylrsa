/**
 * Script to generate slugs for existing products that don't have one.
 * Run with: npx ts-node scripts/generate-product-slugs.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .substring(0, 60); // Limit length
}

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Check for uniqueness and append counter if needed
    while (true) {
        const existing = await prisma.product.findFirst({
            where: {
                slug,
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
        });

        if (!existing) break;

        slug = `${baseSlug}-${counter}`;
        counter++;

        if (counter > 100) {
            // Fallback: append timestamp
            slug = `${baseSlug}-${Date.now().toString(36)}`;
            break;
        }
    }

    return slug;
}

async function main() {
    console.log('Finding products without slugs...');

    const productsWithoutSlugs = await prisma.product.findMany({
        where: {
            slug: null,
        },
        select: {
            id: true,
            name: true,
        },
    });

    console.log(`Found ${productsWithoutSlugs.length} products without slugs`);

    for (const product of productsWithoutSlugs) {
        const slug = await generateUniqueSlug(product.name, product.id);

        await prisma.product.update({
            where: { id: product.id },
            data: { slug },
        });

        console.log(`✓ Generated slug for "${product.name}": ${slug}`);
    }

    console.log('\nDone! All products now have slugs.');
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
