import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getInternalBackendOrigin } from '@/lib/server/backend-origin';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear the access_token cookie
    cookieStore.delete('access_token');
    
    // Also try to call backend logout to clear any server-side session
    try {
      const backendOrigin = getInternalBackendOrigin();
      await fetch(`${backendOrigin}/api/auth/logout`, {
        method: 'POST',
      });
    } catch {
      // Ignore backend logout errors
    }

    console.log('[Logout API] Cookie cleared');
    
    return NextResponse.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('[Logout API] Error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
