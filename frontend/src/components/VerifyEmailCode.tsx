'use client';

import { useState, useRef, KeyboardEvent, ClipboardEvent, FormEvent } from 'react';
import styles from './VerifyEmailCode.module.css';
import { toast } from 'react-toastify';
import { apiFetch } from '@/lib/api';

interface VerifyEmailCodeProps {
  email: string;
  onVerified: () => void;
  onCancel?: () => void;
}

export default function VerifyEmailCode({ email, onVerified, onCancel }: VerifyEmailCodeProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);
      // Focus last filled input or first empty
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (/^\d$/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      setError('');

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await apiFetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationCode }),
      });

      const response = await res.json();
      toast.success(response.message || 'Email verified successfully!');
      onVerified();
    } catch (err: any) {
      console.error('Verification error:', err);
      const msg = err?.message || 'Invalid or expired verification code. Please try again.';
      setError(msg);
      toast.error(msg);
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');

    try {
      const res = await apiFetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const response = await res.json();
      toast.success(response.message || 'New verification code sent!');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      console.error('Resend error:', err);
      const msg = err?.message || 'Failed to resend code. Please try again.';
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <div className={styles.icon}>📧</div>
      </div>

      <h2 className={styles.title}>Verify Your Email</h2>
      <p className={styles.description}>
        We've sent a 6-digit verification code to<br />
        <strong>{email}</strong>
      </p>
      <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.25rem' }}>
        Can't find it? Check your spam or junk folder.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={`${styles.codeInputs} ${error ? styles.errorShake : ''} ${code.every(d => d) ? styles.complete : ''}`}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={styles.codeInput}
              disabled={isLoading}
              autoFocus={index === 0}
              placeholder="·"
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="submit"
          disabled={isLoading || code.some(d => !d)}
          className={styles.submitButton}
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className={styles.resendSection}>
        <p className={styles.resendText}>Didn't receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className={styles.resendButton}
        >
          {isResending ? 'Sending...' : 'Resend Code'}
        </button>
      </div>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
