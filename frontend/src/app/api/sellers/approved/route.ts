import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const baseUrl =
      process.env.INTERNAL_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_ORIGIN ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:5000';
    
    // Fetch all approved products to get sellers
    const productsRes = await fetch(`${baseUrl}/api/products`, {
      cache: 'no-store',
    });

    if (!productsRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch sellers' },
        { status: productsRes.status }
      );
    }

    const products = await productsRes.json();
    
    // Extract unique sellers from products
    const sellerMap = new Map<string, {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt: string;
      productCount: number;
    }>();

    products.forEach((product: any) => {
      if (product.seller && product.seller.id) {
        const sellerId = product.seller.id;
        if (!sellerMap.has(sellerId)) {
          sellerMap.set(sellerId, {
            id: sellerId,
            firstName: product.seller.firstName || '',
            lastName: product.seller.lastName || '',
            email: product.seller.email || '',
            createdAt: product.seller.createdAt || new Date().toISOString(),
            productCount: 0,
          });
        }
        sellerMap.get(sellerId)!.productCount++;
      }
    });

    const sellers = Array.from(sellerMap.values()).sort((a, b) => {
      // Sort by product count (descending), then by name
      if (b.productCount !== a.productCount) {
        return b.productCount - a.productCount;
      }
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    });

    return NextResponse.json(sellers);
  } catch (error) {
    console.error('Error fetching sellers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

