import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Configure for large file uploads
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Increase body size limit for file uploads (default is 1MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
};

// Catch-all proxy for backend API routes
// This handles all /api/* requests that don't have explicit Next.js route handlers
export async function GET(request: NextRequest) {
  return proxyToBackend(request);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request);
}

export async function PUT(request: NextRequest) {
  return proxyToBackend(request);
}

export async function PATCH(request: NextRequest) {
  return proxyToBackend(request);
}

export async function DELETE(request: NextRequest) {
  return proxyToBackend(request);
}

async function proxyToBackend(request: NextRequest) {
  // Use a dedicated backend origin for server-to-server proxying.
  // In our Hetzner Docker setup, this must be http://backend:3001 to avoid hairpin NAT issues with public IPs.
  const isDockerProd = process.env.NODE_ENV === 'production';
  let apiOrigin = process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN;

  // If NEXT_PUBLIC_API_ORIGIN is undefined or points to the public URL, force the internal Docker name.
  if (!apiOrigin || apiOrigin.includes('stylrsa.co.za') || apiOrigin.includes('127.0.0.1')) {
    apiOrigin = isDockerProd ? 'http://backend:3001' : 'http://127.0.0.1:5000';
  }

  // Get the full path including query params
  const url = new URL(request.url);

  // The route path is /api/[something]. The backend might already be mounted on /api or /, depending on setup.
  // In the existing code: const backendUrl = `${apiOrigin}${url.pathname}${url.search}`;
  // Let's preserve that logic unless url.pathname already starts with /api/api (which indicates a bug from earlier fallback).
  let pathname = url.pathname;
  if (pathname.startsWith('/api/api/')) {
    pathname = pathname.replace('/api/api/', '/api/');
  }

  const backendUrl = `${apiOrigin}${pathname}${url.search}`;

  console.log('[PROXY DEBUG] original URL:', request.url);
  console.log('[PROXY DEBUG] NEXT_PUBLIC_API_ORIGIN:', process.env.NEXT_PUBLIC_API_ORIGIN);
  console.log('[PROXY DEBUG] apiOrigin selected:', apiOrigin);
  console.log('[PROXY DEBUG] Proxying to backendUrl:', backendUrl);

  try {
    // Get the content type to determine how to handle the body
    const contentType = request.headers.get('content-type') || '';

    // Prepare headers - copy all headers but remove Next.js specific ones
    const headers = new Headers(request.headers);
    headers.delete('x-middleware-prefetch');
    headers.delete('x-middleware-subrequest');

    // Remove hop-by-hop headers that shouldn't be proxied and can crash undici (Node 18+ fetch)
    // UND_ERR_INVALID_ARG is thrown if connection header is kept
    const hopByHopHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailer',
      'transfer-encoding',
      'upgrade',
      'host',
      'content-length' // Let fetch calculate the content-length
    ];

    hopByHopHeaders.forEach(header => headers.delete(header));

    // Explicitly read and forward cookies from Next.js cookie store
    // This is needed because App Router may not include cookies in request.headers automatically
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    if (accessToken) {
      // Append/replace Cookie header to ensure access_token is forwarded
      const existingCookie = headers.get('Cookie') || '';
      const hasAccessToken = existingCookie.includes('access_token=');
      if (!hasAccessToken) {
        headers.set('Cookie', existingCookie ? `${existingCookie}; access_token=${accessToken}` : `access_token=${accessToken}`);
      }
    }

    // For GET/HEAD requests, no body; for others, stream the body
    let body: BodyInit | undefined = undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      // For multipart/form-data, we need to read the whole body
      // For other types, we can be more memory efficient
      if (contentType.includes('multipart/form-data')) {
        const buffer = await request.arrayBuffer();
        body = Buffer.from(buffer);
      } else {
        // Stream the body directly for non-multipart requests
        body = request.body as ReadableStream<Uint8Array> | null || undefined;
      }
    }

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: body,
      cache: 'no-store',
      duplex: 'half',
    } as RequestInit);

    // Build response headers
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', response.headers.get('Content-Type') || 'application/json');

    // Forward CORS headers if present
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    if (corsHeader) {
      responseHeaders.set('Access-Control-Allow-Origin', corsHeader);
    }

    // CRITICAL: Forward Set-Cookie header for authentication
    const setCookie = response.headers.get('Set-Cookie');
    if (setCookie) {
      responseHeaders.set('Set-Cookie', setCookie);
    }

    // Stream the response back instead of loading into memory
    // This reduces memory usage significantly for large responses
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        statusCode: 502,
        code: 'BACKEND_UNAVAILABLE',
        message: 'Failed to proxy request to backend',
        userMessage:
          'The server is temporarily unavailable right now. Please try again in a moment.',
      },
      { status: 502 },
    );
  }
}

