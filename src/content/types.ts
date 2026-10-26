// Types for content/playmuseum_content.json (schema_version 1.0).
// The JSON is owned by the content team; keep these in step with the schema.

export type LensKey = 'history' | 'people' | 'craft' | 'mystery' | 'daily';
export type ScriptKey = 'base' | LensKey;
export type TasteKey = LensKey | 'music';
export type SentenceLabel = 'fact' | 'interpretation' | 'conjecture' | 'legend';

export interface Sentence {
  id: string;
  label: SentenceLabel;
  text: string;
}

export interface Script {
  text: string;
  chars: number;
  est_seconds: number;
  audio: string;
  sentences: Sentence[];
}

export interface Sound {
  file: string;
  loop_sec: number;
  tag: string;
  mood: string[];
  concept: string;
  materials: string[];
  credit: string;
}

export interface Artifact {
  id: string;
  type: 'object' | 'painting';
  name: string;
  album: string | null;
  era: string;
  material: string;
  designation: string;
  location: { floor: number; room: string };
  on_view: boolean | null;
  strong_lenses: LensKey[];
  image: { file: string; credit: string; license: string };
  base: Script;
  lenses: Record<LensKey, Script>;
  sound: Sound;
  sources: string[];
}

export interface Taste {
  key: TasteKey;
  label: string;
  maps_to: { lens: LensKey; sound_default?: boolean; course?: string };
}

export interface Lens {
  key: LensKey;
  name: string;
  question: string;
}

export interface Course {
  id: string;
  name: string;
  lens: LensKey | null;
  taste: TasteKey | null;
  sound_default: boolean;
  minutes: number;
  minutes_estimated: boolean;
  artifacts: string[];
  notice: string | null;
}

export interface CourseRule {
  short_threshold_min: number;
  short_course: string;
  default_long_course: string;
  music_course: string;
  skip_when_on_view_false: boolean;
  note?: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  checked: 'full' | 'summary';
}

export interface Content {
  meta: {
    schema_version: string;
    project?: string;
    exhibition?: string;
    updated: string;
    notes?: string[];
  };
  labels: Record<SentenceLabel, { name: string; voice_cue: string }>;
  tastes: Taste[];
  lenses: Lens[];
  artifacts: Artifact[];
  courses: Course[];
  course_rule: CourseRule;
  sources: Source[];
}
