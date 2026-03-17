import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    fallback?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
};

function Avatar({
    className,
    src,
    alt,
    fallback,
    size = 'md',
    ...props
}: AvatarProps) {
    const [hasError, setHasError] = React.useState(false);

    // Generate fallback initials
    const initials = React.useMemo(() => {
        if (fallback) return fallback.slice(0, 2).toUpperCase();
        if (alt) {
            const words = alt.split(' ').filter(Boolean);
            if (words.length >= 2) {
                return (words[0][0] + words[1][0]).toUpperCase();
            }
            return alt.slice(0, 2).toUpperCase();
        }
        return '?';
    }, [alt, fallback]);

    const showImage = src && !hasError;

    return (
        <div
            className={cn(
                'relative flex shrink-0 overflow-hidden rounded-full bg-muted',
                sizes[size],
                className
            )}
            {...props}
        >
            {showImage ? (
                <Image
                    src={src}
                    alt={alt || 'Avatar'}
                    fill
                    unoptimized
                    className="aspect-square h-full w-full object-cover"
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className="flex h-full w-full items-center justify-center font-medium text-muted-foreground">
                    {initials}
                </span>
            )}
        </div>
    );
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    children: React.ReactNode;
}

function AvatarGroup({
    className,
    max = 4,
    size = 'md',
    children,
    ...props
}: AvatarGroupProps) {
    const childArray = React.Children.toArray(children);
    const visibleChildren = childArray.slice(0, max);
    const overflow = childArray.length - max;

    return (
        <div className={cn('flex -space-x-2', className)} {...props}>
            {visibleChildren.map((child, index) => (
                <div key={index} className="ring-2 ring-background rounded-full">
                    {React.isValidElement(child)
                        ? React.cloneElement(child as React.ReactElement<{ size?: string }>, { size })
                        : child}
                </div>
            ))}
            {overflow > 0 && (
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full bg-muted ring-2 ring-background font-medium text-muted-foreground',
                        sizes[size]
                    )}
                >
                    +{overflow}
                </div>
            )}
        </div>
    );
}

export { Avatar, AvatarGroup };
