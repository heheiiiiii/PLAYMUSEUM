import { Fragment, useEffect, useRef, useState } from 'react';
import type { Script, ScriptKey, Sentence } from '../content';
import { useActivity } from '../state/Activity';
import { audioUrl } from '../media';
import { useSound } from '../state/Sound';
import { LabelChip } from './ui';

// 해설 원고를 문장 단위로 렌더링한다. fact 가 아닌 문장 뒤에는 라벨 칩을 붙인다.
// collect 를 넘기면 문장을 눌러 ‘인상 깊은 문장’으로 모을 수 있다.
export function ScriptView({
  script,
  limit,
  collect,
}: {
  script: Script;
  /** 앞에서부터 이 개수만 보여 준다 */
  limit?: number;
  collect?: { artifactId: string; lens: ScriptKey };
}) {
  const sentences = limit ? script.sentences.slice(0, limit) : script.sentences;
  return (
    <div className={`script ${collect ? 'is-collectible' : ''}`}>
      <p>
        {sentences.map((s) => (
          <Fragment key={s.id}>
            {collect ? (
              <CollectibleSentence sentence={s} artifactId={collect.artifactId} lens={collect.lens} />
            ) : (
              <span className={`sentence s-${s.label}`} data-sentence={s.id}>
                {s.text}
              </span>
            )}
            {s.label !== 'fact' && <LabelChip label={s.label} />}{' '}
          </Fragment>
        ))}
      </p>
    </div>
  );
}

function CollectibleSentence({ sentence: s, artifactId, lens }: { sentence: Sentence; artifactId: string; lens: ScriptKey }) {
  const { isQuoted, toggleQuote } = useActivity();
  const on = isQuoted(s.id);
  const toggle = () => toggleQuote(s.id, artifactId, lens);
  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={on}
      title={on ? '모은 문장에서 빼기' : '인상 깊은 문장으로 모으기'}
      className={`sentence s-${s.label} ${on ? 'is-quoted' : ''}`}
      data-sentence={s.id}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
    >
      {s.text}
    </span>
  );
}

// 해설 음성 파일이 있을 때만 나타난다(명세: 파일이 없으면 버튼을 숨기고 텍스트만).
export function NarrationButton({ file }: { file: string }) {
  const url = audioUrl(file);
  const { duck } = useSound();
  const ref = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<'idle' | 'playing' | 'error'>('idle');

  useEffect(() => {
    setState('idle');
    return () => {
      ref.current?.pause();
      ref.current = null;
      duck(false);
    };
  }, [file, duck]);

  if (!url) return null;

  const toggle = () => {
    if (state === 'playing') {
      ref.current?.pause();
      setState('idle');
      duck(false);
      return;
    }
    const el = ref.current ?? new Audio(url);
    ref.current = el;
    el.onended = () => {
      setState('idle');
      duck(false);
    };
    duck(true);
    el.play()
      .then(() => setState('playing'))
      .catch(() => {
        setState('error');
        duck(false);
      });
  };

  return (
    <button type="button" className="btn btn-quiet btn-small" onClick={toggle} aria-pressed={state === 'playing'}>
      {state === 'playing' ? '음성 해설 멈춤' : state === 'error' ? '음성을 재생하지 못했어요 · 다시 시도' : '음성으로 듣기'}
    </button>
  );
}
