export type AdminView =
  | 'dashboard'
  | 'salons'
  | 'services'
  | 'reviews'
  | 'products'
  | 'promotions'
  | 'all-salons'
  | 'all-sellers'
  | 'featured-salons'
  | 'pending-payments'
  | 'media'
  | 'trends'
  | 'salon-trendz'
  | 'blogs'
  | 'top10-requests'
  | 'deleted-salons'
  | 'deleted-sellers'
  | 'audit';

export const DEFAULT_ADMIN_VIEW: AdminView = 'dashboard';

const ADMIN_VIEW_SET = new Set<AdminView>([
  'dashboard',
  'salons',
  'services',
  'reviews',
  'products',
  'promotions',
  'all-salons',
  'all-sellers',
  'featured-salons',
  'pending-payments',
  'media',
  'trends',
  'salon-trendz',
  'blogs',
  'top10-requests',
  'deleted-salons',
  'deleted-sellers',
  'audit',
]);

export function isAdminView(value: string): value is AdminView {
  return ADMIN_VIEW_SET.has(value as AdminView);
}

export function getAdminPath(view: AdminView): string {
  return view === DEFAULT_ADMIN_VIEW ? '/admin' : `/admin/${view}`;
}
