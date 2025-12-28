import * as React from 'react';
import { Button, ButtonProps } from './button';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
    loading?: boolean;
    loadingText?: string;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ className, children, loading, loadingText, disabled, ...props }, ref) => {
        return (
            <Button
                className={cn('relative', className)}
                disabled={disabled || loading}
                ref={ref}
                {...props}
            >
                {loading && (
                    <Spinner
                        size="sm"
                        variant={props.variant === 'outline' || props.variant === 'ghost' ? 'primary' : 'white'}
                        className="mr-2"
                    />
                )}
                <span className={loading ? 'opacity-70' : ''}>
                    {loading && loadingText ? loadingText : children}
                </span>
            </Button>
        );
    }
);
LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
