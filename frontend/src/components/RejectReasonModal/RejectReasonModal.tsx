'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './RejectReasonModal.module.css';
import { FiAlertCircle } from 'react-icons/fi';

interface RejectReasonModalProps {
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    placeholder?: string;
    required?: boolean;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    isLoading?: boolean;
    confirmLabel?: string;
}

export default function RejectReasonModal({
    isOpen,
    title = 'Reject Item',
    subtitle = 'Please provide a reason for this rejection. This will be shared with the owner.',
    placeholder = 'Enter reason for rejection (optional)...',
    required = false,
    onConfirm,
    onCancel,
    isLoading = false,
    confirmLabel = 'Reject',
}: RejectReasonModalProps) {
    const [reason, setReason] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const MAX_CHARS = 500;

    // Focus textarea on open
    useEffect(() => {
        if (isOpen) {
            setReason('');
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Escape key to close
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onCancel();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (required && !reason.trim()) return;
        onConfirm(reason.trim());
    };

    const canSubmit = !required || reason.trim().length > 0;

    return (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
                <div className={styles.header}>
                    <div className={styles.iconRow}>
                        <div className={styles.iconWrap}>
                            <FiAlertCircle />
                        </div>
                        <h2 id="reject-modal-title" className={styles.title}>{title}</h2>
                    </div>
                    <p className={styles.subtitle}>{subtitle}</p>
                </div>

                <div>
                    <label className={styles.label} htmlFor="reject-reason">
                        Reason {required ? <span style={{ color: '#dc2626' }}>*</span> : <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>}
                    </label>
                    <textarea
                        id="reject-reason"
                        ref={textareaRef}
                        className={styles.textarea}
                        value={reason}
                        onChange={(e) => setReason(e.target.value.slice(0, MAX_CHARS))}
                        placeholder={placeholder}
                        rows={4}
                    />
                    <p className={styles.charCount}>{reason.length}/{MAX_CHARS}</p>
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onCancel} disabled={isLoading}>
                        Cancel
                    </button>
                    <button
                        className={styles.rejectBtn}
                        onClick={handleConfirm}
                        disabled={!canSubmit || isLoading}
                    >
                        {isLoading ? 'Rejecting...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
