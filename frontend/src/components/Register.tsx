'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import styles from '../app/auth.module.css';
import { apiFetch } from '@/lib/api';
import { Alert, LoadingButton, Button } from '@/components/ui';
import { notify } from '@/lib/notify';
import { buildGoogleAuthCallbackUrl } from '@/lib/authRedirect';

interface RegisterProps {
  onRegisterSuccess: (email: string) => void;
}

type RegisterStep = 'account' | 'profile';

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || searchParams.get('callbackUrl');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<RegisterStep>('account');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    if (!email.trim()) {
      setError('Enter your email address to continue.');
      return;
    }

    setError('');
    setStep('profile');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (step === 'account') {
      handleContinue();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const response = await res.json();

      if (response.message) {
        notify.success(response.message);
      } else {
        notify.success('Registration successful. Check your email for the verification code.');
      }

      setTimeout(() => {
        onRegisterSuccess(email);
      }, 1500);
    } catch (err: unknown) {
      console.error('Registration error:', err);

      let msg = 'Registration failed. Please try again.';

      if (err && typeof err === 'object' && 'message' in err && typeof err.message === 'string') {
        msg = err.message;
      } else if (err && typeof err === 'object' && 'userMessage' in err && typeof err.userMessage === 'string') {
        msg = err.userMessage;
      } else if (typeof err === 'string') {
        msg = err;
      }

      setError(msg);
      notify.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const callbackUrl = buildGoogleAuthCallbackUrl({
      redirectTarget,
      preselectedRole: 'SALON_OWNER',
    });
    void signIn('google', { callbackUrl });
  };

  return (
    <div>
      {step === 'account' && (
        <>
          <div className={`${styles.oauthSection} ${styles.oauthSectionPrimary}`}>
            <p className={styles.oauthMeta}>Recommended</p>
            <button
              type="button"
              className={styles.oauthButton}
              onClick={handleGoogleClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
              <span>Continue with Google</span>
            </button>
          </div>
          <div className={`${styles.oauthDivider} ${styles.oauthDividerPlain}`}>or sign up with email</div>
          <p className={styles.oauthHelperText}>
            Email verification can take a few minutes while we finalize our domain inbox.
          </p>
        </>
      )}
      <form className={styles.form} onSubmit={handleSubmit}>
        {step === 'account' && (
          <>
            <div className={styles.stepHeader}>
              <h3 className={styles.stepTitle}>Create your salon owner account</h3>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>
            <p className={styles.helperText}>
              This signup is for salon owners only. After sign-in, we will take you straight into salon setup.
            </p>
          </>
        )}

        {step === 'profile' && (
          <>
            <div className={styles.stepHeader}>
              <h3 className={styles.stepTitle}>Profile details</h3>
            </div>

            <div className={styles.inputGroupRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="firstName" className={styles.label}>First Name</label>
                <input id="firstName" type="text" required value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="lastName" className={styles.label}>Last Name</label>
                <input id="lastName" type="text" required value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={styles.input} />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordField}>
                <input
                  id="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  required
                  value={password}
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.input} ${styles.inputWithToggle}`}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  className={styles.toggleButton}
                  aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={isPasswordVisible}
                >
                  {isPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </>
        )}

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className={styles.stepActions}>
          {step === 'profile' && (
            <Button
              type="button"
              variant="outline"
              className={styles.backButtonInline}
              onClick={() => setStep('account')}
            >
              Back
            </Button>
          )}
          {step === 'account' ? (
            <Button type="button" className="w-full" onClick={handleContinue}>
              Continue
            </Button>
          ) : (
            <LoadingButton
              type="submit"
              loading={isLoading}
              loadingText="Creating Salon Owner Account..."
              className="w-full"
            >
              Create Salon Owner Account
            </LoadingButton>
          )}
        </div>
      </form>
    </div>
  );
}
