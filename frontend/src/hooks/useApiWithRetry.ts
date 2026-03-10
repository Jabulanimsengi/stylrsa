import { useState, useCallback } from 'react';
import { apiJson, RetryOptions } from '@/lib/api';
import { toast } from 'react-toastify';
import { toFriendlyMessage } from '@/lib/errors';

interface UseApiOptions {
  showRetryToast?: boolean;
  showErrorToast?: boolean;
  retryOptions?: RetryOptions;
}

/**
 * Hook for making API calls with automatic retry and user feedback
 * Example:
 * 
 * const { data, loading, error, execute } = useApiWithRetry();
 * await execute('/api/salons', { showRetryToast: true });
 */
export function useApiWithRetry<T = unknown>(defaultOptions: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    url: string,
    init?: RequestInit,
    options: UseApiOptions = {}
  ): Promise<T | null> => {
    const opts = { ...defaultOptions, ...options };
    setLoading(true);
    setError(null);

    let retryToastId: string | number | undefined;

    const customRetryOptions: RetryOptions = {
      ...opts.retryOptions,
      shouldRetry: (error: unknown, attempt: number) => {
        const statusCode = typeof error === 'object' && error && 'statusCode' in error
          ? Number((error as { statusCode?: number }).statusCode)
          : undefined;
        const shouldRetry = opts.retryOptions?.shouldRetry?.(error, attempt)
          ?? (!statusCode || statusCode >= 500);
        
        // Show a subtle retry toast on first retry
        if (shouldRetry && attempt === 0 && opts.showRetryToast) {
          retryToastId = toast.info('Retrying...', {
            autoClose: 2000,
            hideProgressBar: true,
            closeButton: false,
          });
        }
        
        return shouldRetry;
      }
    };

    try {
      const result = await apiJson<T>(url, init, customRetryOptions);
      
      // Dismiss retry toast if it's still showing
      if (retryToastId) {
        toast.dismiss(retryToastId);
      }
      
      setData(result);
      setLoading(false);
      return result;
    } catch (err: unknown) {
      // Dismiss retry toast if it's still showing
      if (retryToastId) {
        toast.dismiss(retryToastId);
      }
      
      setError(err);
      setLoading(false);
      
      // Only show error toast if all retries failed
      if (opts.showErrorToast !== false) {
        toast.error(toFriendlyMessage(err));
      }
      
      return null;
    }
  }, [defaultOptions]);

  return {
    data,
    loading,
    error,
    execute,
  };
}
