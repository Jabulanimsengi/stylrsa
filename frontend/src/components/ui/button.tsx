import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', asChild: _asChild = false, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-full border border-transparent text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:transform-none active:translate-y-0';

        const variants = {
            default: 'bg-primary text-primary-foreground shadow-sm hover:-translate-y-[1px] hover:bg-primary/92',
            destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-[1px] hover:bg-destructive/92',
            outline: 'border-border bg-background text-foreground shadow-sm hover:-translate-y-[1px] hover:bg-accent hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:-translate-y-[1px] hover:bg-secondary/88',
            ghost: 'bg-transparent text-foreground shadow-none hover:-translate-y-[1px] hover:bg-accent hover:text-accent-foreground',
            link: 'text-primary underline-offset-4 hover:underline',
        };

        const sizes = {
            default: 'h-10 px-5',
            sm: 'h-8 px-3 text-xs',
            lg: 'h-11 px-6 text-sm',
            icon: 'h-10 w-10 rounded-full',
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
