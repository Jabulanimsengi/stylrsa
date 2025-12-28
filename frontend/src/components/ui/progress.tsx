import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: number;
    max?: number;
    showLabel?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
}

const variants = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
};

const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
};

function Progress({
    className,
    value = 0,
    max = 100,
    showLabel = false,
    variant = 'default',
    size = 'md',
    ...props
}: ProgressProps) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={cn('w-full', className)} {...props}>
            {showLabel && (
                <div className="flex justify-between mb-1 text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(percentage)}%</span>
                </div>
            )}
            <div
                className={cn(
                    'w-full overflow-hidden rounded-full bg-muted',
                    sizes[size]
                )}
                role="progressbar"
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={max}
            >
                <div
                    className={cn(
                        'h-full transition-all duration-300 ease-in-out rounded-full',
                        variants[variant]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

export { Progress };
