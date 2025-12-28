'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter, Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ApprovalCardProps {
    title: string;
    subtitle?: string;
    status?: 'pending' | 'approved' | 'rejected';
    metadata?: { label: string; value: ReactNode }[];
    onApprove?: () => void;
    onReject?: () => void;
    onView?: () => void;
    actions?: ReactNode;
    isLoading?: boolean;
    className?: string;
    children?: ReactNode;
}

const statusBadgeVariant = {
    pending: 'warning' as const,
    approved: 'success' as const,
    rejected: 'destructive' as const,
};

const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
};

export function ApprovalCard({
    title,
    subtitle,
    status,
    metadata,
    onApprove,
    onReject,
    onView,
    actions,
    isLoading = false,
    className,
    children,
}: ApprovalCardProps) {
    return (
        <Card className={cn('transition-shadow hover:shadow-md', className)}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-semibold truncate">
                            {title}
                        </CardTitle>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground mt-0.5 truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {status && (
                        <Badge variant={statusBadgeVariant[status]}>
                            {statusLabels[status]}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {(metadata || children) && (
                <CardContent className="pb-3">
                    {metadata && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {metadata.map((item) => (
                                <div key={item.label}>
                                    <span className="text-muted-foreground">{item.label}: </span>
                                    <span className="font-medium">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {children}
                </CardContent>
            )}

            {(onApprove || onReject || onView || actions) && (
                <CardFooter className="pt-0 gap-2 flex-wrap">
                    {onView && (
                        <Button variant="outline" size="sm" onClick={onView} disabled={isLoading}>
                            View Details
                        </Button>
                    )}
                    {onReject && (
                        <Button variant="destructive" size="sm" onClick={onReject} disabled={isLoading}>
                            Reject
                        </Button>
                    )}
                    {onApprove && (
                        <Button variant="default" size="sm" onClick={onApprove} disabled={isLoading}>
                            Approve
                        </Button>
                    )}
                    {actions}
                </CardFooter>
            )}
        </Card>
    );
}

export default ApprovalCard;
