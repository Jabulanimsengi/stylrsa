import { User } from '@/types';

type RedirectOptions = {
  redirectTarget?: string | null;
  preselectedRole?: 'SALON_OWNER' | null;
};

export function isSafeAppRedirect(target: string | null | undefined): target is string {
  return Boolean(target && target.startsWith('/') && !target.startsWith('//'));
}

export function hasProviderIntent(
  redirectTarget: string | null | undefined,
  role: string | null | undefined,
) {
  return role === 'SALON_OWNER' || (isSafeAppRedirect(redirectTarget) && redirectTarget.startsWith('/create-salon'));
}

export function buildOnboardingRoleUrl(options: RedirectOptions = {}) {
  const params = new URLSearchParams();

  if (isSafeAppRedirect(options.redirectTarget)) {
    params.set('redirect', options.redirectTarget);
  }

  if (options.preselectedRole === 'SALON_OWNER') {
    params.set('role', 'SALON_OWNER');
  }

  const query = params.toString();
  return query ? `/onboarding/role?${query}` : '/onboarding/role';
}

export function buildOnboardingClientUrl(options: RedirectOptions = {}) {
  const params = new URLSearchParams();

  if (isSafeAppRedirect(options.redirectTarget)) {
    params.set('redirect', options.redirectTarget);
  }

  const query = params.toString();
  return query ? `/onboarding/client?${query}` : '/onboarding/client';
}

export function buildGoogleAuthCallbackUrl(options: RedirectOptions = {}) {
  const params = new URLSearchParams();

  if (isSafeAppRedirect(options.redirectTarget)) {
    params.set('redirect', options.redirectTarget);
  }

  if (options.preselectedRole === 'SALON_OWNER') {
    params.set('role', 'SALON_OWNER');
  }

  const query = params.toString();
  return query ? `/auth/complete?${query}` : '/auth/complete';
}

export function getPostAuthDestination(
  user: User,
  options: RedirectOptions = {},
) {
  const safeRedirect = isSafeAppRedirect(options.redirectTarget)
    ? options.redirectTarget
    : null;

  if (user.onboardingStatus === 'ROLE_REQUIRED' || user.role === 'PENDING') {
    return buildOnboardingRoleUrl({
      redirectTarget: safeRedirect,
      preselectedRole: options.preselectedRole,
    });
  }

  if (user.onboardingStatus === 'CLIENT_PROFILE_REQUIRED') {
    return buildOnboardingClientUrl({ redirectTarget: safeRedirect });
  }

  if (
    user.onboardingStatus === 'PROVIDER_SETUP_REQUIRED' ||
    (user.role === 'SALON_OWNER' && !user.salonId)
  ) {
    return '/create-salon';
  }

  if (safeRedirect) {
    return safeRedirect;
  }

  if (user.role === 'SALON_OWNER') {
    return '/dashboard';
  }

  if (user.role === 'ADMIN') {
    return '/admin';
  }

  return '/salons';
}
