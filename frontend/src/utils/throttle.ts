/**
 * Throttle function that limits how often a function can be called
 * @param func - The function to throttle
 * @param delay - The delay in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastRan: number = 0;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();

    if (!lastRan) {
      // First call - execute immediately
      func.apply(this, args);
      lastRan = now;
    } else {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Calculate time since last execution
      const timeSinceLastRan = now - lastRan;

      if (timeSinceLastRan >= delay) {
        // Enough time has passed - execute immediately
        func.apply(this, args);
        lastRan = now;
      } else {
        // Schedule execution for later
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastRan = Date.now();
          timeoutId = null;
        }, delay - timeSinceLastRan);
      }
    }
  };
}
