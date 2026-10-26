import type { LensKey, ScriptKey, TasteKey } from '../content';
import type { LensSeconds } from '../state/Activity';

// 관람 리포트: 테스트로 고른 취향과 실제로 오래 본 해설 관점을 비교한다.

/** 관점 해설을 이만큼(초) 넘게 봐야 ‘실제 관람 취향’을 말한다 */
export const MIN_LENS_SECONDS = 30;

export interface LensShare {
  key: ScriptKey;
  seconds: number;
  /** 0~1, 전체(기본 해설 포함) 대비 */
  share: number;
}

export function lensShares(seconds: LensSeconds, order: ScriptKey[]): LensShare[] {
  const total = order.reduce((n, k) => n + (seconds[k] ?? 0), 0);
  return order
    .map((key) => ({ key, seconds: seconds[key] ?? 0, share: total ? (seconds[key] ?? 0) / total : 0 }))
    .sort((a, b) => b.seconds - a.seconds || order.indexOf(a.key) - order.indexOf(b.key));
}

export type Insight =
  | { kind: 'not_enough'; lensSeconds: number }
  | { kind: 'no_profile'; actual: LensKey; share: number }
  | { kind: 'match'; actual: LensKey; share: number }
  | { kind: 'differ'; actual: LensKey; share: number; expected: LensKey };

/**
 * 관점 해설(기본 해설 제외) 중 가장 오래 본 것을 테스트의 주 렌즈와 비교한다.
 * share 는 관점 해설 시간 중 그 관점의 비율이다.
 */
export function buildInsight(seconds: LensSeconds, lenses: LensKey[], mainLens: LensKey | null): Insight {
  const lensTotal = lenses.reduce((n, k) => n + (seconds[k] ?? 0), 0);
  if (lensTotal < MIN_LENS_SECONDS) return { kind: 'not_enough', lensSeconds: lensTotal };
  const [top] = lensShares(seconds, lenses);
  const actual = top.key as LensKey;
  const share = top.seconds / lensTotal;
  if (!mainLens) return { kind: 'no_profile', actual, share };
  return actual === mainLens ? { kind: 'match', actual, share } : { kind: 'differ', actual, share, expected: mainLens };
}

/** 관점에 대응하는 취향 (music 은 대응 관점이 없다) */
export const tasteOfLens = (lens: LensKey): TasteKey => lens;

export const formatDuration = (sec: number) => {
  if (sec < 60) return `${Math.round(sec)}초`;
  const m = Math.round(sec / 60);
  return m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간 ${m % 60}분`;
};
