import { toast } from 'react-toastify';

export type ApiError = {
  statusCode?: number;
  code?: string;
  message?: string;
  userMessage?: string;
  referenceId?: string;
};

const DEFAULT_MESSAGE = 'Something went wrong. Please try again.';

function isNetworkError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === 'object') {
    const error = err as any;
    // Check for common network error patterns
    if (error.name === 'TypeError' && error.message?.includes('fetch')) return true;
    if (error.message?.toLowerCase().includes('network')) return true;
    if (error.message?.toLowerCase().includes('failed to fetch')) return true;
    // if (!error.statusCode && error.message) return true; // Too broad - catches standard JS errors
  }
  return false;
}

function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function toFriendlyMessage(err: unknown, fallback?: string): string {
  try {
    if (!err) return fallback || DEFAULT_MESSAGE;

    if (typeof err === 'object' && err !== null) {
      const e = err as ApiError & { message?: string };
      if (e.userMessage) return e.userMessage;
      if (
        typeof e.message === 'string' &&
        /^API error:\s+\d+/i.test(e.message) &&
        fallback
      ) {
        return fallback;
      }
    }

    // Check for network issues first
    if (isNetworkError(err)) {
      if (!isOnline()) {
        return 'You appear to be offline. Please check your internet connection.';
      }
      return 'Connection issue detected. We\'re retrying automatically...';
    }

    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || (fallback || DEFAULT_MESSAGE);

    const e = err as ApiError;
    if (e.userMessage) return e.userMessage;
    if (e.message) {
      // Hide technical details that look like stack traces
      if (/Error:|at\s+/.test(e.message)) return fallback || DEFAULT_MESSAGE;
      return e.message;
    }
    return fallback || DEFAULT_MESSAGE;
  } catch {
    return fallback || DEFAULT_MESSAGE;
  }
}

export function showError(err: unknown, fallback?: string) {
  const apiErr = (err && typeof err === 'object' ? (err as ApiError) : undefined);
  const msg = toFriendlyMessage(apiErr ?? err, fallback);
  const reference = apiErr?.referenceId;
  const toastMessage = reference ? `${msg} (Ref: ${reference.slice(0, 8)})` : msg;
  if (reference) {
    console.warn(`Error reference ${reference}`, apiErr);
  }
  toast.error(toastMessage);
}

export async function parseErrorResponse(res: Response) {
  try {
    const data = await res.json();
    return (data && (data.userMessage || data.message))
      ? (data as ApiError)
      : ({ message: res.statusText } as ApiError);
  } catch {
    return { message: res.statusText } as ApiError;
  }
}
