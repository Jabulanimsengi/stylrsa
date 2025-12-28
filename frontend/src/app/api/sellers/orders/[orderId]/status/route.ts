import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const { orderId } = await params;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const response = await fetch(`${API_URL}/api/product-orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return NextResponse.json(
                { error: error.message || 'Failed to update order status' },
                { status: response.status }
            );
        }

        const updatedOrder = await response.json();
        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { error: 'Failed to update order status' },
            { status: 500 }
        );
    }
}
