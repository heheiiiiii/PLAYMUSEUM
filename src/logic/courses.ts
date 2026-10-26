import type { Artifact, Content, Course, LensKey, TasteKey } from '../content';

export type CourseReason = 'music' | 'short' | 'theme' | 'fallback';

export interface CoursePick {
  course: Course;
  reason: CourseReason;
}

/** 콘텐츠 데이터 명세의 pickCourse 규칙 */
export function pickCourse(
  data: Content,
  mainLens: LensKey | null,
  topTaste: TasteKey | null,
  availableMin: number,
): CoursePick {
  const r = data.course_rule;
  const byId = (id: string) => data.courses.find((c) => c.id === id)!;
  if (topTaste === 'music') return { course: byId(r.music_course), reason: 'music' };
  if (availableMin < r.short_threshold_min) return { course: byId(r.short_course), reason: 'short' };
  const theme = mainLens ? data.courses.find((c) => c.lens === mainLens && c.taste === null) : undefined;
  return theme ? { course: theme, reason: 'theme' } : { course: byId(r.default_long_course), reason: 'fallback' };
}

/** 전시하지 않는 레코드(on_view === false)를 뺀 코스 정류장 */
export function visibleStops(data: Content, course: Course): Artifact[] {
  return course.artifacts
    .map((id) => data.artifacts.find((a) => a.id === id))
    .filter((a): a is Artifact => !!a)
    .filter((a) => !(data.course_rule.skip_when_on_view_false && a.on_view === false));
}

/** 빠진 레코드 수에 비례해 줄인 예상 시간 (반올림) */
export function courseMinutes(data: Content, course: Course): number {
  const total = course.artifacts.length;
  if (!total) return 0;
  return Math.round((course.minutes * visibleStops(data, course).length) / total);
}

/**
 * 유물과 취향의 관련도. strong_lenses 에 주 렌즈가 있으면 2점, 보조 렌즈가 있으면 1점.
 * 목록 정렬과 추천 배지에 쓴다.
 */
export function relevance(artifact: Artifact, mainLens: LensKey | null, secondaryLens: LensKey | null): number {
  let score = 0;
  if (mainLens && artifact.strong_lenses.includes(mainLens)) score += 2;
  if (secondaryLens && artifact.strong_lenses.includes(secondaryLens)) score += 1;
  return score;
}

/** 관련도 높은 순, 같으면 관람 동선(배열) 순 */
export function sortByRelevance(list: Artifact[], mainLens: LensKey | null, secondaryLens: LensKey | null) {
  return list
    .map((a, i) => ({ a, i, r: relevance(a, mainLens, secondaryLens) }))
    .sort((x, y) => y.r - x.r || x.i - y.i)
    .map((x) => x.a);
}
