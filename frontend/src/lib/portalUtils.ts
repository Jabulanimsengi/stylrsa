/**
 * Utility to safely handle DOM portal operations
 * Prevents "Cannot read properties of null (reading 'removeChild')" errors
 */

const PORTAL_ERROR_PATTERNS = ['insertBefore', 'removeChild', 'appendChild', 'NotFoundError'];
const PORTAL_RECOVERY_STORAGE_KEY = 'stylrsa-portal-recovery-at';
const PORTAL_RECOVERY_COOLDOWN_MS = 15000;

function toErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error ?? '');
}

export function isPortalDomError(error: unknown): boolean {
  const message = toErrorMessage(error);
  return PORTAL_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

export function recoverFromPortalDomError(source = 'unknown'): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    cleanupToastContainers();

    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Portal DOM error recovered in ${process.env.NODE_ENV}]`, source);
      return true;
    }

    const lastRecovery = Number(window.sessionStorage.getItem(PORTAL_RECOVERY_STORAGE_KEY) || '0');
    const now = Date.now();

    if (now - lastRecovery < PORTAL_RECOVERY_COOLDOWN_MS) {
      return false;
    }

    window.sessionStorage.setItem(PORTAL_RECOVERY_STORAGE_KEY, String(now));
    window.location.reload();
    return true;
  } catch (error) {
    console.warn('Portal recovery failed:', error);
    return false;
  }
}

export function safeRemoveChild(parent: Node | null, child: Node | null): boolean {
  if (!parent || !child) {
    return false;
  }

  try {
    if (parent.contains(child)) {
      parent.removeChild(child);
      return true;
    }
  } catch (error) {
    console.warn('Error removing child node:', error);
  }

  return false;
}

export function safeAppendChild(parent: Node | null, child: Node | null): boolean {
  if (!parent || !child) {
    return false;
  }

  try {
    if (!parent.contains(child)) {
      parent.appendChild(child);
      return true;
    }
  } catch (error) {
    console.warn('Error appending child node:', error);
  }

  return false;
}

/**
 * Clean up orphaned toast containers on mount
 * This prevents duplicate containers and DOM errors
 */
export function cleanupToastContainers(): void {
  if (typeof window === 'undefined') return;

  try {
    const containers = document.querySelectorAll('.Toastify');
    
    // Keep only the last container if multiple exist
    if (containers.length > 1) {
      containers.forEach((container, index) => {
        if (index < containers.length - 1) {
          container.remove();
        }
      });
    }
  } catch (error) {
    console.warn('Error cleaning up toast containers:', error);
  }
}

/**
 * Prevent React 18 strict mode double-mount issues with portals
 */
export function setupPortalErrorHandling(): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleWindowError = (event: ErrorEvent) => {
    const error = event.error ?? event.message;

    if (!isPortalDomError(error)) {
      return;
    }

    console.warn('Recovering from portal DOM error:', error);
    if (recoverFromPortalDomError('window-error')) {
      event.preventDefault();
    }
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (!isPortalDomError(event.reason)) {
      return;
    }

    console.warn('Recovering from portal promise rejection:', event.reason);
    if (recoverFromPortalDomError('unhandled-rejection')) {
      event.preventDefault();
    }
  };

  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  return () => {
    window.removeEventListener('error', handleWindowError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  };
}
