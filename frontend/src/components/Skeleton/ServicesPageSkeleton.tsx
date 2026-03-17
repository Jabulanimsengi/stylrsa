import {
    CarouselRowSkeleton,
    DiscoverySectionSkeleton,
    FilterBarSkeleton,
    Skeleton,
    SkeletonGroup,
    SkeletonCard,
} from './Skeleton';
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
        <div className={styles.pageSkeletonContainer} aria-hidden>
            <div className={styles.loadingIndicator}>
                <span>{message}</span>
            </div>

            <div className={styles.headerSkeleton}>
                <Skeleton variant="text" width="9rem" height={12} />
                <Skeleton variant="text" width="34%" height={36} />
                <Skeleton variant="text" width="62%" height={18} />
            </div>

            <div className={styles.filterSkeleton}>
                <FilterBarSkeleton compact />
            </div>

            <div className={styles.headerSkeleton} style={{ marginBottom: '1rem' }}>
                <Skeleton variant="text" width="18%" height={12} />
                <Skeleton variant="text" width="28%" height={28} />
            </div>

            <CarouselRowSkeleton count={4} />

            <div style={{ height: '1.75rem' }} />

            <SkeletonGroup count={cardCount} className={styles.gridSkeleton}>
                {(index) => <SkeletonCard key={index} hasImage lines={2} />}
            </SkeletonGroup>
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
        <div className={styles.pageSkeletonContainer} aria-hidden>
            <div className={styles.loadingIndicator}>
                <span>{message}</span>
            </div>
            <DiscoverySectionSkeleton cardCount={cardCount} />
        </div>
    );
}
