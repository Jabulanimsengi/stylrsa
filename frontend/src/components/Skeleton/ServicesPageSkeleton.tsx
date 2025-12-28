import { Skeleton, SkeletonGroup, SkeletonCard } from './Skeleton';
import styles from './Skeleton.module.css';

interface ServicesPageSkeletonProps {
    message?: string;
    cardCount?: number;
}

export default function ServicesPageSkeleton({
    message = 'Loading services...',
    cardCount = 6
}: ServicesPageSkeletonProps) {
    return (
        <div aria-hidden>
            {/* Loading indicator */}
            <div className={styles.loadingIndicator}>
                <div className={styles.spinner} />
                <span>{message}</span>
            </div>

            {/* Content skeleton */}
            <div style={{ maxWidth: '1200px', margin: '1.5rem auto', padding: '0 1rem' }}>
                {/* Title skeleton */}
                <Skeleton
                    variant="text"
                    style={{ width: '40%', height: 32, marginBottom: '1.5rem' }}
                />

                {/* Filter bar skeleton */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    overflowX: 'auto',
                    paddingBottom: '0.5rem'
                }}>
                    <Skeleton variant="button" style={{ width: 100, height: 40, flexShrink: 0 }} />
                    <Skeleton variant="button" style={{ width: 100, height: 40, flexShrink: 0 }} />
                    <Skeleton variant="button" style={{ width: 100, height: 40, flexShrink: 0 }} />
                    <Skeleton variant="button" style={{ width: 100, height: 40, flexShrink: 0 }} />
                </div>

                {/* Cards grid */}
                <SkeletonGroup count={cardCount} className={styles.skeletonGrid}>
                    {(index) => <SkeletonCard key={index} hasImage lines={2} />}
                </SkeletonGroup>
            </div>
        </div>
    );
}

// Reusable for salons page as well
interface SalonsPageSkeletonProps {
    message?: string;
    cardCount?: number;
}

export function SalonsPageSkeleton({
    message = 'Loading salons...',
    cardCount = 8
}: SalonsPageSkeletonProps) {
    return (
        <div aria-hidden>
            {/* Loading indicator */}
            <div className={styles.loadingIndicator}>
                <div className={styles.spinner} />
                <span>{message}</span>
            </div>

            {/* Content skeleton */}
            <div style={{ maxWidth: '1200px', margin: '1.5rem auto', padding: '0 1rem' }}>
                {/* Title skeleton */}
                <Skeleton
                    variant="text"
                    style={{ width: '35%', height: 32, marginBottom: '1.5rem' }}
                />

                {/* Cards grid */}
                <SkeletonGroup count={cardCount} className={styles.skeletonGrid}>
                    {(index) => <SkeletonCard key={index} hasImage lines={3} />}
                </SkeletonGroup>
            </div>
        </div>
    );
}
