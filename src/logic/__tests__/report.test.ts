import { describe, expect, it } from 'vitest';
import type { LensKey } from '../../content';
import { buildInsight, lensShares, MIN_LENS_SECONDS } from '../report';

const lenses: LensKey[] = ['history', 'people', 'craft', 'mystery', 'daily'];

describe('report insight', () => {
  it('needs enough time in perspective commentary', () => {
    expect(buildInsight({ base: 300, people: MIN_LENS_SECONDS - 1 }, lenses, 'craft').kind).toBe('not_enough');
  });
  it('matches when the most-read lens is the main lens', () => {
    expect(buildInsight({ craft: 80, people: 20 }, lenses, 'craft')).toMatchObject({ kind: 'match', actual: 'craft', share: 0.8 });
  });
  it('differs when another lens was read more, ignoring base commentary', () => {
    expect(buildInsight({ base: 500, craft: 10, people: 40 }, lenses, 'craft')).toMatchObject({
      kind: 'differ',
      actual: 'people',
      expected: 'craft',
      share: 0.8,
    });
  });
  it('works without a quiz result', () => {
    expect(buildInsight({ daily: 60 }, lenses, null)).toMatchObject({ kind: 'no_profile', actual: 'daily' });
  });
  it('sorts shares by time, ties in given order', () => {
    expect(lensShares({ people: 10, history: 10, base: 30 }, ['base', ...lenses]).map((s) => s.key).slice(0, 3)).toEqual([
      'base',
      'history',
      'people',
    ]);
  });
});
