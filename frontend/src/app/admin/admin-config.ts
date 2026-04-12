export type AdminView =
  | 'dashboard'
  | 'salon-applications'
  | 'salons'
  | 'services'
  | 'bookings'
  | 'all-salons'
  | 'pending-payments'
  | 'deleted-salons'
  | 'audit';

export const DEFAULT_ADMIN_VIEW: AdminView = 'dashboard';

const ADMIN_VIEW_SET = new Set<AdminView>([
  'dashboard',
  'salon-applications',
  'salons',
  'services',
  'bookings',
  'all-salons',
  'pending-payments',
  'deleted-salons',
  'audit',
]);

export function isAdminView(value: string): value is AdminView {
  return ADMIN_VIEW_SET.has(value as AdminView);
}

export function getAdminPath(view: AdminView): string {
  return view === DEFAULT_ADMIN_VIEW ? '/admin' : `/admin/${view}`;
}
