import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInternalBackendOrigin } from '@/lib/server/backend-origin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backendOrigin = getInternalBackendOrigin();
    
    console.log('[Login API] Forwarding login request to backend');
    
    // Forward the login request to the backend
    const backendRes = await fetch(`${backendOrigin}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    
    if (!backendRes.ok) {
      console.log('[Login API] Backend returned error:', backendRes.status);
      return NextResponse.json(data, { status: backendRes.status });
    }

    console.log('[Login API] Login successful, setting cookie');
    
    // Extract the access_token from the backend's Set-Cookie header
    const setCookieHeader = backendRes.headers.get('set-cookie');
    let accessToken: string | null = null;
    
    if (setCookieHeader) {
      // Parse the access_token from the Set-Cookie header
      const match = setCookieHeader.match(/access_token=([^;]+)/);
      if (match) {
        accessToken = match[1];
      }
    }

    // If we got the token, set it as a cookie on the frontend domain
    if (accessToken) {
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieStore = await cookies();
      
      cookieStore.set('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
      
      console.log('[Login API] Cookie set successfully');
    } else {
      console.warn('[Login API] No access_token found in backend response');
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Login API] Error:', error);
    return NextResponse.json(
      { message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
