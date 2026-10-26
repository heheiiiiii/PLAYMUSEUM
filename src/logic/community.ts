import type { Artifact, TasteKey } from '../content';
import { sampleReviews, sampleSaves, sampleVisitors, type SampleReview } from '../data/communitySample';
import type { SavedItem } from '../state/AppState';

// 커뮤니티 집계: 예시 데이터에 이 브라우저 이용자의 기록(저장, 감상평)을 더한다.

export interface Me {
  taste: TasteKey | null;
  saved: SavedItem[];
}

const iSaved = (me: Me, id: string) => me.saved.some((s) => s.id === id);

/** 이 취향 관람객 수 (나 포함) */
export function visitorsOf(taste: TasteKey, me: Me): number {
  return sampleVisitors[taste] + (me.taste === taste ? 1 : 0);
}

/** 이 취향 관람객 중 이 유물을 저장한 수 (나 포함) */
export function savesOf(taste: TasteKey, artifactId: string, me: Me): number {
  return (sampleSaves[taste]?.[artifactId] ?? 0) + (me.taste === taste && iSaved(me, artifactId) ? 1 : 0);
}

export interface Ranked {
  artifact: Artifact;
  count: number;
  total: number;
  withMe: boolean;
}

/** 이 취향 관람객이 많이 저장한 유물. 같으면 관람 동선 순 */
export function favoritesOf(taste: TasteKey, artifacts: Artifact[], me: Me, limit = 3): Ranked[] {
  const total = visitorsOf(taste, me);
  return artifacts
    .map((a, i) => ({ artifact: a, i, count: savesOf(taste, a.id, me), total, withMe: me.taste === taste && iSaved(me, a.id) }))
    .sort((x, y) => y.count - x.count || x.i - y.i)
    .slice(0, limit)
    .map(({ artifact, count, total: t, withMe }) => ({ artifact, count, total: t, withMe }));
}

/** 이 유물을 저장한 관람객의 취향 분포, 많은 순 */
export function tastesOf(artifactId: string, tastes: TasteKey[], me: Me) {
  return tastes
    .map((t) => ({ taste: t, count: savesOf(t, artifactId, me) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

export interface Review extends Omit<SampleReview, 'nickname'> {
  nickname: string;
  mine: boolean;
}

/** 이 유물의 감상평. 내 글이 맨 앞 */
export function reviewsOf(artifactId: string, me: Me): Review[] {
  const mine = me.saved.find((s) => s.id === artifactId && s.note);
  const list: Review[] = sampleReviews
    .filter((r) => r.artifactId === artifactId)
    .map((r) => ({ ...r, mine: false }));
  if (mine?.note) {
    list.unshift({
      id: `me-${artifactId}`,
      artifactId,
      taste: mine.taste ?? me.taste ?? 'history',
      nickname: '나',
      lens: mine.lens,
      text: mine.note,
      mine: true,
    });
  }
  return list;
}

/** 이 취향 관람객의 감상평 (모든 유물) */
export function reviewsByTaste(taste: TasteKey, me: Me): Review[] {
  const mine: Review[] = me.saved
    .filter((s) => s.note && (s.taste ?? me.taste) === taste)
    .map((s) => ({ id: `me-${s.id}`, artifactId: s.id, taste, nickname: '나', lens: s.lens, text: s.note!, mine: true }));
  return [...mine, ...sampleReviews.filter((r) => r.taste === taste).map((r) => ({ ...r, mine: false }))];
}
