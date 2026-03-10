/**
 * API utility for handling requests to the backend.
 * Browser requests use same-origin Next.js routes; server requests use env-configured backend URLs.
 */

export interface RetryOptions {
  retries?: number;
  retryDelay?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

// Get the API base URL
export function getApiUrl(): string {
  // In browser, always use relative URLs to go through Next.js rewrites
  // This avoids CORS issues since requests are proxied through the same origin
  if (typeof window !== 'undefined') {
    return '';
  }
  
  // Server-side: use environment variable for SSR API calls
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_ORIGIN || '';
}

/**
 * Build full API URL from a path
 * @param path - API path starting with /api/
 * @returns Full URL for the API endpoint
 */
export function apiUrl(path: string): string {
  const base = getApiUrl();
  // If base is empty, return the relative path as-is for same-origin routing
  if (!base) {
    return path;
  }
  // Remove trailing slash from base and leading slash from path if needed
  const cleanBase = base.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 * @param path - API path starting with /api/
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Fetch response
 */
export async function apiFetch(path: string, options?: RequestInit, timeout: number = 30000): Promise<Response> {
  const url = apiUrl(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: options?.credentials || 'include',
      signal: options?.signal || controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Legacy hosting flag kept only for backward compatibility.
 */
export function isCloudflare(): boolean {
  if (typeof window !== 'undefined') {
    // Check for Cloudflare-specific headers or environment
    return !!process.env.NEXT_PUBLIC_CLOUDFLARE;
  }
  return false;
}

/**
 * Fetch JSON from API endpoint
 * @param path - API path starting with /api/
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Parsed JSON response
 */
export async function apiJson<T = unknown>(
  path: string,
  options?: RequestInit,
  timeoutOrRetryOptions: number | RetryOptions = 30000
): Promise<T> {
  const retryOptions = typeof timeoutOrRetryOptions === 'number' ? undefined : timeoutOrRetryOptions;
  const timeout = typeof timeoutOrRetryOptions === 'number' ? timeoutOrRetryOptions : 30000;
  const retries = retryOptions?.retries ?? 0;
  const retryDelay = retryOptions?.retryDelay ?? 500;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await apiFetch(path, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      }, timeout);

      if (!response.ok) {
        const error = new Error(`API error: ${response.status} ${response.statusText}`) as Error & { statusCode?: number };
        error.statusCode = response.status;
        throw error;
      }

      return await response.json();
    } catch (error: unknown) {
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const normalizedError = isAbortError
        ? new Error('Request timed out. Please check your connection and try again.')
        : error;
      const shouldRetry = attempt < retries && (retryOptions?.shouldRetry?.(normalizedError, attempt) ?? false);

      if (shouldRetry) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        continue;
      }

      throw normalizedError;
    }
  }

  throw new Error('Unexpected API retry state');
}
