import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { content, type ScriptKey } from '../content';
import { readJSON, writeJSON } from '../logic/storage';

// 관람 행동 기록: 해설 관점별로 머문 시간, 둘러본 유물, 모은 문장.
// 모두 이 브라우저에만 저장되며 관람 리포트와 공유 카드에 쓰인다.

export interface Quote {
  /** 문장 id (예: A01.mystery.3) */
  id: string;
  artifactId: string;
  lens: ScriptKey;
  savedAt: string;
}

export type LensSeconds = Partial<Record<ScriptKey, number>>;

interface ActivityState {
  lensSeconds: LensSeconds;
  viewed: string[];
  quotes: Quote[];
  isQuoted: (sentenceId: string) => boolean;
  toggleQuote: (sentenceId: string, artifactId: string, lens: ScriptKey) => boolean;
  removeQuote: (sentenceId: string) => void;
  markViewed: (artifactId: string) => void;
  /** 이 관점에 1초를 더한다(저장은 모아서) */
  tick: (lens: ScriptKey) => void;
  flush: () => void;
}

const Ctx = createContext<ActivityState | null>(null);

const isSeconds = (v: unknown): v is LensSeconds =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((x) => typeof x === 'number' && x >= 0);
const isIdList = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const isQuotes = (v: unknown): v is Quote[] =>
  Array.isArray(v) && v.every((x) => x && typeof x.id === 'string' && typeof x.artifactId === 'string');

const knownArtifact = (id: string) => content.artifacts.some((a) => a.id === id);

/** 화면이 보이는 동안 1초마다 세고, 5초마다 저장한다. */
const FLUSH_MS = 5000;

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [lensSeconds, setLensSeconds] = useState<LensSeconds>(() => readJSON('lensSeconds', {}, isSeconds));
  const [viewed, setViewed] = useState<string[]>(() => readJSON('viewed', [], isIdList).filter(knownArtifact));
  const [quotes, setQuotes] = useState<Quote[]>(() => readJSON('quotes', [], isQuotes).filter((q) => knownArtifact(q.artifactId)));

  const pending = useRef<LensSeconds>({});

  const flush = useCallback(() => {
    const add = pending.current;
    if (!Object.keys(add).length) return;
    pending.current = {};
    setLensSeconds((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(add) as [ScriptKey, number][]) next[k] = (next[k] ?? 0) + v;
      writeJSON('lensSeconds', next);
      return next;
    });
  }, []);

  const markViewed = useCallback((artifactId: string) => {
    setViewed((prev) => {
      if (prev.includes(artifactId)) return prev;
      const next = [...prev, artifactId];
      writeJSON('viewed', next);
      return next;
    });
  }, []);

  const tick = useCallback((lens: ScriptKey) => {
    pending.current[lens] = (pending.current[lens] ?? 0) + 1;
  }, []);

  const toggleQuote = useCallback((id: string, artifactId: string, lens: ScriptKey) => {
    let added = false;
    setQuotes((prev) => {
      const exists = prev.some((q) => q.id === id);
      added = !exists;
      const next = exists ? prev.filter((q) => q.id !== id) : [{ id, artifactId, lens, savedAt: new Date().toISOString() }, ...prev];
      writeJSON('quotes', next);
      return next;
    });
    return added;
  }, []);

  const removeQuote = useCallback((id: string) => {
    setQuotes((prev) => {
      const next = prev.filter((q) => q.id !== id);
      writeJSON('quotes', next);
      return next;
    });
  }, []);

  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [flush]);

  const value: ActivityState = {
    lensSeconds,
    viewed,
    quotes,
    isQuoted: (id) => quotes.some((q) => q.id === id),
    toggleQuote,
    removeQuote,
    markViewed,
    tick,
    flush,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActivity() {
  const v = useContext(Ctx);
  if (!v) throw new Error('ActivityProvider missing');
  return v;
}

/** 화면에 보이는 해설을 기록한다. 유물 화면에서 보고 있는 해설이 바뀔 때마다 다시 시작한다. */
export function useDwell(artifactId: string, lens: ScriptKey) {
  const { markViewed, tick, flush } = useActivity();
  useEffect(() => {
    markViewed(artifactId);
    const counter = window.setInterval(() => {
      if (document.visibilityState === 'visible') tick(lens);
    }, 1000);
    const saver = window.setInterval(flush, FLUSH_MS);
    return () => {
      window.clearInterval(counter);
      window.clearInterval(saver);
      flush();
    };
  }, [artifactId, lens, markViewed, tick, flush]);
}
