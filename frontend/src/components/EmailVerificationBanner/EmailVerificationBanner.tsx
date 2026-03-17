'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaTimes, FaShieldAlt } from 'react-icons/fa';
import styles from './EmailVerificationBanner.module.css';

interface EmailVerificationBannerProps {
    email?: string;
    onDismiss?: () => void;
}

export default function EmailVerificationBanner({ email, onDismiss }: EmailVerificationBannerProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleVerifyClick = async () => {
        setIsLoading(true);
        setMessage('');

        try {
            // Send verification code to user's email
            if (email) {
                const res = await fetch('/api/auth/resend-verification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                if (res.ok) {
                    setMessage('Verification code sent! Check your email.');
                    // Redirect to verify page after short delay
                    setTimeout(() => {
                        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
                    }, 1500);
                } else {
                    const data = await res.json();
                    setMessage(data.message || 'Failed to send code. Try again.');
                }
            } else {
                // No email in props, just navigate to verify page
                router.push('/verify-email');
            }
        } catch {
            setMessage('Failed to send code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Store dismissal in session storage (will show again on next session)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('email-verification-banner-dismissed', 'true');
        }
        onDismiss?.();
    };

    // Check if banner was dismissed this session
    if (typeof window !== 'undefined') {
        const wasDismissed = sessionStorage.getItem('email-verification-banner-dismissed');
        if (wasDismissed && isVisible) {
            return null;
        }
    }

    if (!isVisible) return null;

    return (
        <div className={styles.banner}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <FaShieldAlt className={styles.icon} />
                </div>
                <div className={styles.textContent}>
                    <p className={styles.title}>
                        <strong>Verify your email for account security</strong>
                    </p>
                    <p className={styles.subtitle}>
                        Protect your account by verifying your email address. This helps us keep your account secure.
                    </p>
                    {message && <p className={styles.message}>{message}</p>}
                </div>
                <div className={styles.actions}>
                    <button
                        onClick={handleVerifyClick}
                        disabled={isLoading}
                        className={styles.verifyButton}
                    >
                        <FaEnvelope />
                        {isLoading ? 'Sending...' : 'Verify Now'}
                    </button>
                </div>
                <button
                    onClick={handleDismiss}
                    className={styles.dismissButton}
                    aria-label="Dismiss"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    );
}
