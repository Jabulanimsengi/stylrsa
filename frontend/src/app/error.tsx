'use client';

import Link from 'next/link';

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Something went wrong</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        We encountered an error. Please try again.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={reset}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#000', 
            color: '#fff', 
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
        <Link
          href="/"
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: '#666', 
            color: '#fff', 
            textDecoration: 'none',
            borderRadius: '0.5rem'
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
