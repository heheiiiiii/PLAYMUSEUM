import { useEffect, useState } from 'react';

// 해시 기반 라우터. 정적 호스팅에서 서버 설정 없이 새로고침과 공유가 된다.
// 경로 예: #/artifact/A01?course=C03

export interface Route {
  parts: string[];
  query: URLSearchParams;
}

function parse(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const [path, qs = ''] = clean.split('?');
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs) };
}

const listeners = new Set<(r: Route) => void>();
let current = parse(typeof window === 'undefined' ? '' : window.location.hash);

function emit(next: Route) {
  current = next;
  listeners.forEach((l) => l(next));
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => emit(parse(window.location.hash)));
}

export function navigate(to: string) {
  const hash = `#${to.startsWith('/') ? to : `/${to}`}`;
  try {
    if (window.location.hash !== hash) window.location.hash = hash;
  } catch {
    /* 해시를 바꿀 수 없는 환경에서도 화면은 이동한다 */
  }
  emit(parse(hash));
  window.scrollTo({ top: 0 });
}

export function useRoute(): Route {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    listeners.add(setRoute);
    return () => void listeners.delete(setRoute);
  }, []);
  return route;
}

export const href = (to: string) => `#${to}`;
