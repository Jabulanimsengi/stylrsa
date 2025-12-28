import * as React from 'react';
import { cn } from '@/lib/utils';

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}

// Keyboard key indicator for shortcuts
function Kbd({ className, children, ...props }: KbdProps) {
    return (
        <kbd
            className={cn(
                'pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5',
                'font-mono text-[10px] font-medium text-muted-foreground',
                className
            )}
            {...props}
        >
            {children}
        </kbd>
    );
}

// Common keyboard shortcuts
function KeyboardShortcut({ keys }: { keys: string[] }) {
    return (
        <span className="inline-flex items-center gap-0.5">
            {keys.map((key, index) => (
                <React.Fragment key={key}>
                    <Kbd>{key}</Kbd>
                    {index < keys.length - 1 && (
                        <span className="text-muted-foreground text-xs">+</span>
                    )}
                </React.Fragment>
            ))}
        </span>
    );
}

export { Kbd, KeyboardShortcut };
