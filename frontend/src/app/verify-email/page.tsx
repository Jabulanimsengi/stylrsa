'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

function VerifyEmailContent() {
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get email from URL params if provided
    const emailFromParams = searchParams.get('email') || '';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: code }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to verify email.');
            }

            setSuccess('Email verified successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to verify email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        const targetEmail = email || emailFromParams;
        if (!targetEmail) {
            setError('Please enter your email address to resend the code.');
            return;
        }

        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to resend verification code.');
            }

            setSuccess('A new verification code has been sent to your email.');

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to resend verification code.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Verify Your Email</h1>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
                    Enter the 6-digit code sent to your email address.
                </p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {!emailFromParams && (
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="Enter your email"
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label htmlFor="code" className={styles.label}>
                            Verification Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className={styles.input}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            style={{
                                letterSpacing: '0.5em',
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 'bold'
                            }}
                        />
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {success && <p className={styles.successMessage}>{success}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || code.length !== 6}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button
                        onClick={handleResendCode}
                        disabled={isResending}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#F51957',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '0.9rem'
                        }}
                    >
                        {isResending ? 'Sending...' : "Didn't receive a code? Resend"}
                    </button>
                </div>

                <p className={styles.footerText}>
                    Already verified?{' '}
                    <Link href="/login" className={styles.footerLink}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
