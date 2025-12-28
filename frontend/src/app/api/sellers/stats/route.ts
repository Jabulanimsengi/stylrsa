import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({
                totalSales: 0,
                totalOrders: 0,
                totalCommission: 0,
                netEarnings: 0,
                pendingOrders: 0,
                completedOrders: 0,
                monthlySales: [],
            });
        }

        const url = new URL(request.url);
        const period = url.searchParams.get('period') || 'month';

        const response = await fetch(`${API_URL}/api/sellers/stats?period=${period}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json({
                totalSales: 0,
                totalOrders: 0,
                totalCommission: 0,
                netEarnings: 0,
                pendingOrders: 0,
                completedOrders: 0,
                monthlySales: [],
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching seller stats:', error);
        return NextResponse.json({
            totalSales: 0,
            totalOrders: 0,
            totalCommission: 0,
            netEarnings: 0,
            pendingOrders: 0,
            completedOrders: 0,
            monthlySales: [],
        });
    }
}
