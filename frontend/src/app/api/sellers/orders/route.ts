import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json([], { status: 401 });
        }

        const response = await fetch(`${API_URL}/api/product-orders/seller`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json([], { status: response.status });
        }

        const orders = await response.json();

        // Transform to match SellerOrderManager expected format
        const transformedOrders = orders.map((order: any) => ({
            id: order.id,
            status: order.status,
            totalAmount: order.totalPrice,
            items: [{
                id: order.product?.id || order.id,
                productName: order.product?.name || 'Product',
                quantity: order.quantity,
                price: order.totalPrice,
            }],
            buyerName: order.buyer
                ? `${order.buyer.firstName || ''} ${order.buyer.lastName || ''}`.trim()
                : 'Customer',
            buyerPhone: order.contactPhone || null,
            shippingAddress: order.deliveryAddress || null,
            createdAt: order.createdAt,
            notes: order.notes || null,
        }));

        return NextResponse.json(transformedOrders);
    } catch (error) {
        console.error('Error fetching seller orders:', error);
        return NextResponse.json([], { status: 500 });
    }
}
