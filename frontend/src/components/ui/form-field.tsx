import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

interface FormFieldProps {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}

function FormField({
    label,
    description,
    error,
    required,
    className,
    children,
}: FormFieldProps) {
    const id = React.useId();

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label htmlFor={id} required={required} error={!!error}>
                    {label}
                </Label>
            )}
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            <div className="relative">
                {React.isValidElement(children)
                    ? React.cloneElement(children as React.ReactElement<{ id?: string; error?: boolean }>, {
                        id,
                        error: !!error,
                    })
                    : children}
            </div>
            {error && (
                <p className="text-sm text-destructive" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

export { FormField };
