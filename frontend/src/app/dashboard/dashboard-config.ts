import {
  FiCalendar,
  FiScissors,
  FiTag,
  FiImage,
  FiStar,
  FiCreditCard,
  FiClock,
  FiSettings,
  FiUsers,
  FiBriefcase,
} from 'react-icons/fi';

export type TabId =
  | 'bookings'
  | 'services'
  | 'reviews'
  | 'gallery'
  | 'promotions'
  | 'package'
  | 'booking-settings'
  | 'availability'
  | 'team'
  | 'jobs';

export const DEFAULT_DASHBOARD_TAB: TabId = 'bookings';

export const NAV_SECTIONS = [
  {
    label: 'Business',
    items: [
      { id: 'bookings', label: 'Bookings', icon: FiCalendar },
      { id: 'services', label: 'Services', icon: FiScissors },
      { id: 'promotions', label: 'Promotions', icon: FiTag },
    ],
  },
  {
    label: 'Content',
    items: [
      { id: 'gallery', label: 'Gallery', icon: FiImage },
      { id: 'reviews', label: 'Reviews', icon: FiStar },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'package', label: 'Package & Billing', icon: FiCreditCard },
      { id: 'availability', label: 'Availability', icon: FiClock },
      { id: 'booking-settings', label: 'Booking Settings', icon: FiSettings },
    ],
  },
  {
    label: 'Team',
    items: [
      { id: 'team', label: 'Team Members', icon: FiUsers },
      { id: 'jobs', label: 'Job Postings', icon: FiBriefcase },
    ],
  },
] as const;

const TAB_SET = new Set<TabId>(
  NAV_SECTIONS.flatMap((section) => section.items.map((item) => item.id as TabId)),
);

export function isDashboardTab(value: string): value is TabId {
  return TAB_SET.has(value as TabId);
}

export function getDashboardPath(tab: TabId): string {
  return tab === DEFAULT_DASHBOARD_TAB ? '/dashboard' : `/dashboard/${tab}`;
}
