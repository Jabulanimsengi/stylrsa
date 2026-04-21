import { NextResponse } from 'next/server';
import { getInternalBackendOrigin } from '@/lib/server/backend-origin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const backendOrigin = getInternalBackendOrigin();

        const backendRes = await fetch(`${backendOrigin}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await backendRes.json();

        if (!backendRes.ok) {
            return NextResponse.json(data, { status: backendRes.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Reset Password API] Error:', error);
        return NextResponse.json(
            { message: 'Failed to reset password. Please try again.' },
            { status: 500 }
        );
    }
}
