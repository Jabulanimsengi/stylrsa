'use client';

import { MetricsCard } from '@/components/MetricsCard';
import {
    FaStore,
    FaUserTie,
    FaCalendarCheck,
    FaShoppingBag,
    FaStar,
    FaExclamationTriangle
} from 'react-icons/fa';

interface AdminMetricsProps {
    metrics: {
        totalSalons?: number;
        totalSellers?: number;
        totalBookings?: number;
        totalOrders?: number;
        avgRating?: number;
        pendingApprovals?: number;
    } | null;
}

export function AdminMetrics({ metrics }: AdminMetricsProps) {
    if (!metrics) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="h-24 bg-muted animate-pulse rounded-xl"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <MetricsCard
                title="Total Salons"
                value={metrics.totalSalons ?? 0}
                icon={<FaStore className="w-4 h-4" />}
            />
            <MetricsCard
                title="Total Sellers"
                value={metrics.totalSellers ?? 0}
                icon={<FaUserTie className="w-4 h-4" />}
            />
            <MetricsCard
                title="Bookings"
                value={metrics.totalBookings ?? 0}
                icon={<FaCalendarCheck className="w-4 h-4" />}
            />
            <MetricsCard
                title="Orders"
                value={metrics.totalOrders ?? 0}
                icon={<FaShoppingBag className="w-4 h-4" />}
            />
            <MetricsCard
                title="Avg Rating"
                value={(metrics.avgRating ?? 0).toFixed(1)}
                description="out of 5.0"
                icon={<FaStar className="w-4 h-4" />}
            />
            <MetricsCard
                title="Pending"
                value={metrics.pendingApprovals ?? 0}
                variant={(metrics.pendingApprovals ?? 0) > 0 ? 'urgent' : 'default'}
                icon={<FaExclamationTriangle className="w-4 h-4" />}
            />
        </div>
    );
}

export default AdminMetrics;
