'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from '../Dashboard.module.css';

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  footer?: ReactNode;
}

export default function DashboardEmptyState({
  title,
  description,
  primaryHref,
  primaryLabel,
  footer,
}: DashboardEmptyStateProps) {
  return (
    <div className={styles.welcomeContainer}>
      <div className={styles.welcomeCard}>
        <h2>{title}</h2>
        <p>{description}</p>
        <Link href={primaryHref} className="btn btn-primary">{primaryLabel}</Link>
        {footer}
      </div>
    </div>
  );
}
