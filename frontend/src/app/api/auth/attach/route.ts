import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === 'string' ? body.token : null;
    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }
    const isProduction = process.env.NODE_ENV === 'production';

    // Don't set domain in development to avoid localhost issues
    const cookieStore = await cookies();
    cookieStore.set('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day in seconds
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to attach token' }, { status: 500 });
  }
}
