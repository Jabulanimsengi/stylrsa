import {
  calculateVisibilityScore,
  compareByVisibilityThenRecency,
} from './visibility';

describe('visibility utils', () => {
  test('calculateVisibilityScore: base weight only', () => {
    expect(calculateVisibilityScore({ visibilityWeight: 1 })).toBe(1);
    expect(calculateVisibilityScore({ visibilityWeight: 4 })).toBe(4);
  });

  test('compareByVisibilityThenRecency sorts by score then createdAt desc', () => {
    const now = new Date();
    const items = [
      {
        visibilityWeight: 1,
        createdAt: new Date(now.getTime() - 1000),
      },
      {
        visibilityWeight: 3,
        createdAt: new Date(now.getTime() - 5000),
      },
      {
        visibilityWeight: 2,
        createdAt: new Date(now.getTime() - 2000),
      },
    ];
    const sorted = items.sort(compareByVisibilityThenRecency);
    expect(sorted[0].visibilityWeight).toBe(3);
    expect(sorted[1].visibilityWeight).toBe(2);
    // last is weight 1
    expect(sorted[2].visibilityWeight).toBe(1);
  });
});
