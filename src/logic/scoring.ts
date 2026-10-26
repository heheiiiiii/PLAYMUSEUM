import type { LensKey, Taste, TasteKey } from '../content';
import type { QuizQuestion } from '../data/quiz';

export type Answers = Record<string, string>; // questionId -> optionId

export interface TasteScore {
  key: TasteKey;
  score: number;
  /** 이 취향에 점수를 준 질문 수 */
  picks: number;
  /** 이 취향에 점수를 준 마지막 질문의 순번(없으면 -1) */
  lastQuestion: number;
}

export interface Profile {
  ranked: TasteScore[];
  primary: TasteKey;
  /** 2순위 취향. 모든 답이 한 취향에 몰리면 null */
  secondary: TasteKey | null;
  mainLens: LensKey;
  /** 주 렌즈와 다른 렌즈 중 가장 점수가 높은 것 */
  secondaryLens: LensKey | null;
  soundDefault: boolean;
  /** 1위와 2위가 같은 점수였는지 */
  tie: boolean;
}

export const isComplete = (quiz: QuizQuestion[], answers: Answers) =>
  quiz.every((q) => q.options.some((o) => o.id === answers[q.id]));

export function scoreAnswers(quiz: QuizQuestion[], tastes: Taste[], answers: Answers): TasteScore[] {
  const scores = new Map<TasteKey, TasteScore>(
    tastes.map((t) => [t.key, { key: t.key, score: 0, picks: 0, lastQuestion: -1 }]),
  );
  quiz.forEach((q, qi) => {
    const option = q.options.find((o) => o.id === answers[q.id]);
    if (!option) return;
    for (const [key, pts] of Object.entries(option.points) as [TasteKey, number][]) {
      const s = scores.get(key);
      if (!s || !pts) continue;
      s.score += pts;
      s.picks += 1;
      s.lastQuestion = qi;
    }
  });
  return [...scores.values()];
}

/**
 * 동점 처리 규칙
 * 1. 점수가 높은 순
 * 2. 점수를 준 질문 수가 많은 순 (여러 번 고른 취향이 앞)
 * 3. 더 뒤쪽 질문에서 고른 순 (마지막 질문 "하나만 고른다면"이 결정)
 * 4. content.tastes 배열 순서
 */
export function rankScores(scores: TasteScore[], tastes: Taste[]): TasteScore[] {
  const order = new Map(tastes.map((t, i) => [t.key, i]));
  return [...scores].sort(
    (a, b) =>
      b.score - a.score ||
      b.picks - a.picks ||
      b.lastQuestion - a.lastQuestion ||
      (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0),
  );
}

export function buildProfile(quiz: QuizQuestion[], tastes: Taste[], answers: Answers): Profile | null {
  if (!isComplete(quiz, answers)) return null;
  const ranked = rankScores(scoreAnswers(quiz, tastes, answers), tastes);
  const lensOf = (k: TasteKey) => tastes.find((t) => t.key === k)!.maps_to.lens;
  const [first, second] = ranked;
  const mainLens = lensOf(first.key);
  const secondaryLens =
    ranked.slice(1).find((s) => s.score > 0 && lensOf(s.key) !== mainLens)?.key ?? null;
  return {
    ranked,
    primary: first.key,
    secondary: second && second.score > 0 ? second.key : null,
    mainLens,
    secondaryLens: secondaryLens ? lensOf(secondaryLens) : null,
    soundDefault: !!tastes.find((t) => t.key === first.key)!.maps_to.sound_default,
    tie: !!second && second.score === first.score,
  };
}
