import venueList from '../../content/venues.json';
import type { Artifact, Content, Course, Lens, LensKey, Source, Taste, TasteKey } from './types';

export * from './types';

// 관람지(박물관·미술관)마다 콘텐츠 팩이 하나씩 있다: content/venues/<id>/playmuseum_content.json
// 앱은 한 번에 한 관람지만 보여 주고, selectVenue() 로 바꾼다.
// `content` 와 아래 조회 함수는 늘 지금 고른 관람지를 가리킨다(ES 모듈의 live binding).

export interface Venue {
  id: string;
  name: string;
  kind: 'museum' | 'art';
  city: string;
  status: 'open' | 'soon';
  blurb: string;
}

const packs = import.meta.glob('../../content/venues/*/playmuseum_content.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const packOf = (id: string) => packs[`../../content/venues/${id}/playmuseum_content.json`];

// 콘텐츠 파일이 깨졌을 때 앱이 멈추지 않고 읽을 수 있는 안내를 보이게 하는 최소 검사.
// 전체 스키마 검사는 `npm run validate:content`.
function isContent(value: unknown): value is Content {
  const c = value as Partial<Content> | null;
  return (
    !!c &&
    Array.isArray(c.artifacts) &&
    c.artifacts.length > 0 &&
    Array.isArray(c.courses) &&
    Array.isArray(c.tastes) &&
    Array.isArray(c.lenses) &&
    Array.isArray(c.sources) &&
    !!c.labels &&
    !!c.course_rule
  );
}

/** 목록의 모든 관람지. open 인데 팩이 없거나 깨졌으면 soon 으로 내린다. */
export const venues: Venue[] = (venueList.venues as Venue[]).map((v) =>
  v.status === 'open' && !isContent(packOf(v.id)) ? { ...v, status: 'soon' } : v,
);

export const openVenues = venues.filter((v) => v.status === 'open');
if (openVenues.length === 0) throw new Error('관람할 수 있는 관람지 콘텐츠가 없습니다.');
export const DEFAULT_VENUE = openVenues[0].id;

export const getVenue = (id: string) => venues.find((v) => v.id === id);
export const venueContent = (id: string): Content | undefined => {
  const p = packOf(id);
  return isContent(p) ? p : undefined;
};

const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));

export let venue: Venue = openVenues[0];
export let content: Content = venueContent(venue.id)!;
let artifactMap = byId(content.artifacts);
let courseMap = byId(content.courses);
let sourceMap = byId(content.sources);
let lensMap = new Map(content.lenses.map((l) => [l.key, l]));
let tasteMap = new Map(content.tastes.map((t) => [t.key, t]));

/** 관람지를 바꾼다. 열 수 없는 관람지면 false */
export function selectVenue(id: string): boolean {
  const v = getVenue(id);
  const c = v?.status === 'open' ? venueContent(id) : undefined;
  if (!v || !c) return false;
  venue = v;
  content = c;
  artifactMap = byId(c.artifacts);
  courseMap = byId(c.courses);
  sourceMap = byId(c.sources);
  lensMap = new Map(c.lenses.map((l) => [l.key, l]));
  tasteMap = new Map(c.tastes.map((t) => [t.key, t]));
  return true;
}

export const getArtifact = (id: string): Artifact | undefined => artifactMap.get(id);
export const getCourse = (id: string): Course | undefined => courseMap.get(id);
export const getSource = (id: string): Source | undefined => sourceMap.get(id);
export const getLens = (key: LensKey): Lens | undefined => lensMap.get(key);
export const getTaste = (key: TasteKey): Taste | undefined => tasteMap.get(key);
export const lensName = (key: LensKey) => lensMap.get(key)?.name ?? key;
export const venueKindName = (v: Venue) => (v.kind === 'art' ? '미술관' : '박물관');
