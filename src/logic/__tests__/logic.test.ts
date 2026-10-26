import { describe, expect, it } from 'vitest';
import { content } from '../../content';
import { quiz } from '../../data/quiz';
import { buildProfile, isComplete, rankScores, scoreAnswers, type Answers } from '../scoring';
import { courseMinutes, pickCourse, sortByRelevance, visibleStops } from '../courses';

// 각 질문에서 특정 취향 쪽 선택지를 고른 답안
const pick = (...keys: string[]): Answers =>
  Object.fromEntries(
    quiz.map((q, i) => {
      const key = keys[i] ?? keys[keys.length - 1];
      const option = q.options.find((o) => Object.keys(o.points).length === 1 && key in o.points)!;
      return [q.id, option.id];
    }),
  );

describe('quiz data', () => {
  it('every option points only to known tastes', () => {
    const keys = new Set(content.tastes.map((t) => t.key));
    for (const q of quiz) for (const o of q.options) for (const k of Object.keys(o.points)) expect(keys.has(k as never)).toBe(true);
  });
  it('every taste can be reached', () => {
    for (const t of content.tastes) expect(quiz.some((q) => q.options.some((o) => t.key in o.points))).toBe(true);
  });
});

describe('scoring', () => {
  it('returns null until every question is answered', () => {
    const a = pick('mystery');
    delete a[quiz[2].id];
    expect(isComplete(quiz, a)).toBe(false);
    expect(buildProfile(quiz, content.tastes, a)).toBeNull();
  });

  it('ranks the most chosen taste first and the next as secondary', () => {
    const p = buildProfile(quiz, content.tastes, pick('mystery', 'mystery', 'mystery', 'people', 'people'))!;
    expect(p.primary).toBe('mystery');
    expect(p.secondary).toBe('people');
    expect(p.mainLens).toBe('mystery');
    expect(p.secondaryLens).toBe('people');
    expect(p.tie).toBe(false);
  });

  it('recomputes when an answer changes', () => {
    const a = pick('history', 'history', 'history', 'craft', 'craft');
    expect(buildProfile(quiz, content.tastes, a)!.primary).toBe('history');
    const changed = { ...a, ...pick('craft', 'craft', 'craft', 'craft', 'craft') };
    expect(buildProfile(quiz, content.tastes, changed)!.primary).toBe('craft');
  });

  it('breaks ties by the later question', () => {
    // daily 2문항, people 2문항, history 1문항 → daily 와 people 동점. 마지막에 고른 people 이 앞선다.
    const p = buildProfile(quiz, content.tastes, pick('daily', 'daily', 'history', 'people', 'people'))!;
    expect(p.tie).toBe(true);
    expect(p.primary).toBe('people');
    expect(p.secondary).toBe('daily');
  });

  it('breaks ties by pick count before question order', () => {
    const scores = scoreAnswers(quiz, content.tastes, pick('people', 'people', 'history', 'history', 'history'));
    const ranked = rankScores(scores, content.tastes);
    expect(ranked[0].key).toBe('history');
  });

  it('music maps to the craft lens with sound on and skips craft as secondary lens', () => {
    const p = buildProfile(quiz, content.tastes, pick('music', 'craft', 'craft', 'daily', 'music'))!;
    expect(p.primary).toBe('music');
    expect(p.mainLens).toBe('craft');
    expect(p.soundDefault).toBe(true);
    expect(p.secondary).toBe('craft');
    expect(p.secondaryLens).toBe('daily');
  });

  it('has no secondary when every answer points one way', () => {
    const p = buildProfile(quiz, content.tastes, pick('history'))!;
    expect(p.secondary).toBeNull();
    expect(p.secondaryLens).toBeNull();
  });
});

describe('course rule', () => {
  it('music taste always gets the music course', () => {
    expect(pickCourse(content, 'craft', 'music', 30).course.id).toBe('C08');
  });
  it('short visits get the highlight course', () => {
    expect(pickCourse(content, 'mystery', 'mystery', 30)).toMatchObject({ reason: 'short', course: { id: 'C01' } });
  });
  it('longer visits get the theme course of the main lens', () => {
    expect(pickCourse(content, 'mystery', 'mystery', 60).course.id).toBe('C03');
    expect(pickCourse(content, 'history', 'history', 45).course.id).toBe('C06');
    expect(pickCourse(content, 'daily', 'daily', 90).course.id).toBe('C07');
  });
  it('falls back to the full course without a lens', () => {
    expect(pickCourse(content, null, null, 60)).toMatchObject({ reason: 'fallback', course: { id: 'C02' } });
  });
  it('drops on_view:false records and scales minutes', () => {
    const data = structuredClone(content);
    data.artifacts.find((a) => a.id === 'A02')!.on_view = false;
    const c = data.courses.find((x) => x.id === 'C03')!; // 6점, 55분
    expect(visibleStops(data, c).map((a) => a.id)).not.toContain('A02');
    expect(courseMinutes(data, c)).toBe(Math.round((55 * 5) / 6));
    // null(확인 전)은 시연에서 포함
    expect(visibleStops(content, c)).toHaveLength(6);
  });
  it('sorts artifacts by lens relevance and keeps route order on ties', () => {
    const sorted = sortByRelevance(content.artifacts, 'craft', 'daily').map((a) => a.id);
    expect(sorted.slice(0, 2)).toEqual(['A06', 'A04']); // craft+daily
    expect(sorted.at(-1)).toBe('A02');
  });
});
