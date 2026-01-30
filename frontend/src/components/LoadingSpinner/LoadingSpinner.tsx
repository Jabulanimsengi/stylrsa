'use client';

import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white';
  fullscreen?: boolean;
  text?: string;
  inline?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  fullscreen = false,
  text,
  inline = false
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <>
      <div className={`${styles.spinner} ${styles[size]} ${styles[color]}`} />
      {text && <p className={styles.loadingText}>{text}</p>}
    </>
  );

  if (fullscreen) {
    return (
      <div className={styles.fullscreen}>
        {spinnerContent}
      </div>
    );
  }

  if (inline) {
    return spinnerContent;
  }

  return (
    <div className={styles.container}>
      {spinnerContent}
    </div>
  );
}
