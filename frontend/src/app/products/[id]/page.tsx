import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Script from 'next/script';
import ProductDetailClient from './ProductDetailClient';
import type { Product } from '@/types';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';

const buildApiUrl = (base: string | undefined, path: string) => {
    if (!base) return path;
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
};

/**
 * Check if a string looks like a UUID
 */
function isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

/**
 * Generate Product Schema (JSON-LD) for SEO rich snippets
 */
function generateProductSchema(product: Product, canonicalUrl: string) {
    const displayPrice = product.isOnSale && product.salePrice
        ? product.salePrice
        : product.price;

    const sellerName = product.seller
        ? `${product.seller.firstName || ''} ${product.seller.lastName || ''}`.trim() || 'Stylr SA Seller'
        : 'Stylr SA Seller';

    const schema: any = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': canonicalUrl,
        name: product.name,
        description: product.description,
        url: canonicalUrl,
        image: product.images?.[0] || `${siteUrl}/logo-transparent.png`,
        brand: {
            '@type': 'Brand',
            name: 'Stylr SA Marketplace',
        },
        offers: {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'ZAR',
            price: displayPrice.toFixed(2),
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
            availability: product.stock > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: sellerName,
            },
            itemCondition: 'https://schema.org/NewCondition',
        },
    };

    // Add category if available
    if (product.category) {
        schema.category = product.category;
    }

    // Add original price if on sale
    if (product.isOnSale && product.salePrice && product.salePrice < product.price) {
        schema.offers.priceSpecification = {
            '@type': 'PriceSpecification',
            price: displayPrice.toFixed(2),
            priceCurrency: 'ZAR',
            valueAddedTaxIncluded: true,
        };
    }

    // Add multiple images if available
    if (product.images && product.images.length > 1) {
        schema.image = product.images;
    }

    return schema;
}

/**
 * Generate BreadcrumbList Schema for product pages
 */
function generateBreadcrumbSchema(product: Product, canonicalUrl: string) {
    const breadcrumbItems: any[] = [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
        },
        {
            '@type': 'ListItem',
            position: 2,
            name: 'Products',
            item: `${siteUrl}/products`,
        },
    ];

    // Add category if available
    if (product.category) {
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 3,
            name: product.category,
            item: `${siteUrl}/products?category=${encodeURIComponent(product.category)}`,
        });
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 4,
            name: product.name,
            item: canonicalUrl,
        });
    } else {
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: canonicalUrl,
        });
    }

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems,
    };
}

async function getProduct(idOrSlug: string): Promise<{ product: Product | null; isPending?: boolean }> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_PATH;
    const isBuildPhase = process.env.IS_BUILD_PHASE === 'true' || process.env.NEXT_PHASE === 'phase-production-build';

    // Skip fetching during build if API is localhost
    if (isBuildPhase && (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'))) {
        return { product: null };
    }

    if (!baseUrl) {
        console.error('ERROR: NEXT_PUBLIC_API_URL is not set.');
        return { product: null };
    }

    const url = buildApiUrl(baseUrl, `/api/products/${idOrSlug}`);

    try {
        const res = await fetch(url, {
            next: { revalidate: 300 }, // Cache for 5 minutes
        });

        if (res.status === 403) {
            // Product exists but is pending approval
            console.log(`[getProduct] Product is pending approval: ${idOrSlug}`);
            return { product: null, isPending: true };
        }

        if (!res.ok) {
            console.warn(`[getProduct] Response not OK: ${res.status}`);
            return { product: null };
        }

        const product: Product = await res.json();
        return { product };
    } catch (error: any) {
        console.warn(`[getProduct] Fetch error: ${error.message}`);
        return { product: null };
    }
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const { product, isPending } = await getProduct(id);

    if (isPending) {
        return {
            title: 'Product Pending Approval | Stylr SA',
            description: 'This product is currently being reviewed and will be available soon.',
            robots: { index: false, follow: true },
        };
    }

    if (!product) {
        return {
            title: 'Product Not Found',
            description: 'The requested product could not be found.',
            robots: { index: false, follow: true },
        };
    }

    const title = `${product.name} | Stylr SA Marketplace`;
    const description = product.description
        ? `${product.description.substring(0, 155)}...`
        : `Buy ${product.name} from verified South African sellers. Quality beauty and hair products.`;

    const imageUrl = product.images?.[0] || `${siteUrl}/logo-transparent.png`;
    // Use slug for canonical URL if available
    const productIdentifier = product.slug || product.id;
    const canonicalUrl = `${siteUrl}/products/${productIdentifier}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Stylr SA',
            type: 'website',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { product, isPending } = await getProduct(id);

    // Show pending approval page
    if (isPending) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                padding: '2rem',
                textAlign: 'center',
            }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                }}>⏳</div>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    marginBottom: '0.5rem',
                    color: 'var(--color-text-strong)',
                }}>Product Pending Approval</h1>
                <p style={{
                    fontSize: '1rem',
                    color: 'var(--color-text-muted)',
                    maxWidth: '400px',
                    marginBottom: '1.5rem',
                }}>
                    This product is currently being reviewed by our team and will be available soon. Please check back later!
                </p>
                <a
                    href="/products"
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    Browse Products
                </a>
            </div>
        );
    }

    if (!product) {
        notFound();
    }

    // Redirect from UUID to slug for SEO-friendly URLs
    // If user visits /products/uuid-here and product has a slug, redirect to /products/slug-here
    if (isUUID(id) && product.slug && product.slug !== id) {
        redirect(`/products/${product.slug}`);
    }

    // Generate canonical URL
    const productIdentifier = product.slug || product.id;
    const canonicalUrl = `${siteUrl}/products/${productIdentifier}`;

    // Generate structured data
    const productSchema = generateProductSchema(product, canonicalUrl);
    const breadcrumbSchema = generateBreadcrumbSchema(product, canonicalUrl);

    return (
        <>
            {/* Product Schema - For rich snippets showing price, availability, etc. */}
            <Script
                id="product-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
                strategy="beforeInteractive"
            />
            {/* Breadcrumb Schema - For Google breadcrumb display */}
            <Script
                id="product-breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                strategy="beforeInteractive"
            />
            <ProductDetailClient initialProduct={product} />
        </>
    );
}

