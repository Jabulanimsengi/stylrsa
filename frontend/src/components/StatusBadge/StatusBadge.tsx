'use client';

import styles from './StatusBadge.module.css';

export type StatusVariant =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'confirmed'
    | 'cancelled'
    | 'completed'
    | 'shipped'
    | 'delivered'
    | 'processing'
    | 'verified'
    | 'awaiting'
    | 'default';

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

// Map common status strings to variants
const STATUS_VARIANT_MAP: Record<string, StatusVariant> = {
    // Approval statuses
    'PENDING': 'pending',
    'APPROVED': 'approved',
    'REJECTED': 'rejected',
    // Booking statuses
    'CONFIRMED': 'confirmed',
    'CANCELLED': 'cancelled',
    'COMPLETED': 'completed',
    'DECLINED': 'rejected',
    // Order statuses
    'SHIPPED': 'shipped',
    'DELIVERED': 'delivered',
    'PROCESSING': 'processing',
    // Payment statuses
    'VERIFIED': 'verified',
    'AWAITING_PROOF': 'awaiting',
    'PROOF_SUBMITTED': 'pending',
    'PENDING_SELECTION': 'default',
};

// Human-readable labels
const STATUS_LABELS: Record<string, string> = {
    'PENDING': 'Pending',
    'APPROVED': 'Approved',
    'REJECTED': 'Rejected',
    'CONFIRMED': 'Confirmed',
    'CANCELLED': 'Cancelled',
    'COMPLETED': 'Completed',
    'DECLINED': 'Declined',
    'SHIPPED': 'Shipped',
    'DELIVERED': 'Delivered',
    'PROCESSING': 'Processing',
    'VERIFIED': 'Verified',
    'AWAITING_PROOF': 'Awaiting Proof',
    'PROOF_SUBMITTED': 'Proof Submitted',
    'PENDING_SELECTION': 'Not Selected',
};

export default function StatusBadge({
    status,
    variant,
    size = 'md',
    className = '',
}: StatusBadgeProps) {
    const resolvedVariant = variant || STATUS_VARIANT_MAP[status] || 'default';
    const label = STATUS_LABELS[status] || status.replace(/_/g, ' ').toLowerCase();

    return (
        <span
            className={`${styles.badge} ${styles[resolvedVariant]} ${styles[size]} ${className}`}
            role="status"
        >
            {label}
        </span>
    );
}

// Export for external use
export { STATUS_VARIANT_MAP, STATUS_LABELS };
