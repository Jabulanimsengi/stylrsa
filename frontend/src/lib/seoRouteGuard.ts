const INVALID_PREFIXES = ['_next', 'api', 'static', 'favicon'];
const INVALID_EXTENSIONS = [
  '.js',
  '.css',
  '.json',
  '.ico',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.woff',
  '.woff2',
  '.xml',
  '.txt',
  '.map',
];

function normalizeSegment(segment: string): string {
  return segment.trim().toLowerCase();
}

export function isBlockedSeoSegment(segment: string): boolean {
  const normalized = normalizeSegment(segment);

  return (
    !normalized ||
    normalized.startsWith('.') ||
    normalized.includes('/_next/') ||
    INVALID_PREFIXES.includes(normalized) ||
    INVALID_EXTENSIONS.some((ext) => normalized.endsWith(ext))
  );
}

export function hasBlockedSeoSegment(segments: Array<string | null | undefined>): boolean {
  return segments.some((segment) => !segment || isBlockedSeoSegment(segment));
}
