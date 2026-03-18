import {
  FiCalendar,
  FiScissors,
  FiImage,
  FiStar,
  FiSettings,
  FiUsers,
} from 'react-icons/fi';

export type TabId =
  | 'bookings'
  | 'services'
  | 'team-members'
  | 'reviews'
  | 'gallery'
  | 'booking-settings';

export const DEFAULT_DASHBOARD_TAB: TabId = 'bookings';

export const NAV_SECTIONS = [
  {
    label: 'Operations',
    items: [
      { id: 'bookings', label: 'Bookings', icon: FiCalendar },
      { id: 'services', label: 'Services', icon: FiScissors },
      { id: 'team-members', label: 'Team Members', icon: FiUsers },
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
      { id: 'booking-settings', label: 'Booking Settings', icon: FiSettings },
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
