export type VisibilityInput = {
  visibilityWeight?: number | null;
  createdAt?: Date | string;
};

export function calculateVisibilityScore(input: VisibilityInput): number {
  return Number(input.visibilityWeight ?? 1) || 1;
}

export function compareByVisibilityThenRecency<
  A extends VisibilityInput,
  B extends VisibilityInput,
>(a: A, b: B): number {
  const sv = calculateVisibilityScore(b) - calculateVisibilityScore(a);
  if (sv !== 0) return sv;
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return bTime - aTime;
}
