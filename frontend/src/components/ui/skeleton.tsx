import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'circular' | 'text' | 'rectangular';
    animation?: 'pulse' | 'shimmer' | 'none';
    width?: string | number;
    height?: string | number;
}

function Skeleton({
    className,
    variant = 'default',
    animation = 'pulse',
    width,
    height,
    style,
    ...props
}: SkeletonProps) {
    const variants = {
        default: 'rounded-md',
        circular: 'rounded-full',
        text: 'rounded h-4',
        rectangular: 'rounded-none',
    };

    const animations = {
        pulse: 'animate-pulse',
        shimmer: 'skeleton-shimmer',
        none: '',
    };

    return (
        <div
            className={cn(
                'bg-[#d9dee5]',
                variants[variant],
                animations[animation],
                className
            )}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                ...style,
            }}
            {...props}
        />
    );
}

// Common skeleton patterns
function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-xl border p-4 space-y-3', className)}>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-4 w-1/2" variant="text" />
        </div>
    );
}

function SkeletonList({ count = 5, className }: { count?: number; className?: string }) {
    return (
        <div className={cn('space-y-3', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton variant="circular" className="h-10 w-10" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" variant="text" />
                        <Skeleton className="h-3 w-1/2" variant="text" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function SkeletonTable({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
    return (
        <div className={cn('border rounded-lg overflow-hidden', className)}>
            {/* Header */}
            <div className="bg-muted/50 px-4 py-3 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" variant="text" />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="border-t px-4 py-3 flex gap-4">
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" variant="text" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export { Skeleton, SkeletonCard, SkeletonList, SkeletonTable };
