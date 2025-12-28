import * as React from 'react';
import { cn } from '@/lib/utils';

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
    label?: string;
}

function Separator({
    className,
    orientation = 'horizontal',
    decorative = true,
    label,
    ...props
}: SeparatorProps) {
    const semanticProps = decorative
        ? { role: 'none' }
        : { role: 'separator', 'aria-orientation': orientation };

    if (label) {
        return (
            <div
                className={cn(
                    'flex items-center gap-3',
                    orientation === 'vertical' && 'flex-col',
                    className
                )}
                {...semanticProps}
                {...props}
            >
                <div
                    className={cn(
                        'flex-1 bg-border',
                        orientation === 'horizontal' ? 'h-[1px]' : 'w-[1px]'
                    )}
                />
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    {label}
                </span>
                <div
                    className={cn(
                        'flex-1 bg-border',
                        orientation === 'horizontal' ? 'h-[1px]' : 'w-[1px]'
                    )}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'shrink-0 bg-border',
                orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
                className
            )}
            {...semanticProps}
            {...props}
        />
    );
}

export { Separator };
