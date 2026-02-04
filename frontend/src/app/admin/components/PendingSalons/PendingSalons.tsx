'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../../AdminPage.module.css';
import {
    PendingSalon,
    PLAN_PAYMENT_LABELS,
    formatRand
} from '../../types';
import { PLAN_BY_CODE, APP_PLANS } from '@/constants/plans';
import type { PlanCode, PlanPaymentStatus, ApprovalStatus } from '@/types';
import { toast } from 'react-toastify';

interface PendingSalonsProps {
    salons: PendingSalon[];
    onUpdateStatus: (id: string, status: ApprovalStatus) => Promise<void>;
    onBulkUpdate: (ids: string[], status: ApprovalStatus) => Promise<void>;
    onUpdatePaymentStatus: (salonId: string, status: PlanPaymentStatus) => Promise<void>;
    updatingSalonPlanId: string | null;
}

export default function PendingSalons({
    salons,
    onUpdateStatus,
    onBulkUpdate,
    onUpdatePaymentStatus,
    updatingSalonPlanId,
}: PendingSalonsProps) {
    const [filter, setFilter] = useState('');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const filteredSalons = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return salons;
        return salons.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.owner.email.toLowerCase().includes(q) ||
            s.city?.toLowerCase().includes(q) ||
            s.province?.toLowerCase().includes(q)
        );
    }, [salons, filter]);

    const toggleExpanded = (id: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelected = (id: string, checked: boolean) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (checked) {
                next.add(id);
            } else {
                next.delete(id);
            }
            return next;
        });
    };

    const selectAll = (checked: boolean) => {
        if (checked) {
            setSelected(new Set(filteredSalons.map(s => s.id)));
        } else {
            setSelected(new Set());
        }
    };

    const copyToClipboard = (text: string, message: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(message);
        }).catch(() => {
            toast.error('Failed to copy');
        });
    };

    if (salons.length === 0) {
        return <p>No pending salons.</p>;
    }

    return (
        <>
            {/* Filter and bulk actions bar */}
            <div className={styles.filterBar} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    placeholder="Filter by name, email, city..."
                    className={styles.searchInput}
                    style={{ minWidth: '200px', maxWidth: '300px' }}
                />
                {salons.length > 0 && (
                    <>
                        <input
                            type="checkbox"
                            checked={selected.size === filteredSalons.length && filteredSalons.length > 0}
                            onChange={e => selectAll(e.target.checked)}
                        />
                        <span>Select all ({filteredSalons.length})</span>
                        <button
                            className={styles.approveButton}
                            disabled={selected.size === 0}
                            onClick={() => onBulkUpdate(Array.from(selected), 'APPROVED')}
                        >
                            Approve selected
                        </button>
                        <button
                            className={styles.rejectButton}
                            disabled={selected.size === 0}
                            onClick={() => onBulkUpdate(Array.from(selected), 'REJECTED')}
                        >
                            Reject selected
                        </button>
                    </>
                )}
            </div>

            {filteredSalons.length > 0 ? filteredSalons.map((salon) => {
                const planCode = (salon.planCode ?? 'FREE') as PlanCode;
                const plan = PLAN_BY_CODE[planCode] ?? APP_PLANS[0];
                const amountDue = typeof salon.planPriceCents === 'number'
                    ? formatRand(salon.planPriceCents)
                    : plan.price;
                const paymentStatus = (salon.planPaymentStatus ?? 'PENDING_SELECTION') as PlanPaymentStatus;
                const isFree = planCode === 'FREE';
                const proofSubmittedAt = salon.planProofSubmittedAt
                    ? new Date(salon.planProofSubmittedAt).toLocaleString('en-ZA')
                    : null;
                const verifiedAt = salon.planVerifiedAt
                    ? new Date(salon.planVerifiedAt).toLocaleString('en-ZA')
                    : null;
                const isUpdating = updatingSalonPlanId === salon.id;
                const reference = salon.planPaymentReference ?? salon.name;
                const isExpanded = expandedItems.has(salon.id);
                const location = [salon.city, salon.province].filter(Boolean).join(', ') || 'Location not set';

                return (
                    <div key={salon.id} className={styles.collapsibleItem}>
                        {/* Collapsible Header - always visible */}
                        <div
                            className={styles.collapsibleHeader}
                            onClick={() => toggleExpanded(salon.id)}
                        >
                            <div className={styles.collapsibleHeaderLeft}>
                                <input
                                    type="checkbox"
                                    className={styles.collapsibleCheckbox}
                                    checked={selected.has(salon.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => toggleSelected(salon.id, e.target.checked)}
                                />
                                <span className={styles.collapsibleName} title={salon.name}>{salon.name}</span>
                                <span className={styles.collapsibleLocation} title={location}>{location}</span>
                            </div>
                            <div className={styles.collapsibleHeaderRight}>
                                <span className={`${styles.collapsibleStatus} ${isFree ? styles.free : styles.pending}`}>
                                    {isFree ? 'FREE' : 'Pending'}
                                </span>
                                <span className={`${styles.collapsibleToggle} ${isExpanded ? styles.open : ''}`}>▼</span>
                            </div>
                        </div>

                        {/* Collapsible Content - shown when expanded */}
                        {isExpanded && (
                            <div className={styles.collapsibleContent}>
                                <div className={styles.info}>
                                    <h4>{salon.name}</h4>
                                    <p>Owner: {salon.owner.firstName} {salon.owner.lastName} ({salon.owner.email})</p>
                                    <div className={styles.planInfo}>
                                        <div className={styles.planInfoRow}>
                                            <span><strong>Package:</strong> {plan.name}</span>
                                            <span><strong>Amount due:</strong> {isFree ? 'R0' : amountDue}</span>
                                            <span>
                                                <strong>Status:</strong>{' '}
                                                {isFree ? (
                                                    <span className={`${styles.planBadge} ${styles[`planStatus_verified`]}`}>No payment required</span>
                                                ) : (
                                                    <span className={`${styles.planBadge} ${styles[`planStatus_${paymentStatus.toLowerCase()}`]}`}>
                                                        {PLAN_PAYMENT_LABELS[paymentStatus]}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        {!isFree && (
                                            <>
                                                <div className={styles.planInfoRow}>
                                                    <span>
                                                        <strong>Reference:</strong>{' '}
                                                        <code className={styles.planReference}>{reference}</code>
                                                        <button
                                                            type="button"
                                                            className={styles.copyButton}
                                                            onClick={() => copyToClipboard(reference, 'Reference copied')}
                                                        >
                                                            Copy
                                                        </button>
                                                    </span>
                                                    {proofSubmittedAt && <span>Proof submitted: {proofSubmittedAt}</span>}
                                                    {verifiedAt && <span>Verified on: {verifiedAt}</span>}
                                                </div>
                                                <div className={styles.planAdminActions}>
                                                    <button
                                                        type="button"
                                                        className={styles.approveButton}
                                                        onClick={() => onUpdatePaymentStatus(salon.id, 'VERIFIED')}
                                                        disabled={isUpdating || paymentStatus === 'VERIFIED'}
                                                    >
                                                        {isUpdating && paymentStatus !== 'VERIFIED' ? 'Saving…' : 'Mark verified'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.approveButton}
                                                        onClick={() => onUpdatePaymentStatus(salon.id, 'PROOF_SUBMITTED')}
                                                        disabled={isUpdating || paymentStatus === 'PROOF_SUBMITTED'}
                                                    >
                                                        {isUpdating && paymentStatus === 'PROOF_SUBMITTED' ? 'Saving…' : 'Proof received'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles.rejectButton}
                                                        onClick={() => onUpdatePaymentStatus(salon.id, 'AWAITING_PROOF')}
                                                        disabled={isUpdating || paymentStatus === 'AWAITING_PROOF'}
                                                    >
                                                        {isUpdating && paymentStatus === 'AWAITING_PROOF' ? 'Saving…' : 'Awaiting proof'}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <Link href={`/dashboard?ownerId=${salon.owner.id}`} className="btn btn-secondary">View Dashboard</Link>
                                    <button onClick={() => onUpdateStatus(salon.id, 'APPROVED')} className={styles.approveButton}>Approve</button>
                                    <button onClick={() => onUpdateStatus(salon.id, 'REJECTED')} className={styles.rejectButton}>Reject</button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }) : <p>No salons match your filter.</p>}
        </>
    );
}
