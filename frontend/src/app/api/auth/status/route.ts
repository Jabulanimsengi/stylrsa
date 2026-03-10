import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInternalBackendOrigin } from '@/lib/server/backend-origin';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      console.log('[Status API] No access_token cookie found');
      return NextResponse.json(
        { status: 'unauthenticated', message: 'No token' },
        { status: 401 }
      );
    }

    // Forward the request to the backend with the token
    const backendOrigin = getInternalBackendOrigin();
    
    const backendRes = await fetch(`${backendOrigin}/api/auth/status`, {
      headers: {
        'Cookie': `access_token=${accessToken}`,
      },
    });

    if (!backendRes.ok) {
      console.log('[Status API] Backend returned:', backendRes.status);
      // Token might be expired, clear it
      if (backendRes.status === 401) {
        cookieStore.delete('access_token');
      }
      return NextResponse.json(
        { status: 'unauthenticated', message: 'Invalid token' },
        { status: 401 }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Status API] Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to check auth status' },
      { status: 500 }
    );
  }
}
