// 시연 동작 설정

/** 관람 시간 선택지(분). 40분 미만은 course_rule.short_course 로 간다. */
export const TIME_OPTIONS = [30, 45, 60, 90] as const;
export const DEFAULT_MINUTES = 60;

/**
 * 사운드 파일이 아직 없을 때 브라우저에서 만든 임시 합성음으로 재생 기능을 시연한다.
 * false 로 두면 콘텐츠 명세대로 사운드 버튼을 비활성화하고 sound.concept 문구만 보여 준다.
 */
export const DEMO_SOUND_WHEN_MISSING = true;
