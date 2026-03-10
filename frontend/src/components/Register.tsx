'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import styles from '../app/auth.module.css';
import { apiFetch } from '@/lib/api';
import { Alert, LoadingButton, Button, ModalShell } from '@/components/ui';
import { notify } from '@/lib/notify';

// Define the props that this component will accept
interface RegisterProps {
  onRegisterSuccess: (email: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Client (book services)',
  SALON_OWNER: 'Service Provider (offer services)',
  PRODUCT_SELLER: 'Product Seller (sell products)',
  CANDIDATE: 'Job Seeker (find work)',
};

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleConfirm, setShowGoogleConfirm] = useState(false);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password, role }),
      });

      const response = await res.json();

      // Handle successful response
      if (response.message) {
        notify.success(response.message);
      } else {
        notify.success('Registration successful. Check your email for the verification code.');
      }

      // Call success handler to switch to email verification view
      // This gives the user time to see the success toast
      setTimeout(() => {
        onRegisterSuccess(email);
      }, 1500);

    } catch (err: unknown) {
      console.error('Registration error:', err);

      // Extract the error message - backend sends structured error responses
      let msg = 'Registration failed. Please try again.';

      // Check for message in error object (from parseErrorResponse)
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
    // Show confirmation dialog before proceeding with Google OAuth
    setShowGoogleConfirm(true);
  };

  const confirmGoogleSignIn = () => {
    setShowGoogleConfirm(false);
    // Store selected role in cookie before OAuth redirect
    // This will be read by NextAuth callback after Google authentication
    if (typeof document !== 'undefined') {
      // Set the role cookie before OAuth redirect (expires in 10 minutes)
      document.cookie = `oauth_signup_role=${role}; path=/; max-age=600; SameSite=Lax`;

      const callbackUrl = role === 'SALON_OWNER'
        ? '/create-salon'
        : role === 'PRODUCT_SELLER'
          ? '/product-dashboard'
          : role === 'CANDIDATE'
            ? '/create-candidate-profile'
            : '/salons';
      // Redirect to Google OAuth
      void signIn('google', { callbackUrl });
    }
  };

  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit}>
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
          <label htmlFor="email" className={styles.label}>Email address</label>
          <input id="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input} />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>Password</label>
          <input id="password" type="password" required value={password} minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input} />
        </div>

        <div className={styles.roleSelector}>
          <div className={styles.roleOption}>
            <input type="radio" id="roleClient" name="role" value="CLIENT" checked={role === 'CLIENT'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="roleClient">I'm a Client</label>
          </div>
          <div className={styles.roleOption}>
            <input type="radio" id="roleOwner" name="role" value="SALON_OWNER" checked={role === 'SALON_OWNER'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="roleOwner">I'm a Service Provider</label>
          </div>
          <div className={styles.roleOption}>
            <input type="radio" id="roleSeller" name="role" value="PRODUCT_SELLER" checked={role === 'PRODUCT_SELLER'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="roleSeller">I'm a Product Seller</label>
          </div>
          <div className={styles.roleOption}>
            <input type="radio" id="roleCandidate" name="role" value="CANDIDATE" checked={role === 'CANDIDATE'} onChange={(e) => setRole(e.target.value)} />
            <label htmlFor="roleCandidate">I'm a Job Seeker</label>
          </div>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div>
          <LoadingButton
            type="submit"
            loading={isLoading}
            loadingText="Creating Account..."
            className="w-full"
          >
            Sign Up
          </LoadingButton>
        </div>
      </form>
      <div className={styles.oauthSection}>
        <div className={styles.oauthDivider}>or</div>
        <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem', textAlign: 'center' }}>
          Selected role: <strong>{role === 'CLIENT' ? 'Client' : role === 'SALON_OWNER' ? 'Service Provider' : role === 'PRODUCT_SELLER' ? 'Product Seller' : 'Job Seeker'}</strong>
        </p>
        <button
          type="button"
          className={styles.oauthButton}
          onClick={handleGoogleClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /><path d="M1 1h22v22H1z" fill="none" /></svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Google OAuth Role Confirmation Dialog */}
      <ModalShell
        open={showGoogleConfirm}
        onOpenChange={setShowGoogleConfirm}
        title="Confirm Account Type"
        description="Choose the correct account type before continuing with Google."
        size="sm"
      >
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#475569' }}>
          You are signing up as:
        </p>
        <p style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          {ROLE_LABELS[role]}
        </p>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', lineHeight: 1.6, color: '#64748b' }}>
          This account type cannot be changed automatically after signup. Confirm before continuing.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button
            variant="outline"
            onClick={() => setShowGoogleConfirm(false)}
          >
            Go back
          </Button>
          <Button onClick={confirmGoogleSignIn}>
            Confirm and continue
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}
