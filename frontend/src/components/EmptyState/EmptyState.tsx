'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  FaSearch,
  FaHeart,
  FaCalendarAlt,
  FaExclamationCircle,
  FaShoppingBag,
  FaImages,
  FaUsers,
  FaMapMarkerAlt,
  FaStore
} from 'react-icons/fa';
import styles from './EmptyState.module.css';

export type EmptyStateVariant =
  | 'no-results'
  | 'no-favorites'
  | 'no-bookings'
  | 'no-orders'
  | 'no-promotions'
  | 'no-gallery'
  | 'no-services'
  | 'no-location'
  | 'no-salons'
  | 'no-nearby'
  | 'error'
  | 'custom';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  illustration?: ReactNode;
  className?: string;
  locationName?: string; // For location-specific messages
  showSuggestions?: boolean; // Show alternative location suggestions
}

const variantConfig: Record<EmptyStateVariant, { icon: ReactNode; defaultTitle: string; defaultDescription: string }> = {
  'no-results': {
    icon: <FaSearch />,
    defaultTitle: 'No Results Found',
    defaultDescription: 'Try adjusting your filters or search terms to find what you\'re looking for.'
  },
  'no-favorites': {
    icon: <FaHeart />,
    defaultTitle: 'No Favorites Yet',
    defaultDescription: 'Start exploring salons and services, then add them to your favorites for easy access.'
  },
  'no-bookings': {
    icon: <FaCalendarAlt />,
    defaultTitle: 'No Bookings Yet',
    defaultDescription: 'Book your first appointment with any of our amazing salons and services.'
  },
  'no-orders': {
    icon: <FaShoppingBag />,
    defaultTitle: 'No Orders Yet',
    defaultDescription: 'Browse our product catalog and place your first order to get started.'
  },
  'no-promotions': {
    icon: <FaExclamationCircle />,
    defaultTitle: 'No Promotions Available',
    defaultDescription: 'Check back soon for exciting deals and special offers from our salons.'
  },
  'no-gallery': {
    icon: <FaImages />,
    defaultTitle: 'No Gallery Images',
    defaultDescription: 'Gallery images will be displayed here once available.'
  },
  'no-services': {
    icon: <FaUsers />,
    defaultTitle: 'No Services Available',
    defaultDescription: 'Services will appear here once they are added.'
  },
  'no-location': {
    icon: <FaMapMarkerAlt />,
    defaultTitle: 'No Salons in This Area',
    defaultDescription: 'Try searching in a different location or check back soon as we expand.'
  },
  'no-salons': {
    icon: <FaStore />,
    defaultTitle: 'No Salons Available',
    defaultDescription: 'We don\'t have any registered salons in this area yet. Check out salons in nearby locations or browse all available salons.'
  },
  'no-nearby': {
    icon: <FaMapMarkerAlt />,
    defaultTitle: 'No Nearby Salons',
    defaultDescription: 'There are no other salons nearby. Explore salons in different areas to find the perfect match for you.'
  },
  'error': {
    icon: <FaExclamationCircle />,
    defaultTitle: 'Something Went Wrong',
    defaultDescription: 'We encountered an error. Please try again or contact support if the problem persists.'
  },
  'custom': {
    icon: null,
    defaultTitle: '',
    defaultDescription: ''
  }
};

export default function EmptyState({
  variant = 'custom',
  icon,
  title,
  description,
  action,
  illustration,
  className = '',
  locationName,
  showSuggestions = false
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const displayIcon = icon || config.icon;

  // Handle location-specific titles and descriptions
  let displayTitle = title || config.defaultTitle;
  let displayDescription = description || config.defaultDescription;

  if (locationName) {
    if (variant === 'no-salons') {
      displayTitle = title || `No Salons in ${locationName}`;
      displayDescription = description || `We don't have any registered salons in ${locationName} yet. Check out salons in nearby locations or browse all available salons.`;
    } else if (variant === 'no-location') {
      displayTitle = title || `No Salons in ${locationName}`;
      displayDescription = description || `Try searching in a different location or check back soon as we expand to ${locationName}.`;
    }
  }

  return (
    <div className={`${styles.emptyState} ${className}`}>
      {illustration && (
        <div className={styles.illustration}>
          {illustration}
        </div>
      )}
      {displayIcon && !illustration && (
        <div className={styles.icon}>
          {displayIcon}
        </div>
      )}
      <h3 className={styles.title}>{displayTitle}</h3>
      {displayDescription && (
        <p className={styles.description}>{displayDescription}</p>
      )}
      {action && (
        <div className={styles.action}>
          {action}
        </div>
      )}

      {/* Show location suggestions for salon-related empty states */}
      {showSuggestions && (variant === 'no-salons' || variant === 'no-location' || variant === 'no-nearby') && (
        <div className={styles.suggestions}>
          <p className={styles.suggestionsTitle}>Explore other locations:</p>
          <div className={styles.suggestionLinks}>
            <Link href="/salons" className={styles.suggestionLink}>
              View All Salons
            </Link>
            <Link href="/salons/location/gauteng" className={styles.suggestionLink}>
              Gauteng
            </Link>
            <Link href="/salons/location/western-cape" className={styles.suggestionLink}>
              Western Cape
            </Link>
            <Link href="/salons/location/kwazulu-natal" className={styles.suggestionLink}>
              KwaZulu-Natal
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
