export function getInternalBackendOrigin(): string {
  const isDockerProd = process.env.NODE_ENV === 'production' && !process.env.VERCEL;
  const configuredOrigin =
    process.env.INTERNAL_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_ORIGIN ||
    process.env.BACKEND_URL ||
    '';

  if (
    configuredOrigin &&
    !configuredOrigin.includes('stylrsa.co.za') &&
    !configuredOrigin.includes('127.0.0.1')
  ) {
    return configuredOrigin.replace(/\/$/, '');
  }

  return isDockerProd ? 'http://backend:3001' : 'http://127.0.0.1:5000';
}
