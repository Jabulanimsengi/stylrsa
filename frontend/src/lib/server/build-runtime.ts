function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '');
}

export function isBuildPhase(): boolean {
  return (
    process.env.IS_BUILD_PHASE === 'true' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  );
}

export function isLocalOrigin(origin: string): boolean {
  const normalized = normalizeOrigin(origin).toLowerCase();
  return normalized.includes('localhost') || normalized.includes('127.0.0.1');
}

export function shouldSkipBackendFetchDuringBuild(origin: string): boolean {
  return isBuildPhase() && isLocalOrigin(origin);
}

export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
