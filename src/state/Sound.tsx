import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { content, type Artifact } from '../content';
import { audioUrl } from '../media';
import { DEMO_SOUND_WHEN_MISSING } from '../config';

// 유물별 배경 사운드. 앱 전체에서 하나만 재생되며, 렌즈를 바꾸거나 화면을 옮겨도 끊기지 않는다.
// - 실제 음원(sound.file)이 있으면 그 파일을 반복 재생한다.
// - 없으면 DEMO_SOUND_WHEN_MISSING 설정에 따라 브라우저에서 만든 임시 합성음을 낸다.
// - 자동 재생은 하지 않는다. 이용자가 누른 재생 버튼에서만 시작한다.

export type SoundSource = 'file' | 'demo' | 'none';
export type SoundStatus = 'stopped' | 'loading' | 'playing' | 'error';

interface SoundState {
  artifactId: string | null;
  status: SoundStatus;
  source: SoundSource;
  message: string | null;
}

interface SoundApi extends SoundState {
  sourceFor: (a: Artifact) => SoundSource;
  play: (a: Artifact) => void;
  stop: () => void;
  /** 해설 음성이 나오는 동안 사운드를 낮춘다 */
  duck: (on: boolean) => void;
}

const Ctx = createContext<SoundApi | null>(null);

const FILE_VOLUME = 0.7;
const DEMO_VOLUME = 0.1;
const DUCK_RATIO = 0.3;
const FADE_IN = 2.5;
const FADE_OUT = 0.6;

// 임시 합성음의 음높이. 유물마다 다르게 들리도록 배열 순서로 고른다(콘텐츠 의미와는 무관).
const ROOTS = [110, 123.47, 130.81, 146.83, 164.81, 98, 87.31, 116.54];

interface DemoVoice {
  ctx: AudioContext;
  master: GainNode;
  nodes: AudioScheduledSourceNode[];
}

function sourceFor(a: Artifact): SoundSource {
  if (audioUrl(a.sound.file)) return 'file';
  return DEMO_SOUND_WHEN_MISSING ? 'demo' : 'none';
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SoundState>({ artifactId: null, status: 'stopped', source: 'none', message: null });
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const fadeTimer = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const demo = useRef<DemoVoice | null>(null);
  const ducked = useRef(false);

  const clearFade = () => {
    if (fadeTimer.current != null) window.clearInterval(fadeTimer.current);
    fadeTimer.current = null;
  };

  const fadeElement = (el: HTMLAudioElement, to: number, seconds: number, done?: () => void) => {
    clearFade();
    const from = el.volume;
    const steps = Math.max(1, Math.round(seconds * 20));
    let i = 0;
    fadeTimer.current = window.setInterval(() => {
      i += 1;
      el.volume = Math.min(1, Math.max(0, from + ((to - from) * i) / steps));
      if (i >= steps) {
        clearFade();
        done?.();
      }
    }, 50);
  };

  const stopDemo = (immediate = false) => {
    const v = demo.current;
    demo.current = null;
    if (!v) return;
    const t = v.ctx.currentTime;
    v.master.gain.cancelScheduledValues(t);
    v.master.gain.setValueAtTime(v.master.gain.value, t);
    v.master.gain.linearRampToValueAtTime(0, t + (immediate ? 0.05 : FADE_OUT));
    const end = t + (immediate ? 0.06 : FADE_OUT + 0.05);
    v.nodes.forEach((n) => {
      try {
        n.stop(end);
      } catch {
        /* 이미 멈춤 */
      }
    });
  };

  const stopFile = () => {
    const el = audioEl.current;
    if (!el) return;
    fadeElement(el, 0, FADE_OUT, () => el.pause());
  };

  const startDemo = (a: Artifact) => {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) throw new Error('이 브라우저는 소리 합성을 지원하지 않습니다.');
    const ctx = ctxRef.current ?? new AC();
    ctxRef.current = ctx;
    void ctx.resume();

    const index = Math.max(0, content.artifacts.findIndex((x) => x.id === a.id));
    const root = ROOTS[index % ROOTS.length];
    const master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(master);
    master.connect(ctx.destination);

    const nodes: AudioScheduledSourceNode[] = [];
    const partials: [number, OscillatorType, number][] = [
      [1, 'sine', 0.55],
      [1.5, 'sine', 0.25],
      [2, 'triangle', 0.08],
      [3, 'sine', 0.04],
    ];
    for (const [ratio, type, level] of partials) {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = root * ratio;
      osc.detune.value = (ratio - 1) * 3;
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(filter);
      osc.start();
      nodes.push(osc);
    }
    // 숨 쉬듯 천천히 커졌다 작아지는 움직임
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 250;
    lfo.connect(lfoDepth).connect(filter.frequency);
    lfo.start();
    nodes.push(lfo);

    const target = DEMO_VOLUME * (ducked.current ? DUCK_RATIO : 1);
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(target, ctx.currentTime + FADE_IN);
    demo.current = { ctx, master, nodes };
  };

  const startFile = (a: Artifact, url: string) => {
    const el = audioEl.current ?? new Audio();
    audioEl.current = el;
    el.loop = true;
    if (!el.src.endsWith(url)) el.src = url;
    el.volume = 0;
    el.onerror = () =>
      setState((s) => ({ ...s, status: 'error', message: '음원을 불러오지 못했습니다. 파일이 있는지 확인해 주세요.' }));
    setState({ artifactId: a.id, status: 'loading', source: 'file', message: null });
    el.play()
      .then(() => {
        setState({ artifactId: a.id, status: 'playing', source: 'file', message: null });
        fadeElement(el, FILE_VOLUME * (ducked.current ? DUCK_RATIO : 1), FADE_IN);
      })
      .catch(() =>
        setState({
          artifactId: a.id,
          status: 'error',
          source: 'file',
          message: '브라우저가 재생을 막았습니다. 재생 버튼을 다시 눌러 주세요.',
        }),
      );
  };

  const play = useCallback((a: Artifact) => {
    const src = sourceFor(a);
    stopDemo(true);
    if (src === 'none') {
      setState({ artifactId: a.id, status: 'error', source: 'none', message: '이 유물의 음원은 아직 준비 중입니다.' });
      return;
    }
    if (src === 'file') {
      startFile(a, audioUrl(a.sound.file)!);
      return;
    }
    audioEl.current?.pause();
    try {
      startDemo(a);
      setState({ artifactId: a.id, status: 'playing', source: 'demo', message: null });
    } catch (e) {
      setState({
        artifactId: a.id,
        status: 'error',
        source: 'demo',
        message: e instanceof Error ? e.message : '소리를 재생하지 못했습니다.',
      });
    }
  }, []);

  const stop = useCallback(() => {
    stopDemo();
    stopFile();
    setState((s) => ({ ...s, status: 'stopped', message: null }));
  }, []);

  const duck = useCallback((on: boolean) => {
    ducked.current = on;
    const ratio = on ? DUCK_RATIO : 1;
    const v = demo.current;
    if (v) {
      const t = v.ctx.currentTime;
      v.master.gain.cancelScheduledValues(t);
      v.master.gain.setValueAtTime(v.master.gain.value, t);
      v.master.gain.linearRampToValueAtTime(DEMO_VOLUME * ratio, t + 0.4);
    }
    const el = audioEl.current;
    if (el && !el.paused) fadeElement(el, FILE_VOLUME * ratio, 0.4);
  }, []);

  useEffect(
    () => () => {
      clearFade();
      stopDemo(true);
      audioEl.current?.pause();
      void ctxRef.current?.close();
    },
    [],
  );

  return <Ctx.Provider value={{ ...state, sourceFor, play, stop, duck }}>{children}</Ctx.Provider>;
}

export function useSound() {
  const v = useContext(Ctx);
  if (!v) throw new Error('SoundProvider missing');
  return v;
}
