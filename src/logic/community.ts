import { venue, type Artifact, type ScriptKey, type TasteKey } from '../content';
import { communityByVenue, type SampleComment, type VenueCommunity } from '../data/communitySample';
import type { SavedItem } from '../state/AppState';

// 커뮤니티 집계: 지금 관람지의 예시 데이터에 이 브라우저 이용자의 기록(저장, 감상평)을 더한다.

const EMPTY: VenueCommunity = {
  visitors: { history: 0, people: 0, craft: 0, mystery: 0, daily: 0, music: 0 },
  saves: { history: {}, people: {}, craft: {}, mystery: {}, daily: {}, music: {} },
  reviews: [],
  comments: [],
};

/** 지금 관람지의 예시 데이터 (없으면 빈 라운지) */
export const community = (): VenueCommunity => communityByVenue[venue.id] ?? EMPTY;
export const hasSampleData = () => !!communityByVenue[venue.id];

export interface Me {
  taste: TasteKey | null;
  saved: SavedItem[];
}

const iSaved = (me: Me, id: string) => me.saved.some((s) => s.id === id);

/** 이 취향 관람객 수 (나 포함) */
export function visitorsOf(taste: TasteKey, me: Me): number {
  return community().visitors[taste] + (me.taste === taste ? 1 : 0);
}

/** 이 취향 관람객 중 이 작품을 저장한 수 (나 포함) */
export function savesOf(taste: TasteKey, artifactId: string, me: Me): number {
  return (community().saves[taste]?.[artifactId] ?? 0) + (me.taste === taste && iSaved(me, artifactId) ? 1 : 0);
}

/** 모든 취향을 합친 저장 수 (나 포함) */
export function totalSavesOf(artifactId: string, tastes: TasteKey[], me: Me): number {
  return tastes.reduce((n, t) => n + savesOf(t, artifactId, me), 0);
}

export interface Ranked {
  artifact: Artifact;
  count: number;
  total: number;
  withMe: boolean;
}

/** 이 취향 관람객이 많이 저장한 작품. 같으면 관람 동선 순 */
export function favoritesOf(taste: TasteKey, artifacts: Artifact[], me: Me, limit = 3): Ranked[] {
  const total = visitorsOf(taste, me);
  return artifacts
    .map((a, i) => ({ artifact: a, i, count: savesOf(taste, a.id, me), total, withMe: me.taste === taste && iSaved(me, a.id) }))
    .sort((x, y) => y.count - x.count || x.i - y.i)
    .slice(0, limit)
    .map(({ artifact, count, total: t, withMe }) => ({ artifact, count, total: t, withMe }));
}

/** 이 작품을 저장한 관람객의 취향 분포, 많은 순 */
export function tastesOf(artifactId: string, tastes: TasteKey[], me: Me) {
  return tastes
    .map((t) => ({ taste: t, count: savesOf(t, artifactId, me) }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** 라운지 게시물 = 감상평. 예시 게시물과 내 감상평(저장한 작품의 note) */
export interface Post {
  id: string;
  artifactId: string;
  taste: TasteKey;
  nickname: string;
  lens: ScriptKey;
  text: string;
  /** 예시 좋아요 수 (내 좋아요 제외) */
  likes: number;
  mine: boolean;
  date?: string;
}

/** 내 게시물 id */
export const myPostId = (artifactId: string) => `me-${artifactId}`;

function myPosts(me: Me): Post[] {
  return me.saved
    .filter((s) => s.note)
    .sort((a, b) => (b.noteUpdatedAt ?? '').localeCompare(a.noteUpdatedAt ?? ''))
    .map((s) => ({
      id: myPostId(s.id),
      artifactId: s.id,
      taste: s.taste ?? me.taste ?? 'history',
      nickname: '나',
      lens: s.lens,
      text: s.note!,
      likes: 0,
      mine: true,
      date: s.noteUpdatedAt,
    }));
}

/** 라운지 피드: 내 게시물이 먼저, 그다음 예시 게시물. taste 를 주면 그 취향만 */
export function feed(me: Me, taste: TasteKey | null = null): Post[] {
  const samples: Post[] = community().reviews.map((r) => ({ ...r, mine: false }));
  return [...myPosts(me), ...samples].filter((p) => !taste || p.taste === taste);
}

/** 이 작품의 감상평. 내 글이 맨 앞 */
export const reviewsOf = (artifactId: string, me: Me): Post[] => feed(me).filter((p) => p.artifactId === artifactId);

/** 이 취향 관람객의 감상평 */
export const reviewsByTaste = (taste: TasteKey, me: Me): Post[] => feed(me, taste);

export const sampleCommentsOf = (postId: string): SampleComment[] => community().comments.filter((c) => c.postId === postId);
