import { Suspense } from 'react';
import AdminPageClient from './AdminPageClient';
import styles from './AdminPage.module.css';
import { DEFAULT_ADMIN_VIEW } from './admin-config';

export default function AdminPage() {
  return (
    <Suspense fallback={<div className={styles.container}><h1 className={styles.title}>Loading admin...</h1></div>}>
      <AdminPageClient initialView={DEFAULT_ADMIN_VIEW} />
    </Suspense>
  );
}
