import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { content, type ScriptKey, type TasteKey } from '../content';
import { quiz } from '../data/quiz';
import { DEFAULT_MINUTES } from '../config';
import { buildProfile, type Answers, type Profile } from '../logic/scoring';
import { pickCourse, type CoursePick } from '../logic/courses';
import { clearAll, readJSON, writeJSON } from '../logic/storage';

export interface SavedItem {
  id: string;
  savedAt: string;
  /** 저장할 때 보고 있던 해설 */
  lens: ScriptKey;
  /** 저장할 때의 1순위 취향 */
  taste: TasteKey | null;
}

interface AppState {
  answers: Answers;
  setAnswer: (questionId: string, optionId: string) => void;
  resetAnswers: () => void;
  profile: Profile | null;
  minutes: number;
  setMinutes: (m: number) => void;
  recommended: CoursePick;
  chosenCourseId: string | null;
  chooseCourse: (id: string | null) => void;
  saved: SavedItem[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string, lens: ScriptKey) => void;
  removeSaved: (id: string) => void;
  /** 마지막 저장이 실패했으면 false (사생활 보호 모드 등) */
  storageOk: boolean;
  resetAll: () => void;
}

const Ctx = createContext<AppState | null>(null);

const isRecord = (v: unknown): v is Answers =>
  !!v && typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((x) => typeof x === 'string');
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0;
const isStringOrNull = (v: unknown): v is string | null => v === null || typeof v === 'string';
const isSavedList = (v: unknown): v is SavedItem[] =>
  Array.isArray(v) && v.every((x) => x && typeof x.id === 'string' && typeof x.savedAt === 'string');

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>(() => readJSON('answers', {}, isRecord));
  const [minutes, setMinutesState] = useState<number>(() => readJSON('minutes', DEFAULT_MINUTES, isNumber));
  const [chosenCourseId, setChosen] = useState<string | null>(() => {
    const id = readJSON('course', null, isStringOrNull);
    return id && content.courses.some((c) => c.id === id) ? id : null;
  });
  const [saved, setSaved] = useState<SavedItem[]>(() =>
    readJSON('saved', [], isSavedList).filter((s) => content.artifacts.some((a) => a.id === s.id)),
  );
  const [storageOk, setStorageOk] = useState(true);

  const persist = useCallback((key: string, value: unknown) => setStorageOk(writeJSON(key, value)), []);

  const setAnswer = useCallback(
    (qid: string, oid: string) =>
      setAnswers((prev) => {
        const next = { ...prev, [qid]: oid };
        persist('answers', next);
        return next;
      }),
    [persist],
  );

  const resetAnswers = useCallback(() => {
    setAnswers({});
    setChosen(null);
    persist('answers', {});
    persist('course', null);
  }, [persist]);

  const setMinutes = useCallback(
    (m: number) => {
      setMinutesState(m);
      setChosen(null);
      persist('minutes', m);
      persist('course', null);
    },
    [persist],
  );

  const chooseCourse = useCallback(
    (id: string | null) => {
      setChosen(id);
      persist('course', id);
    },
    [persist],
  );

  const profile = useMemo(() => buildProfile(quiz, content.tastes, answers), [answers]);
  const recommended = useMemo(
    () => pickCourse(content, profile?.mainLens ?? null, profile?.primary ?? null, minutes),
    [profile, minutes],
  );

  const updateSaved = useCallback(
    (fn: (prev: SavedItem[]) => SavedItem[]) =>
      setSaved((prev) => {
        const next = fn(prev);
        persist('saved', next);
        return next;
      }),
    [persist],
  );

  const toggleSaved = useCallback(
    (id: string, lens: ScriptKey) =>
      updateSaved((prev) =>
        prev.some((s) => s.id === id)
          ? prev.filter((s) => s.id !== id)
          : [{ id, lens, taste: profile?.primary ?? null, savedAt: new Date().toISOString() }, ...prev],
      ),
    [updateSaved, profile],
  );

  const removeSaved = useCallback((id: string) => updateSaved((prev) => prev.filter((s) => s.id !== id)), [updateSaved]);

  const resetAll = useCallback(() => {
    clearAll();
    setAnswers({});
    setChosen(null);
    setSaved([]);
    setMinutesState(DEFAULT_MINUTES);
  }, []);

  const value: AppState = {
    answers,
    setAnswer,
    resetAnswers,
    profile,
    minutes,
    setMinutes,
    recommended,
    chosenCourseId,
    chooseCourse,
    saved,
    isSaved: (id) => saved.some((s) => s.id === id),
    toggleSaved,
    removeSaved,
    storageOk,
    resetAll,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('AppStateProvider missing');
  return v;
}
