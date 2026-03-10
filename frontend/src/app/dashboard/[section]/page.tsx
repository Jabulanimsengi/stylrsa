import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import PageNav from '@/components/PageNav';
import DashboardPageClient from '../DashboardPageClient';
import styles from '../Dashboard.module.css';
import { isDashboardTab } from '../dashboard-config';

type Props = {
  params: Promise<{
    section: string;
  }>;
};

export default async function DashboardSectionPage({ params }: Props) {
  const { section } = await params;

  if (!isDashboardTab(section)) {
    notFound();
  }

  return (
    <Suspense fallback={<div className={styles.container}><PageNav /><h1 className={styles.title}>Loading...</h1></div>}>
      <DashboardPageClient initialTab={section} />
    </Suspense>
  );
}
