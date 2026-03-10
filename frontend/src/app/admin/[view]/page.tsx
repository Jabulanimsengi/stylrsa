import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AdminPageClient from '../AdminPageClient';
import styles from '../AdminPage.module.css';
import { isAdminView } from '../admin-config';

type Props = {
  params: Promise<{
    view: string;
  }>;
};

export default async function AdminViewPage({ params }: Props) {
  const { view } = await params;

  if (!isAdminView(view)) {
    notFound();
  }

  return (
    <Suspense fallback={<div className={styles.container}><h1 className={styles.title}>Loading admin...</h1></div>}>
      <AdminPageClient initialView={view} />
    </Suspense>
  );
}
