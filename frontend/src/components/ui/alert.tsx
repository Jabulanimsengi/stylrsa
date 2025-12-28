import * as React from 'react';
import { cn } from '@/lib/utils';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaTimes } from 'react-icons/fa';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    title?: string;
    onClose?: () => void;
}

const icons = {
    default: FaInfoCircle,
    info: FaInfoCircle,
    success: FaCheckCircle,
    warning: FaExclamationTriangle,
    error: FaTimesCircle,
};

const variants = {
    default: 'bg-muted text-foreground border-border',
    info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/50 dark:text-blue-100 dark:border-blue-800',
    success: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-950/50 dark:text-green-100 dark:border-green-800',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-100 dark:border-yellow-800',
    error: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-950/50 dark:text-red-100 dark:border-red-800',
};

const iconColors = {
    default: 'text-muted-foreground',
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
};

function Alert({
    className,
    variant = 'default',
    title,
    onClose,
    children,
    ...props
}: AlertProps) {
    const Icon = icons[variant];

    return (
        <div
            role="alert"
            className={cn(
                'relative w-full rounded-lg border p-4',
                variants[variant],
                className
            )}
            {...props}
        >
            <div className="flex gap-3">
                <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconColors[variant])} />
                <div className="flex-1 min-w-0">
                    {title && (
                        <h5 className="mb-1 font-medium leading-none tracking-tight">
                            {title}
                        </h5>
                    )}
                    <div className="text-sm [&_p]:leading-relaxed">
                        {children}
                    </div>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-2 top-2 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
                        aria-label="Close alert"
                    >
                        <FaTimes className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export { Alert };
