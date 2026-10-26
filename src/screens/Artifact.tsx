import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
  content,
  getArtifact,
  getCourse,
  getSource,
  lensName,
  type Artifact as ArtifactT,
  type LensKey,
} from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { visibleStops } from '../logic/courses';
import { href } from '../router';
import { useApp } from '../state/AppState';
import { useSound } from '../state/Sound';
import { ArtifactImage } from '../components/ArtifactImage';
import { NarrationButton, ScriptView } from '../components/ScriptView';
import { SoundPlayer } from '../components/SoundPlayer';
import { floorRoom, formatSeconds, LabelLegend, OnViewNote } from '../components/ui';
import { NotFound } from './NotFound';

const isLens = (v: string | null): v is LensKey => !!v && content.lenses.some((l) => l.key === v);

export function Artifact({ id, query }: { id: string; query: URLSearchParams }) {
  const artifact = getArtifact(id);
  if (!artifact) return <NotFound />;
  return <ArtifactView key={id} artifact={artifact} query={query} />;
}

function ArtifactView({ artifact: a, query }: { artifact: ArtifactT; query: URLSearchParams }) {
  const { profile, isSaved, toggleSaved, storageOk } = useApp();
  const sound = useSound();
  const course = getCourse(query.get('course') ?? '');
  const queryLens = query.get('lens');

  // 렌즈 순서: 주 렌즈 → 보조 렌즈 → 나머지 (명세: 기본 → 주 렌즈 → 보조 렌즈 순으로 연다)
  const preferred: LensKey[] = [];
  if (profile) {
    preferred.push(profile.mainLens);
    if (profile.secondaryLens) preferred.push(profile.secondaryLens);
  } else if (course?.lens) {
    preferred.push(course.lens);
  }
  const lensOrder = [...preferred, ...content.lenses.map((l) => l.key).filter((k) => !preferred.includes(k))];

  const [depth, setDepth] = useState<'base' | 'deep'>(isLens(queryLens) ? 'deep' : 'base');
  const [lens, setLens] = useState<LensKey>(isLens(queryLens) ? queryLens : lensOrder[0]);
  const [justSaved, setJustSaved] = useState<null | 'saved' | 'removed'>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const commentaryRef = useRef<HTMLElement>(null);

  // 사운드를 켜 둔 채 다음 유물로 오면 이 유물의 사운드로 이어서 재생한다.
  useEffect(() => {
    if (sound.status === 'playing' && sound.artifactId !== a.id) sound.play(a);
  }, [a.id]);

  const stops = course ? visibleStops(content, course) : content.artifacts;
  const pos = stops.findIndex((x) => x.id === a.id);
  const inList = pos !== -1;
  const prev = inList && pos > 0 ? stops[pos - 1] : null;
  const next = inList && pos < stops.length - 1 ? stops[pos + 1] : null;
  const qs = course && inList ? `?course=${course.id}` : '';

  const script = depth === 'base' ? a.base : a.lenses[lens];
  const lensInfo = content.lenses.find((l) => l.key === lens)!;
  const saved = isSaved(a.id);

  const nextStep: { label: string; go: () => void } | null = (() => {
    if (depth === 'base') {
      return {
        label: profile ? `내 관점으로 이어 보기 · ${lensName(lensOrder[0])}` : '관점을 골라 더 깊이 보기',
        go: () => {
          setDepth('deep');
          setLens(lensOrder[0]);
        },
      };
    }
    if (profile?.secondaryLens && lens === profile.mainLens) {
      const sec = profile.secondaryLens;
      return { label: `두 번째 관점도 보기 · ${lensName(sec)}`, go: () => setLens(sec) };
    }
    return null;
  })();

  const goNextStep = () => {
    nextStep?.go();
    commentaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const k = lensOrder[(i + delta + lensOrder.length) % lensOrder.length];
    setLens(k);
    tabRefs.current[k]?.focus();
  };

  const onSave = () => {
    toggleSaved(a.id, depth === 'base' ? 'base' : lens);
    setJustSaved(saved ? 'removed' : 'saved');
  };

  return (
    <main className="page detail">
      <nav className="detail-top" aria-label="유물 이동">
        <a className="btn btn-text" href={course ? href('/course') : href('/artifacts')}>
          ← {course ? course.name : '전체 유물'}
        </a>
        {inList && (
          <span className="quiz-count">
            {course ? '코스' : '동선'} {pos + 1} / {stops.length}
          </span>
        )}
      </nav>

      <div className="detail-layout">
        <div className="detail-media">
          <ArtifactImage artifact={a} variant="hero" />
          <div className="detail-id">
            <p className="meta">
              {a.type === 'painting' ? '그림' : '유물'} · {floorRoom(a)}
            </p>
            <h1 className="display detail-title">{a.name}</h1>
            {a.album && <p className="meta">『{a.album}』 중</p>}
            <div className="chips">
              <OnViewNote artifact={a} />
            </div>
          </div>
          <dl className="facts">
            <div>
              <dt>시대</dt>
              <dd>{a.era}</dd>
            </div>
            <div>
              <dt>재질·크기</dt>
              <dd>{a.material}</dd>
            </div>
            <div>
              <dt>지정</dt>
              <dd>{a.designation}</dd>
            </div>
            <div>
              <dt>위치</dt>
              <dd>국립중앙박물관 {floorRoom(a)}</dd>
            </div>
          </dl>
          <div className="save-row">
            <button
              type="button"
              className={`btn btn-save ${saved ? 'is-saved' : ''}`}
              aria-pressed={saved}
              onClick={onSave}
            >
              <span aria-hidden="true" className="save-icon" />
              {saved ? '저장한 작품' : '이 작품 저장'}
            </button>
            <p className="meta" aria-live="polite">
              {!storageOk
                ? '이 브라우저에서는 기록을 저장할 수 없어요. 창을 닫으면 사라집니다.'
                : justSaved === 'saved'
                  ? <>관람 기록에 담았어요. <a href={href('/records')}>기록 보기</a></>
                  : justSaved === 'removed'
                    ? '관람 기록에서 뺐어요.'
                    : ''}
            </p>
          </div>
        </div>

        <div className="detail-text">
          <section className="commentary" ref={commentaryRef} aria-labelledby="commentary-title">
            <h2 id="commentary-title" className="visually-hidden">
              해설
            </h2>
            <div className="segmented depth" role="group" aria-label="해설 종류">
              <button type="button" aria-pressed={depth === 'base'} className={depth === 'base' ? 'is-on' : ''} onClick={() => setDepth('base')}>
                기본 해설
              </button>
              <button type="button" aria-pressed={depth === 'deep'} className={depth === 'deep' ? 'is-on' : ''} onClick={() => setDepth('deep')}>
                관점별 심화 해설
              </button>
            </div>

            {depth === 'deep' && (
              <div className="lens-tabs" role="tablist" aria-label="해설 관점">
                {lensOrder.map((k, i) => {
                  const tag =
                    profile?.mainLens === k ? '내 취향' : profile?.secondaryLens === k ? '두 번째' : null;
                  return (
                    <button
                      key={k}
                      ref={(el) => {
                        tabRefs.current[k] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`tab-${k}`}
                      aria-selected={lens === k}
                      aria-controls="lens-panel"
                      tabIndex={lens === k ? 0 : -1}
                      className={`lens-tab ${lens === k ? 'is-on' : ''}`}
                      onClick={() => setLens(k)}
                      onKeyDown={(e) => onTabKey(e, i)}
                    >
                      {lensName(k)}
                      {tag && <small>{tag}</small>}
                      {a.strong_lenses.includes(k) && <span className="strong-dot" title="이 유물에서 특히 풍부한 이야기" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className="script-wrap"
              id={depth === 'deep' ? 'lens-panel' : undefined}
              role={depth === 'deep' ? 'tabpanel' : undefined}
              aria-labelledby={depth === 'deep' ? `tab-${lens}` : undefined}
            >
              <p className="eyebrow">
                {depth === 'base' ? '기본 해설 · 모든 관람객에게 같은 내용' : `${lensInfo.name} 관점`}
              </p>
              <h3 className="script-q">{depth === 'base' ? (a.type === 'painting' ? '이 그림은 무엇인가?' : '이 유물은 무엇인가?') : lensInfo.question}</h3>
              {depth === 'deep' && a.strong_lenses.includes(lens) && (
                <p className="meta">이 유물은 ‘{lensInfo.name}’ 이야기가 특히 풍부해요.</p>
              )}
              <ScriptView script={script} />
              <div className="script-foot">
                <span className="meta">읽는 데 {formatSeconds(script.est_seconds)}</span>
                <NarrationButton file={script.audio} />
              </div>
              {nextStep && (
                <button type="button" className="btn btn-primary btn-block" onClick={goNextStep}>
                  {nextStep.label} →
                </button>
              )}
              {depth === 'deep' && profile && lens === profile.mainLens && (
                <p className="fineprint">
                  {tasteProfiles[profile.primary].persona} 결과에 맞춰 이 관점을 먼저 보여 드렸어요. 다른 관점도 눌러 보세요.
                </p>
              )}
            </div>
            <LabelLegend />
          </section>

          <SoundPlayer artifact={a} courseHint={course?.sound_default} />

          <section className="sources" aria-labelledby="sources-title">
            <h2 id="sources-title" className="h-small">
              출처와 참고 자료
            </h2>
            <ul>
              {a.sources.map((sid) => {
                const s = getSource(sid);
                if (!s) return null;
                return (
                  <li key={sid}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer">
                      {s.title}
                    </a>
                    <span className="meta">{s.checked === 'full' ? '원문 대조' : '요약 확인'}</span>
                  </li>
                );
              })}
            </ul>
            <p className="fineprint">
              출처는 유물 단위로 묶여 있어요. 문장별 출처 표시는 아직 준비 중입니다. 이미지: {a.image.credit || '준비 중'} ({a.image.license})
            </p>
          </section>
        </div>
      </div>

      <nav className="pager" aria-label="이전·다음 유물">
        {prev ? (
          <a className="pager-link" href={href(`/artifact/${prev.id}${qs}`)}>
            <small>← 이전</small>
            {prev.name}
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="pager-link is-next" href={href(`/artifact/${next.id}${qs}`)}>
            <small>다음 →</small>
            {next.name}
          </a>
        ) : course ? (
          <a className="pager-link is-next" href={href('/records')}>
            <small>코스 끝</small>
            관람 기록 보기
          </a>
        ) : (
          <span />
        )}
      </nav>
    </main>
  );
}
