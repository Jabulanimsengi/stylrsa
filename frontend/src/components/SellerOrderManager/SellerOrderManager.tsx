'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './SellerOrderManager.module.css';
import {
    FaBoxOpen,
    FaTruck,
    FaCheck,
    FaTimes,
    FaEye,
    FaSearch,
    FaFilter,
    FaChevronDown,
    FaPhone,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

interface OrderItem {
    id: string;
    productName: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    items: OrderItem[];
    buyerName: string;
    buyerPhone?: string;
    shippingAddress?: string;
    createdAt: string;
    notes?: string;
}

const STATUS_CONFIG: Record<Order['status'], { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Pending', color: '#f59e0b', icon: <FaBoxOpen /> },
    PROCESSING: { label: 'Processing', color: '#3b82f6', icon: <FaBoxOpen /> },
    SHIPPED: { label: 'Shipped', color: '#8b5cf6', icon: <FaTruck /> },
    DELIVERED: { label: 'Delivered', color: '#10b981', icon: <FaCheck /> },
    CANCELLED: { label: 'Cancelled', color: '#ef4444', icon: <FaTimes /> },
};

export default function SellerOrderManager() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<Order['status'] | 'ALL'>('ALL');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await fetch('/api/sellers/orders', {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                // Mock data for development
                setOrders([
                    {
                        id: 'ORD001',
                        status: 'PENDING',
                        totalAmount: 450.00,
                        items: [{ id: '1', productName: 'Brazilian Hair Bundle 20"', quantity: 1, price: 450.00 }],
                        buyerName: 'Thandi Mthembu',
                        buyerPhone: '+27 82 123 4567',
                        shippingAddress: '123 Main Road, Sandton, Johannesburg',
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: 'ORD002',
                        status: 'SHIPPED',
                        totalAmount: 890.00,
                        items: [
                            { id: '2', productName: 'Lace Front Wig', quantity: 1, price: 750.00 },
                            { id: '3', productName: 'Wig Cap', quantity: 1, price: 140.00 },
                        ],
                        buyerName: 'Nomvula Dlamini',
                        buyerPhone: '+27 73 456 7890',
                        shippingAddress: '45 Park Street, Cape Town',
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                    },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        setUpdatingId(orderId);
        try {
            const response = await fetch(`/api/sellers/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                toast.success(`Order marked as ${STATUS_CONFIG[newStatus].label}`);
            } else {
                throw new Error('Failed to update');
            }
        } catch (error) {
            toast.error('Failed to update order status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeleton} />
                <div className={styles.skeleton} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>
                    <FaBoxOpen /> Orders
                </h3>
                <span className={styles.orderCount}>{orders.length} total</span>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by order ID or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.statusFilter}>
                    <FaFilter />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className={styles.filterSelect}
                    >
                        <option value="ALL">All Status</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders List */}
            <div className={styles.ordersList}>
                {filteredOrders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <FaBoxOpen className={styles.emptyIcon} />
                        <p>No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const statusConfig = STATUS_CONFIG[order.status];
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div key={order.id} className={styles.orderCard}>
                                <div
                                    className={styles.orderHeader}
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                >
                                    <div className={styles.orderInfo}>
                                        <span className={styles.orderId}>#{order.id}</span>
                                        <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                                    </div>
                                    <div
                                        className={styles.statusBadge}
                                        style={{ background: `${statusConfig.color}20`, color: statusConfig.color }}
                                    >
                                        {statusConfig.icon}
                                        {statusConfig.label}
                                    </div>
                                    <div className={styles.orderAmount}>
                                        R{order.totalAmount.toFixed(2)}
                                    </div>
                                    <FaChevronDown
                                        className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}
                                    />
                                </div>

                                {isExpanded && (
                                    <div className={styles.orderDetails}>
                                        {/* Customer Info */}
                                        <div className={styles.customerInfo}>
                                            <h4 className={styles.detailTitle}>Customer</h4>
                                            <p className={styles.customerName}>{order.buyerName}</p>
                                            {order.buyerPhone && (
                                                <a href={`tel:${order.buyerPhone}`} className={styles.contactLink}>
                                                    <FaPhone /> {order.buyerPhone}
                                                </a>
                                            )}
                                            {order.shippingAddress && (
                                                <p className={styles.address}>
                                                    <FaMapMarkerAlt /> {order.shippingAddress}
                                                </p>
                                            )}
                                        </div>

                                        {/* Items */}
                                        <div className={styles.itemsList}>
                                            <h4 className={styles.detailTitle}>Items</h4>
                                            {order.items.map((item) => (
                                                <div key={item.id} className={styles.itemRow}>
                                                    <span className={styles.itemName}>
                                                        {item.quantity}x {item.productName}
                                                    </span>
                                                    <span className={styles.itemPrice}>R{item.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Actions */}
                                        <div className={styles.actions}>
                                            {order.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                                                        disabled={updatingId === order.id}
                                                    >
                                                        <FaBoxOpen /> Mark Processing
                                                    </button>
                                                    <button
                                                        className={`${styles.actionBtn} ${styles.danger}`}
                                                        onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                                        disabled={updatingId === order.id}
                                                    >
                                                        <FaTimes /> Cancel
                                                    </button>
                                                </>
                                            )}
                                            {order.status === 'PROCESSING' && (
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                                                    disabled={updatingId === order.id}
                                                >
                                                    <FaTruck /> Mark Shipped
                                                </button>
                                            )}
                                            {order.status === 'SHIPPED' && (
                                                <button
                                                    className={`${styles.actionBtn} ${styles.success}`}
                                                    onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                                                    disabled={updatingId === order.id}
                                                >
                                                    <FaCheck /> Mark Delivered
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
