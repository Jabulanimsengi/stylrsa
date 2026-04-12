'use client';

import React from 'react';
import { FaTrash, FaEdit, FaTag } from 'react-icons/fa';
import { Button } from '@/components/ui';
import StatusBadge from '@/components/StatusBadge';
import { Service } from '@/types';
import {
    formatServiceDiscountLabel,
    getServiceDiscountedPrice,
    hasServiceDiscount,
} from '@/lib/servicePricing';
import styles from '../../app/dashboard/Dashboard.module.css';

interface ServicesTabProps {
    services: Service[];
    onAddService: () => void;
    onEditService: (service: Service) => void;
    onManageDiscount: (service: Service) => void;
    onDeleteService: (id: string) => void;
}

export default function ServicesTab({
    services,
    onAddService,
    onEditService,
    onManageDiscount,
    onDeleteService,
}: ServicesTabProps) {
    return (
        <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Services</h3>
                <Button size="sm" variant="default" onClick={onAddService}>+ Add Service</Button>
            </div>

            <div className={styles.messageDisplay}>
                Add services here, then assign them to your staff from the Team Members section in the sidebar.
            </div>

            <div className={styles.list}>
                {services.length > 0 ? services.map((service) => (
                    <div key={service.id} className={styles.listItem}>
                        <div className={styles.serviceMainInfo}>
                            <div>
                                <span className={styles.serviceTitle}>{service.title}</span>
                                {hasServiceDiscount(service) && (
                                    <div className={styles.serviceDiscountRow}>
                                        <span className={styles.serviceDiscountBadge}>
                                            {formatServiceDiscountLabel(service)}
                                        </span>
                                        <span className={styles.serviceOriginalPrice}>
                                            R{service.price.toFixed(2)}
                                        </span>
                                        <span className={styles.serviceDiscountedPrice}>
                                            R{getServiceDiscountedPrice(service).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                {service.approvalStatus === 'PENDING' && (
                                    <div className={styles.servicePriceInline}>Awaiting admin approval</div>
                                )}
                            </div>
                            {!hasServiceDiscount(service) && (
                                <span className={styles.servicePriceInline}>R{service.price.toFixed(2)}</span>
                            )}
                        </div>
                        <div className={styles.serviceActionsCompact}>
                            <StatusBadge status={service.approvalStatus || 'PENDING'} />
                            <button
                                onClick={() => onManageDiscount(service)}
                                className={styles.promoButton}
                                aria-label={hasServiceDiscount(service) ? 'Edit discount' : 'Add discount'}
                                title={hasServiceDiscount(service) ? 'Edit discount' : 'Add discount'}
                            >
                                <FaTag />
                            </button>
                            <button
                                onClick={() => onEditService(service)}
                                className={styles.editButton}
                                aria-label="Edit service"
                            >
                                <FaEdit />
                            </button>
                            <button
                                onClick={() => onDeleteService(service.id)}
                                className={styles.deleteButton}
                                aria-label="Delete service"
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className={styles.emptyState}>
                        <h3 className={styles.emptyStateTitle}>No Services Yet</h3>
                        <p className={styles.emptyStateMessage}>
                            Start by adding your first service. Services are what customers will book from your salon.
                        </p>
                        <Button variant="default" onClick={onAddService}>
                            Add Your First Service
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
