import type { CSSProperties, ReactNode } from 'react';
import styles from './Skeleton.module.css';
import clsx from 'clsx';

type SkeletonVariant = 'text' | 'circle' | 'rounded' | 'button';

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
}

export function Skeleton({
  variant = 'rounded',
  className,
  width,
  height,
  style,
}: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={clsx(
        styles.skeleton,
        {
          [styles.skeletonText]: variant === 'text',
          [styles.skeletonCircle]: variant === 'circle',
          [styles.skeletonRounded]: variant === 'rounded',
          [styles.skeletonButton]: variant === 'button',
        },
        className,
      )}
      style={{ width, height, ...style }}
    />
  );
}

interface SkeletonGroupProps {
  count?: number;
  children: (index: number) => ReactNode;
  className?: string;
}

export function SkeletonGroup({ count = 1, children, className }: SkeletonGroupProps) {
  return (
    <div className={className} aria-hidden>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx}>{children(idx)}</div>
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  lines?: number;
  hasImage?: boolean;
  className?: string;
}

export function SkeletonCard({ lines = 3, hasImage = false, className }: SkeletonCardProps) {
  return (
    <div className={clsx(styles.skeletonCard, className)} aria-hidden>
      {hasImage && <div className={styles.skeletonCardMedia}><Skeleton className={styles.skeletonCardImage} /></div>}
      <div className={styles.skeletonCardBody}>
        <div className={styles.skeletonLineCluster}>
          {Array.from({ length: lines }).map((_, idx) => (
            <Skeleton
              key={idx}
              variant="text"
              className={styles.skeletonCardLine}
              style={{ width: `${Math.max(40, 92 - idx * 16)}%` }}
            />
          ))}
        </div>
        <div className={styles.skeletonMetaRow}>
          <Skeleton variant="rounded" className={styles.skeletonPill} />
          <Skeleton variant="rounded" className={styles.skeletonPillShort} />
        </div>
        <Skeleton variant="button" className={styles.skeletonCardButton} />
      </div>
    </div>
  );
}

// Service card skeleton - matches FeaturedServiceCard dimensions
export function ServiceCardSkeleton() {
  return <div className={styles.serviceCardSkeleton} aria-hidden />;
}

// Horizontal row of service card skeletons
interface ServiceRowSkeletonProps {
  count?: number;
}

export function ServiceRowSkeleton({ count = 4 }: ServiceRowSkeletonProps) {
  return (
    <div className={styles.skeletonRow} aria-hidden>
      {Array.from({ length: count }).map((_, idx) => (
        <ServiceCardSkeleton key={idx} />
      ))}
    </div>
  );
}

interface FilterBarSkeletonProps {
  compact?: boolean;
}

export function FilterBarSkeleton({ compact = false }: FilterBarSkeletonProps) {
  return (
    <div className={styles.discoveryFilterShell} aria-hidden>
      <div className={styles.discoveryQuickFilters}>
        <Skeleton variant="button" className={styles.discoveryQuickFilter} />
        <Skeleton variant="button" className={styles.discoveryQuickFilter} />
        <Skeleton variant="button" className={styles.discoveryQuickFilterShort} />
        <Skeleton variant="button" className={styles.discoveryQuickFilter} />
      </div>

      <div className={styles.discoveryFilterGrid}>
        <div className={styles.discoveryField}>
          <Skeleton variant="text" className={styles.discoveryLabel} />
          <Skeleton variant="rounded" className={styles.discoveryInput} />
        </div>
        <div className={styles.discoveryField}>
          <Skeleton variant="text" className={styles.discoveryLabel} />
          <Skeleton variant="rounded" className={styles.discoveryInput} />
        </div>
        <div className={styles.discoveryField}>
          <Skeleton variant="text" className={styles.discoveryLabel} />
          <Skeleton variant="rounded" className={styles.discoveryInput} />
        </div>
        {!compact && (
          <div className={styles.discoveryField}>
            <Skeleton variant="text" className={styles.discoveryLabel} />
            <Skeleton variant="rounded" className={styles.discoveryInput} />
          </div>
        )}
      </div>

      <div className={styles.discoveryUtilityRow}>
        <Skeleton variant="rounded" className={styles.discoveryStatus} />
        <div className={styles.discoveryActions}>
          <Skeleton variant="button" className={styles.discoverySecondaryButton} />
          <Skeleton variant="button" className={styles.discoverySecondaryButton} />
          <Skeleton variant="button" className={styles.discoveryPrimaryButton} />
        </div>
      </div>
    </div>
  );
}

interface DiscoverySectionSkeletonProps {
  cardCount?: number;
}

export function DiscoverySectionSkeleton({ cardCount = 8 }: DiscoverySectionSkeletonProps) {
  return (
    <div className={styles.discoveryShell} aria-hidden>
      <div className={styles.discoveryHeader}>
        <div className={styles.discoveryHeaderCopy}>
          <Skeleton variant="text" className={styles.discoveryEyebrow} />
          <Skeleton variant="text" className={styles.discoveryTitle} />
          <Skeleton variant="text" className={styles.discoveryLead} />
          <Skeleton variant="text" className={styles.discoveryLeadShort} />
        </div>

        <div className={styles.discoveryMetrics}>
          <div className={styles.discoveryMetric}>
            <Skeleton variant="text" className={styles.discoveryMetricLabel} />
            <Skeleton variant="text" className={styles.discoveryMetricValue} />
          </div>
          <div className={styles.discoveryMetric}>
            <Skeleton variant="text" className={styles.discoveryMetricLabel} />
            <Skeleton variant="text" className={styles.discoveryMetricValue} />
          </div>
          <div className={styles.discoveryMetric}>
            <Skeleton variant="text" className={styles.discoveryMetricLabel} />
            <Skeleton variant="text" className={styles.discoveryMetricValue} />
          </div>
        </div>
      </div>

      <FilterBarSkeleton />

      <div className={styles.discoveryResultsHeader}>
        <div>
          <Skeleton variant="text" className={styles.discoveryResultsEyebrow} />
          <Skeleton variant="text" className={styles.discoveryResultsTitle} />
          <Skeleton variant="text" className={styles.discoveryResultsCopy} />
        </div>
        <Skeleton variant="button" className={styles.discoverySecondaryButton} />
      </div>

      <div className={styles.discoveryCards}>
        {Array.from({ length: cardCount }).map((_, idx) => (
          <SkeletonCard key={idx} hasImage lines={3} />
        ))}
      </div>
    </div>
  );
}

interface CarouselRowSkeletonProps {
  count?: number;
}

export function CarouselRowSkeleton({ count = 4 }: CarouselRowSkeletonProps) {
  return (
    <div className={styles.skeletonRow} aria-hidden>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} hasImage lines={2} className={styles.carouselSkeletonCard} />
      ))}
    </div>
  );
}

interface ReviewsPanelSkeletonProps {
  count?: number;
}

export function ReviewsPanelSkeleton({ count = 3 }: ReviewsPanelSkeletonProps) {
  return (
    <div className={styles.reviewsSkeletonShell} aria-hidden>
      <div className={styles.headerSkeleton}>
        <Skeleton variant="text" width="12rem" height={28} />
        <div className={styles.reviewsStats}>
          <Skeleton variant="button" className={styles.reviewsStat} />
          <Skeleton variant="button" className={styles.reviewsStat} />
          <Skeleton variant="button" className={styles.reviewsStat} />
        </div>
      </div>

      <div className={styles.tabsSkeleton}>
        <Skeleton variant="button" width={170} height={42} />
        <Skeleton variant="button" width={150} height={42} />
        <Skeleton variant="button" width={170} height={42} />
      </div>

      <div className={styles.listItems}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className={styles.reviewCardSkeleton}>
            <div className={styles.reviewHeaderRow}>
              <div className={styles.skeletonLineCluster}>
                <Skeleton variant="text" width="10rem" height={18} />
                <Skeleton variant="text" width="13rem" height={14} />
              </div>
              <Skeleton variant="text" width="6rem" height={16} />
            </div>
            <div className={styles.skeletonLineCluster}>
              <Skeleton variant="text" width="100%" height={15} />
              <Skeleton variant="text" width="90%" height={15} />
              <Skeleton variant="text" width="72%" height={15} />
            </div>
            <div className={styles.reviewActionRow}>
              <Skeleton variant="button" width="9rem" height={36} />
            </div>
            <div className={styles.reviewMetaFooter}>
              <Skeleton variant="text" width="6rem" height={12} />
              <Skeleton variant="button" width="5rem" height={28} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPageSkeleton() {
  return (
    <div className={styles.dashboardSkeletonShell} aria-hidden>
      <div className={styles.dashboardHeroSkeleton}>
        <div className={styles.dashboardHeroCopy}>
          <Skeleton variant="text" className={styles.dashboardHeroEyebrow} />
          <Skeleton variant="text" className={styles.dashboardHeroTitle} />
          <Skeleton variant="text" className={styles.dashboardHeroLead} />
          <Skeleton variant="text" className={styles.dashboardHeroLeadShort} />
          <div className={styles.dashboardHeroMeta}>
            <Skeleton variant="button" className={styles.dashboardHeroPill} />
            <Skeleton variant="button" className={styles.dashboardHeroPill} />
            <Skeleton variant="button" className={styles.dashboardHeroPillShort} />
          </div>
          <div className={styles.dashboardHeroActions}>
            <Skeleton variant="button" className={styles.dashboardHeroSecondaryAction} />
            <Skeleton variant="button" className={styles.dashboardHeroPrimaryAction} />
          </div>
        </div>
      </div>

      <div className={styles.dashboardContentSkeleton}>
        <div className={styles.dashboardSidebarSkeleton}>
          <Skeleton variant="text" className={styles.dashboardSidebarHeading} />
          <div className={styles.dashboardSidebarGroup}>
            <Skeleton variant="button" className={styles.dashboardSidebarItem} />
            <Skeleton variant="button" className={styles.dashboardSidebarItem} />
            <Skeleton variant="button" className={styles.dashboardSidebarItem} />
            <Skeleton variant="button" className={styles.dashboardSidebarItem} />
          </div>
          <Skeleton variant="text" className={styles.dashboardSidebarHeading} />
          <div className={styles.dashboardSidebarGroup}>
            <Skeleton variant="button" className={styles.dashboardSidebarItem} />
            <Skeleton variant="button" className={styles.dashboardSidebarItem} />
            <Skeleton variant="button" className={styles.dashboardSidebarItemShort} />
          </div>
        </div>

        <div className={styles.dashboardMainSkeleton}>
          <div className={styles.dashboardTopTabs}>
            <Skeleton variant="button" className={styles.dashboardTopTab} />
            <Skeleton variant="button" className={styles.dashboardTopTab} />
            <Skeleton variant="button" className={styles.dashboardTopTabShort} />
            <Skeleton variant="button" className={styles.dashboardTopTab} />
          </div>

          <div className={styles.dashboardPanelGrid}>
            <div className={styles.dashboardPanelSkeleton}>
              <Skeleton variant="text" className={styles.dashboardPanelTitle} />
              <Skeleton variant="text" className={styles.dashboardPanelLine} />
              <Skeleton variant="text" className={styles.dashboardPanelLineShort} />
              <div className={styles.dashboardMetricRow}>
                <Skeleton variant="rounded" className={styles.dashboardMetricCard} />
                <Skeleton variant="rounded" className={styles.dashboardMetricCard} />
                <Skeleton variant="rounded" className={styles.dashboardMetricCard} />
              </div>
            </div>

            <div className={styles.dashboardPanelSkeleton}>
              <Skeleton variant="text" className={styles.dashboardPanelTitle} />
              <div className={styles.dashboardListSkeleton}>
                <Skeleton variant="rounded" className={styles.dashboardListItem} />
                <Skeleton variant="rounded" className={styles.dashboardListItem} />
                <Skeleton variant="rounded" className={styles.dashboardListItem} />
              </div>
            </div>

            <div className={`${styles.dashboardPanelSkeleton} ${styles.dashboardPanelWide}`}>
              <Skeleton variant="text" className={styles.dashboardPanelTitle} />
              <div className={styles.dashboardBookingSkeleton}>
                <Skeleton variant="rounded" className={styles.dashboardBookingRow} />
                <Skeleton variant="rounded" className={styles.dashboardBookingRow} />
                <Skeleton variant="rounded" className={styles.dashboardBookingRow} />
                <Skeleton variant="rounded" className={styles.dashboardBookingRow} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
