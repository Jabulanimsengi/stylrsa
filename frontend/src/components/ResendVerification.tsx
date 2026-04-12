'use client';

import { useState, FormEvent } from 'react';
import styles from '../app/auth.module.css';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';
import VerifyEmailCode from './VerifyEmailCode';
import { FaCheckCircle } from 'react-icons/fa';

interface ResendVerificationProps {
  onClose?: () => void;
}

export default function ResendVerification({ onClose }: ResendVerificationProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAlreadyVerified(false);

    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const response = await res.json();
      toast.success(response.message || 'Verification code sent! Please check your inbox.');
      setShowVerification(true);
    } catch (err: unknown) {
      console.error('Resend verification error:', err);

      let msg = 'Failed to resend verification code.';

      if (err instanceof Error && err.message) {
        msg = err.message;
      } else if (typeof err === 'string') {
        msg = err;
      }

      // Check if already verified
      if (msg.toLowerCase().includes('already verified')) {
        setAlreadyVerified(true);
        toast.success('Your email is already verified!');
      } else {
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerified = () => {
    toast.success('Email verified successfully! You can now log in.');
    if (onClose) {
      onClose();
    }
  };

  const handleCancelVerification = () => {
    setShowVerification(false);
    setEmail('');
  };

  // Show success message if already verified
  if (alreadyVerified) {
    return (
      <div className={styles.card} style={{ textAlign: 'center' }}>
        <FaCheckCircle style={{ fontSize: '4rem', color: '#10b981', marginBottom: '1rem' }} />
        <h1 className={styles.title}>Email Already Verified!</h1>
        <p style={{ marginBottom: '1.5rem', color: '#4D4952' }}>
          Your email address is already verified. You can log in now.
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        )}
      </div>
    );
  }

  if (showVerification) {
    return <VerifyEmailCode email={email} onVerified={handleVerified} onCancel={handleCancelVerification} />;
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>Resend Verification Code</h1>
      <p style={{ marginBottom: '1.5rem', color: '#4D4952', textAlign: 'center' }}>
        Enter your email address and we&apos;ll send you a new 6-digit verification code.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email address</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="your.email@example.com"
          />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div>
          <button type="submit" disabled={isLoading} className="btn btn-primary">
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </div>
      </form>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost"
          style={{ marginTop: '1rem' }}
        >
          Close
        </button>
      )}
    </div>
  );
}
