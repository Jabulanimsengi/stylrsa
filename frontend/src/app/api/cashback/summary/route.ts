import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ balance: 0, totalEarned: 0, totalSpent: 0, recentTransactions: [] });
        }

        const response = await fetch(`${API_URL}/cashback/summary`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json({ balance: 0, totalEarned: 0, totalSpent: 0, recentTransactions: [] });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching cashback summary:', error);
        return NextResponse.json({ balance: 0, totalEarned: 0, totalSpent: 0, recentTransactions: [] });
    }
}
