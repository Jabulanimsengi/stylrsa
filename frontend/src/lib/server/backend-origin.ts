function normalizeOrigin(value?: string): string {
  if (!value) return '';
  return value.replace(/\/api\/?$/, '').replace(/\/$/, '');
}

export function getInternalBackendOrigin(): string {
  const explicitOrigins = [
    process.env.INTERNAL_BACKEND_URL,
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_ORIGIN,
    process.env.NEXT_PUBLIC_API_URL,
  ]
    .map(normalizeOrigin)
    .filter(Boolean);

  return explicitOrigins[0] || 'http://127.0.0.1:5000';
}
