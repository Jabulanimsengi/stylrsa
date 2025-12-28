import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'primary' | 'secondary' | 'white';
}

const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
};

const variants = {
    default: 'border-muted-foreground/30 border-t-muted-foreground',
    primary: 'border-primary/30 border-t-primary',
    secondary: 'border-secondary/30 border-t-secondary',
    white: 'border-white/30 border-t-white',
};

function Spinner({
    className,
    size = 'md',
    variant = 'default',
    ...props
}: SpinnerProps) {
    return (
        <div
            role="status"
            aria-label="Loading"
            className={cn(
                'inline-block animate-spin rounded-full',
                sizes[size],
                variants[variant],
                className
            )}
            {...props}
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
}

export { Spinner };
