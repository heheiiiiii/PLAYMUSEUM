import { describe, expect, it } from 'vitest';
import { content } from '../../content';
import { communityByVenue } from '../../data/communitySample';

const { reviews: sampleReviews, saves: sampleSaves, visitors: sampleVisitors, comments } = communityByVenue.nmk;
import { feed, favoritesOf, reviewsOf, savesOf, visitorsOf } from '../community';

const saved = (id: string, note?: string) => ({ id, lens: 'base' as const, taste: 'craft' as const, savedAt: '2026-10-26T00:00:00Z', note });

describe('community sample data', () => {
  it('only refers to known artifacts and tastes', () => {
    const ids = new Set(content.artifacts.map((a) => a.id));
    for (const t of content.tastes) {
      expect(sampleVisitors[t.key]).toBeGreaterThan(0);
      for (const [id, n] of Object.entries(sampleSaves[t.key])) {
        expect(ids.has(id)).toBe(true);
        expect(n).toBeLessThanOrEqual(sampleVisitors[t.key]);
      }
    }
    for (const r of sampleReviews) expect(ids.has(r.artifactId)).toBe(true);
    const postIds = new Set(sampleReviews.map((r) => r.id));
    for (const c of comments) expect(postIds.has(c.postId)).toBe(true);
  });
});

describe('community counts', () => {
  it('adds me to my own taste only', () => {
    const me = { taste: 'craft' as const, saved: [saved('A04')] };
    expect(visitorsOf('craft', me)).toBe(sampleVisitors.craft + 1);
    expect(visitorsOf('people', me)).toBe(sampleVisitors.people);
    expect(savesOf('craft', 'A04', me)).toBe(sampleSaves.craft.A04 + 1);
    expect(savesOf('people', 'A04', me)).toBe(sampleSaves.people.A04);
  });
  it('ranks favorites by saves and marks mine', () => {
    const me = { taste: 'craft' as const, saved: [saved('A04')] };
    const top = favoritesOf('craft', content.artifacts, me);
    expect(top[0]).toMatchObject({ artifact: { id: 'A04' }, withMe: true });
    expect(top).toHaveLength(3);
  });
  it('puts my note first in the review list', () => {
    const me = { taste: 'craft' as const, saved: [saved('A05', '편안한 비대칭')] };
    const list = reviewsOf('A05', me);
    expect(list[0]).toMatchObject({ mine: true, text: '편안한 비대칭' });
    expect(list.slice(1).every((r) => !r.mine)).toBe(true);
  });
});

describe('feed', () => {
  it('puts my posts first and filters by taste', () => {
    const me = { taste: 'craft' as const, saved: [saved('A05', '편안한 비대칭')] };
    const all = feed(me);
    expect(all[0]).toMatchObject({ mine: true, artifactId: 'A05' });
    expect(all).toHaveLength(sampleReviews.length + 1);
    expect(feed(me, 'music').every((p) => p.taste === 'music')).toBe(true);
  });
});
