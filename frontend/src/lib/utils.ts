import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names with support for conditionals.
 * This is the standard utility used by shadcn/ui components.
 * 
 * Since we're not using tailwind-merge to keep bundle size small,
 * this is a simpler version that works with clsx alone.
 * 
 * @example
 * cn('base-class', isActive && 'active-class', className)
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}
