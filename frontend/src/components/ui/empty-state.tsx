import * as React from 'react';
import { cn } from '@/lib/utils';
import { FaInbox, FaSearch, FaExclamationCircle, FaPlus } from 'react-icons/fa';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: 'inbox' | 'search' | 'error' | 'custom';
    customIcon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

const icons = {
    inbox: FaInbox,
    search: FaSearch,
    error: FaExclamationCircle,
    custom: null,
};

function EmptyState({
    className,
    icon = 'inbox',
    customIcon,
    title,
    description,
    action,
    secondaryAction,
    ...props
}: EmptyStateProps) {
    const Icon = icons[icon];

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-12 px-4 text-center',
                className
            )}
            {...props}
        >
            <div className="mb-4 rounded-full bg-muted p-4">
                {customIcon || (Icon && <Icon className="h-8 w-8 text-muted-foreground" />)}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            {(action || secondaryAction) && (
                <div className="flex gap-3">
                    {secondaryAction && (
                        <Button variant="outline" onClick={secondaryAction.onClick}>
                            {secondaryAction.label}
                        </Button>
                    )}
                    {action && (
                        <Button onClick={action.onClick}>
                            <FaPlus className="mr-2 h-4 w-4" />
                            {action.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export { EmptyState };
