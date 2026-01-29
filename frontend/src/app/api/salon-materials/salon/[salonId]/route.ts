import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ salonId: string }> }
) {
    try {
        const { salonId } = await params;

        const response = await fetch(`${API_URL}/salon-materials/salon/${salonId}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json([], { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching salon materials:', error);
        return NextResponse.json([], { status: 500 });
    }
}
