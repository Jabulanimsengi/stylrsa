'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface MetricsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
    trend?: {
        value: number;
        label: string;
        isPositive?: boolean;
    };
    variant?: 'default' | 'urgent' | 'success' | 'warning';
    className?: string;
}

export function MetricsCard({
    title,
    value,
    description,
    icon,
    trend,
    variant = 'default',
    className,
}: MetricsCardProps) {
    const valueStyles = {
        default: 'text-foreground',
        urgent: 'text-red-600 dark:text-red-400',
        success: 'text-green-600 dark:text-green-400',
        warning: 'text-yellow-600 dark:text-yellow-400',
    };

    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className={cn('text-2xl font-bold', valueStyles[variant])}>
                    {value}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <span
                            className={cn(
                                'text-xs font-medium',
                                trend.isPositive ? 'text-green-600' : 'text-red-600'
                            )}
                        >
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </span>
                        <span className="text-xs text-muted-foreground">{trend.label}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default MetricsCard;
