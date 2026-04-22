import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInternalBackendOrigin } from '@/lib/server/backend-origin';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    // Also try to call backend logout to clear any server-side session
    try {
      const backendOrigin = getInternalBackendOrigin();
      await fetch(`${backendOrigin}/api/auth/logout`, {
        method: 'POST',
        headers: accessToken
          ? {
              Cookie: `access_token=${accessToken}`,
            }
          : undefined,
      });
    } catch {
      // Ignore backend logout errors
    }

    const response = NextResponse.json({ message: 'Logout successful' });

    response.cookies.set('access_token', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    });

    if (cookieDomain) {
      response.cookies.set('access_token', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        domain: cookieDomain,
        path: '/',
        expires: new Date(0),
        maxAge: 0,
      });
    }

    console.log('[Logout API] Cookie cleared');

    return response;
  } catch (error) {
    console.error('[Logout API] Error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
