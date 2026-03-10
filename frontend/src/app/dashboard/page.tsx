import { Suspense } from 'react';
import PageNav from '@/components/PageNav';
import DashboardPageClient from './DashboardPageClient';
import styles from './Dashboard.module.css';
import { DEFAULT_DASHBOARD_TAB } from './dashboard-config';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className={styles.container}><PageNav /><h1 className={styles.title}>Loading...</h1></div>}>
      <DashboardPageClient initialTab={DEFAULT_DASHBOARD_TAB} />
    </Suspense>
  );
}
