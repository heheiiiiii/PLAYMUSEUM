// localStorage 래퍼. 저장소를 쓸 수 없거나 값이 깨져 있어도 앱은 기본값으로 계속 동작한다.

const PREFIX = 'playmuseum:v1:';

export function readJSON<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/** 저장에 성공하면 true */
export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function clearAll() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* 저장소를 쓸 수 없으면 지울 것도 없다 */
  }
}

// 관람지마다 따로 두는 기록(저장한 작품, 모은 문장 등)은 `<key>@<관람지 id>` 로 저장한다.
// 여러 관람지를 지원하기 전의 기록(접미사 없음)은 첫 관람지(국립중앙박물관) 것으로 읽는다.
const LEGACY_VENUE = 'nmk';

function hasKey(key: string) {
  try {
    return window.localStorage.getItem(PREFIX + key) != null;
  } catch {
    return false;
  }
}

export function readScoped<T>(key: string, venueId: string, fallback: T, isValid: (v: unknown) => v is T): T {
  const scoped = `${key}@${venueId}`;
  if (hasKey(scoped)) return readJSON(scoped, fallback, isValid);
  return venueId === LEGACY_VENUE ? readJSON(key, fallback, isValid) : fallback;
}

export const writeScoped = (key: string, venueId: string, value: unknown) => writeJSON(`${key}@${venueId}`, value);
