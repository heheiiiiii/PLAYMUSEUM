import raw from '../../content/playmuseum_content.json';
import type { Artifact, Content, Course, Lens, LensKey, Source, Taste, TasteKey } from './types';

export * from './types';

// A light shape check at load time. The full schema check runs with
// `npm run validate:content`; this only guards the app against a JSON file
// that is clearly broken so it can show a readable message instead of crashing.
function assertContent(value: unknown): asserts value is Content {
  const c = value as Partial<Content> | null;
  const ok =
    !!c &&
    Array.isArray(c.artifacts) &&
    c.artifacts.length > 0 &&
    Array.isArray(c.courses) &&
    Array.isArray(c.tastes) &&
    Array.isArray(c.lenses) &&
    Array.isArray(c.sources) &&
    !!c.labels &&
    !!c.course_rule;
  if (!ok) throw new Error('콘텐츠 파일 형식이 올바르지 않습니다.');
}

assertContent(raw);
export const content: Content = raw;

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));
const artifactMap = byId(content.artifacts);
const courseMap = byId(content.courses);
const sourceMap = byId(content.sources);
const lensMap = new Map(content.lenses.map((l) => [l.key, l]));
const tasteMap = new Map(content.tastes.map((t) => [t.key, t]));

export const getArtifact = (id: string): Artifact | undefined => artifactMap.get(id);
export const getCourse = (id: string): Course | undefined => courseMap.get(id);
export const getSource = (id: string): Source | undefined => sourceMap.get(id);
export const getLens = (key: LensKey): Lens | undefined => lensMap.get(key);
export const getTaste = (key: TasteKey): Taste | undefined => tasteMap.get(key);
export const lensName = (key: LensKey) => lensMap.get(key)?.name ?? key;
