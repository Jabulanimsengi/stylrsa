'use client';

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './MobileCloseButton.module.css';

type MobileCloseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label?: string;
};

const MobileCloseButton = React.forwardRef<HTMLButtonElement, MobileCloseButtonProps>(
  ({ className = '', label = 'Close', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`${styles.button} ${className}`.trim()}
      aria-label={label}
      {...props}
    >
      <FaTimes />
    </button>
  ),
);

MobileCloseButton.displayName = 'MobileCloseButton';

export default MobileCloseButton;
