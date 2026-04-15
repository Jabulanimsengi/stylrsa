import type { IconType } from 'react-icons';
import type { User } from '@/types';
import {
  FaHome,
  FaCut,
  FaInfoCircle,
  FaDollarSign,
  FaQuestionCircle,
  FaEnvelope,
  FaUser,
  FaCalendarCheck,
  FaHeart,
  FaChartLine,
  FaShieldAlt,
} from 'react-icons/fa';

export interface AppNavLink {
  href: string;
  label: string;
  icon: IconType;
  match?: (path: string) => boolean;
}

export interface AccountNavConfig {
  entryHref: string;
  entryLabel: string;
  menuLabel: string;
  roleLabel: string;
  primaryLink: AppNavLink;
  menuLinks: AppNavLink[];
}

export const PRIMARY_NAV_LINKS: AppNavLink[] = [
  {
    href: '/',
    label: 'Home',
    icon: FaHome,
    match: (path) => path === '/',
  },
  {
    href: '/about',
    label: 'About Us',
    icon: FaInfoCircle,
    match: (path) => path.startsWith('/about'),
  },
  {
    href: '/how-it-works',
    label: 'How It Works',
    icon: FaQuestionCircle,
    match: (path) => path.startsWith('/how-it-works'),
  },
  {
    href: '/services',
    label: 'Services',
    icon: FaCut,
    match: (path) => path.startsWith('/services') || path.startsWith('/salons'),
  },
  {
    href: '/prices',
    label: 'Pricing',
    icon: FaDollarSign,
    match: (path) => path.startsWith('/prices'),
  },
];

export const COMPANY_NAV_LINKS: AppNavLink[] = [
  {
    href: '/contact',
    label: 'Contact',
    icon: FaEnvelope,
    match: (path) => path.startsWith('/contact'),
  },
];

const ACCOUNT_PATH_PREFIXES = [
  '/onboarding',
  '/my-profile',
  '/my-bookings',
  '/my-favorites',
  '/dashboard',
  '/admin',
];

const ACCOUNT_BASE_LINKS: AppNavLink[] = [
  {
    href: '/my-profile',
    label: 'My Profile',
    icon: FaUser,
    match: (path) => path.startsWith('/my-profile'),
  },
  {
    href: '/my-bookings',
    label: 'My Bookings',
    icon: FaCalendarCheck,
    match: (path) => path.startsWith('/my-bookings'),
  },
  {
    href: '/my-favorites',
    label: 'Saved Salons',
    icon: FaHeart,
    match: (path) => path.startsWith('/my-favorites'),
  },
];

function getRolePrimaryLink(user: User): AppNavLink | null {
  if (user.role === 'PENDING' || user.onboardingStatus === 'ROLE_REQUIRED') {
    return {
      href: '/onboarding/role',
      label: 'Complete Setup',
      icon: FaUser,
      match: (path) => path.startsWith('/onboarding'),
    };
  }

  if (user.onboardingStatus === 'PROVIDER_SETUP_REQUIRED') {
    return {
      href: '/create-salon',
      label: 'Finish Provider Setup',
      icon: FaChartLine,
      match: (path) => path.startsWith('/create-salon') || path.startsWith('/onboarding'),
    };
  }

  if (user.role === 'SALON_OWNER') {
    return {
      href: '/dashboard',
      label: 'Salon Dashboard',
      icon: FaChartLine,
      match: (path) => path.startsWith('/dashboard'),
    };
  }

  if (user.role === 'ADMIN') {
    return {
      href: '/admin',
      label: 'Admin Console',
      icon: FaShieldAlt,
      match: (path) => path.startsWith('/admin'),
    };
  }

  return null;
}

function getRoleLabel(user: User | null): string {
  if (!user) {
    return 'Guest';
  }

  if (user.role === 'SALON_OWNER') {
    return 'Salon owner';
  }

  if (user.role === 'ADMIN') {
    return 'Administrator';
  }

  if (
    user.role === 'PENDING'
    || user.onboardingStatus === 'ROLE_REQUIRED'
    || user.onboardingStatus === 'PROVIDER_SETUP_REQUIRED'
  ) {
    return 'Setup required';
  }

  return 'Account';
}

export function getAccountNavConfig(user: User | null): AccountNavConfig {
  if (!user) {
    return {
      entryHref: '/login',
      entryLabel: 'Login',
      menuLabel: 'My Account',
      roleLabel: 'Guest',
      primaryLink: {
        href: '/login',
        label: 'Login',
        icon: FaUser,
        match: (path) => path.startsWith('/login') || path.startsWith('/register'),
      },
      menuLinks: [],
    };
  }

  const primaryLink = getRolePrimaryLink(user);
  const basePrimaryLink: AppNavLink = primaryLink ?? ACCOUNT_BASE_LINKS[0];

  return {
    entryHref: basePrimaryLink.href,
    entryLabel: primaryLink ? 'Dashboard' : 'Account',
    menuLabel: primaryLink ? 'My Hub' : 'My Account',
    roleLabel: getRoleLabel(user),
    primaryLink: basePrimaryLink,
    menuLinks: primaryLink ? [primaryLink, ...ACCOUNT_BASE_LINKS] : ACCOUNT_BASE_LINKS,
  };
}

export function isAccountRoute(pathname: string | null | undefined) {
  if (!pathname) {
    return false;
  }

  return ACCOUNT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
