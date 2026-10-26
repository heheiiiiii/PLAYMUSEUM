import { content, getTaste, lensName } from '../content';
import type { CoursePick } from '../logic/courses';
import type { Profile } from '../logic/scoring';
import { formatMinutes } from '../components/ui';

// 추천 코스가 왜 골라졌는지 설명하는 문장. 규칙(course_rule)의 분기와 1:1로 대응한다.
export function courseReasonText(pick: CoursePick, profile: Profile | null, minutes: number): string {
  const r = content.course_rule;
  switch (pick.reason) {
    case 'music':
      return `1순위 취향(${getTaste('music')?.label})에 맞춰 사운드와 함께 보는 코스를 골랐어요.`;
    case 'short':
      return `관람 시간을 ${formatMinutes(minutes)}으로 고르셨어요. ${r.short_threshold_min}분보다 짧으면 핵심 유물만 보는 코스를 추천해요.`;
    case 'theme':
      return `가장 끌리는 관점인 ‘${lensName(pick.course.lens!)}’ 이야기가 담긴 유물로 엮은 코스예요.`;
    case 'fallback':
      return profile
        ? `‘${lensName(profile.mainLens)}’ 관점에 맞춘 테마 코스가 없어 전체 코스를 골랐어요.`
        : '취향 테스트 전이라 전체 코스를 보여 드려요. 테스트를 하면 맞춤 코스를 골라 드려요.';
  }
}
