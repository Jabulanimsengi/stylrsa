/**
 * CSRF Token Management Utility
 * Automatically handles CSRF token retrieval and injection
 */

let csrfToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Fetch CSRF token from server
 */
async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf/token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('CSRF token fetch failed, status:', response.status);
      // Return empty string if CSRF is not available
      // This allows the app to work even if CSRF endpoint is not ready
      return '';
    }

    const data = await response.json();
    csrfToken = typeof data.csrfToken === 'string' ? data.csrfToken : '';
    return csrfToken ?? '';
  } catch (error) {
    console.warn('CSRF token fetch error (app will continue without CSRF):', error);
    // Return empty string instead of throwing
    // This makes CSRF optional and won't break the app
    return '';
  }
}

/**
 * Get CSRF token (from cache, cookie, or fetch from server)
 */
export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken;
  }

  // Check cookie first
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    csrfToken = cookieToken;
    return cookieToken;
  }

  // If already fetching, return the pending promise
  if (tokenPromise) {
    return tokenPromise;
  }

  // Fetch from server
  tokenPromise = fetchCsrfToken();
  
  try {
    const token = await tokenPromise;
    return token;
  } finally {
    tokenPromise = null;
  }
}

/**
 * Clear cached CSRF token (useful after logout or token expiry)
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  tokenPromise = null;
}

/**
 * Add CSRF token to fetch options
 */
export async function addCsrfHeader(options: RequestInit = {}): Promise<RequestInit> {
  const method = options.method?.toUpperCase() || 'GET';
  
  // Only add CSRF token for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    try {
      const token = await getCsrfToken();
      
      // Only add header if token exists
      if (token) {
        return {
          ...options,
          headers: {
            ...options.headers,
            'X-CSRF-Token': token,
          },
        };
      }
    } catch {
      // If CSRF fails, continue without it (graceful degradation)
      console.warn('CSRF token not available, continuing without CSRF protection');
    }
  }

  return options;
}

/**
 * Wrapper for fetch with automatic CSRF protection
 */
export async function fetchWithCsrf(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const options = await addCsrfHeader(init);
  return fetch(input, options);
}
