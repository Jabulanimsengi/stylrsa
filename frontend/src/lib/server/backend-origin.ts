const LEGACY_HOST_MARKERS = ['onrender.com', 'railway.app', 'vercel.app'];

function normalizeOrigin(value?: string): string {
  if (!value) return '';
  return value.replace(/\/api\/?$/, '').replace(/\/$/, '');
}

function isLegacyHostedOrigin(value: string): boolean {
  return LEGACY_HOST_MARKERS.some((marker) => value.includes(marker));
}

export function getInternalBackendOrigin(): string {
  const explicitOrigins = [
    process.env.INTERNAL_BACKEND_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_ORIGIN,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ]
    .map(normalizeOrigin)
    .filter(Boolean);

  const preferredOrigin = explicitOrigins.find((origin) => !isLegacyHostedOrigin(origin));

  if (preferredOrigin) {
    return preferredOrigin;
  }

  const fallbackOrigin = explicitOrigins[0];
  if (fallbackOrigin) {
    return fallbackOrigin;
  }

  return 'http://127.0.0.1:5000';
}
