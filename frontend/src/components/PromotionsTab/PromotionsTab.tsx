'use client';

import React from 'react';
import { FaTrash } from 'react-icons/fa';
import styles from '../../app/dashboard/Dashboard.module.css';
import { ApprovalStatus } from '@/types';

interface Promo {
    id: string;
    originalPrice: number;
    promotionalPrice: number;
    discountPercentage: number;
    endDate: string;
    approvalStatus: ApprovalStatus;
    service?: { title?: string };
    product?: { name?: string };
}

interface PromotionsTabProps {
    activePromotions: Promo[];
    expiredPromotions: Promo[];
    onDelete: (id: string) => void;
    getStatusClass: (status: ApprovalStatus) => string;
}

export default function PromotionsTab({
    activePromotions,
    expiredPromotions,
    onDelete,
    getStatusClass,
}: PromotionsTabProps) {
    return (
        <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Promotions</h3>
            </div>

            <h4 className={styles.sectionHeading}>Active Promotions</h4>
            <div className={styles.list}>
                {activePromotions.length > 0 ? activePromotions.map((promo) => {
                    const item = promo.service || promo.product;
                    const itemName = promo.service?.title ?? (promo.product as any)?.name ?? '';
                    const daysLeft = Math.ceil((new Date(promo.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                        <div key={promo.id} className={styles.listItem}>
                            <div>
                                <p><strong>{itemName}</strong></p>
                                <p className={styles.promoDetails}>
                                    <span className={styles.promoPricing}>
                                        <span className={styles.promoOriginalPrice}>R{promo.originalPrice.toFixed(2)}</span>
                                        <span>→</span>
                                        <span className={styles.promoDiscountedPrice}>R{promo.promotionalPrice.toFixed(2)}</span>
                                        <span>({promo.discountPercentage}% off)</span>
                                    </span>
                                </p>
                                <p className={styles.promoDuration}>{daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}</p>
                            </div>
                            <div className={styles.actions}>
                                <span className={`${styles.statusBadge} ${getStatusClass(promo.approvalStatus)}`}>
                                    {promo.approvalStatus}
                                </span>
                                <button onClick={() => onDelete(promo.id)} className={styles.deleteButton}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className={styles.emptyState}>
                        <h3 className={styles.emptyStateTitle}>No Active Promotions</h3>
                        <p className={styles.emptyStateMessage}>
                            Create promotions for your services to attract more customers with special offers and discounts.
                        </p>
                    </div>
                )}
            </div>

            {expiredPromotions.length > 0 && (
                <>
                    <h4 className={styles.sectionHeadingTop}>Expired Promotions</h4>
                    <div className={styles.list}>
                        {expiredPromotions.map((promo) => (
                            <div key={promo.id} className={styles.listItem}>
                                <p><strong>{promo.service?.title || (promo.product as any)?.name}</strong> - Was {promo.discountPercentage}% off</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
