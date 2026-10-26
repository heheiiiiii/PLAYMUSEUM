import { useEffect, useMemo, useRef, useState } from 'react';
import { content, getArtifact, lensName, venue, type LensKey, type ScriptKey, type TasteKey } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { buildInsight, formatDuration, lensShares, tasteOfLens, type Insight } from '../logic/report';
import { canvasToBlob, drawShareCard, type CardData } from '../logic/shareCard';
import { canShareFile, prepareDownloads, saveBlob, shareFile } from '../logic/saveFile';
import { href } from '../router';
import { useActivity, type Quote } from '../state/Activity';
import { useApp } from '../state/AppState';
import { Character, characterTint } from '../components/Character';

const LENSES = content.lenses.map((l) => l.key);
const ALL: ScriptKey[] = ['base', ...LENSES];
const scriptName = (k: ScriptKey) => (k === 'base' ? '기본 해설' : `${lensName(k)} 해설`);
const SITE = 'heheiiiiii.github.io/PLAYMUSEUM';

function quoteText(q: Quote): string | null {
  const a = getArtifact(q.artifactId);
  const script = a ? (q.lens === 'base' ? a.base : a.lenses[q.lens as LensKey]) : undefined;
  return script?.sentences.find((s) => s.id === q.id)?.text ?? null;
}

function insightText(i: Insight, primary: TasteKey | null): string {
  switch (i.kind) {
    case 'not_enough':
      return '아직 해설을 둘러보는 중이에요.';
    case 'no_profile':
      return `‘${lensName(i.actual)}’ 해설에 가장 오래 머물렀어요.`;
    case 'match':
      return `테스트 결과처럼 ‘${lensName(i.actual)}’ 해설에 가장 오래 머물렀어요.`;
    case 'differ':
      return `테스트는 ${primary ? tasteProfiles[primary].persona : '다른 취향'}, 실제로는 ‘${lensName(i.actual)}’ 해설에 가장 오래 머물렀어요.`;
  }
}

export function Report() {
  const { profile, saved } = useApp();
  const { lensSeconds, viewed, quotes, removeQuote } = useActivity();

  const insight = buildInsight(lensSeconds, LENSES, profile?.mainLens ?? null);
  const shares = lensShares(lensSeconds, ALL);
  const totalSeconds = shares.reduce((n, s) => n + s.seconds, 0);
  const actualTaste = 'actual' in insight ? tasteOfLens(insight.actual) : null;
  // 리포트의 대표 캐릭터: 테스트 결과, 없으면 실제로 가장 오래 본 관점
  const taste: TasteKey | null = profile?.primary ?? actualTaste;
  const notes = saved.filter((s) => s.note);
  const validQuotes = quotes.filter((q) => quoteText(q));

  if (!taste && totalSeconds === 0 && validQuotes.length === 0 && saved.length === 0) {
    return (
      <main className="page narrow empty">
        <p className="eyebrow">나의 관람 리포트</p>
        <h1>아직 리포트를 만들 기록이 없어요</h1>
        <p>취향 테스트를 하고 유물 해설을 둘러보면, 내가 실제로 어떤 이야기에 오래 머물렀는지 리포트로 정리해 드려요.</p>
        <div className="actions">
          <a className="btn btn-primary" href={href('/quiz')}>
            취향 테스트 하기
          </a>
          <a className="btn btn-quiet" href={href('/artifacts')}>
            유물 둘러보기
          </a>
        </div>
      </main>
    );
  }

  const p = taste ? tasteProfiles[taste] : null;

  return (
    <main className="page narrow report">
      <header className="report-head">
        {taste && <Character taste={taste} size={112} />}
        <div>
          <p className="eyebrow">나의 관람 리포트 · {venue.name}</p>
          <h1 className="display">{p ? p.persona : '나의 관람'}</h1>
          {!profile && taste && <p className="meta">취향 테스트 전이라, 가장 오래 본 해설로 정했어요.</p>}
        </div>
      </header>

      <dl className="report-stats">
        <div>
          <dt>둘러본 유물</dt>
          <dd>
            {viewed.length}
            <small>/{content.artifacts.length}</small>
          </dd>
        </div>
        <div>
          <dt>저장한 작품</dt>
          <dd>{saved.length}</dd>
        </div>
        <div>
          <dt>모은 문장</dt>
          <dd>{validQuotes.length}</dd>
        </div>
        <div>
          <dt>감상평</dt>
          <dd>{notes.length}</dd>
        </div>
        <div>
          <dt>해설 읽은 시간</dt>
          <dd className="is-text">{formatDuration(totalSeconds)}</dd>
        </div>
      </dl>

      <section className="insight" aria-labelledby="insight-title">
        <h2 id="insight-title" className="h-small">
          테스트와 실제 관람
        </h2>
        <InsightBlock insight={insight} primary={profile?.primary ?? null} />
        {totalSeconds > 0 && (
          <ul className="bars report-bars" aria-label="해설 종류별로 머문 시간">
            {shares.map((s) => (
              <li key={s.key} className={'actual' in insight && s.key === insight.actual ? 'is-top' : ''}>
                <span className="bar-label">{scriptName(s.key)}</span>
                <span className="bar-track" aria-hidden="true">
                  <span className="bar-fill" style={{ width: `${s.share * 100}%` }} />
                </span>
                <span className="bar-value">{formatDuration(s.seconds)}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="fineprint">해설 화면을 열어 둔 시간을 이 브라우저에서만 셉니다.</p>
      </section>

      <section aria-labelledby="quotes-title">
        <h2 id="quotes-title" className="section-title">
          모은 문장
        </h2>
        {validQuotes.length === 0 ? (
          <p className="meta">유물 해설에서 마음에 드는 문장을 누르면 여기에 모여요.</p>
        ) : (
          <ul className="quote-list">
            {validQuotes.map((q) => {
              const a = getArtifact(q.artifactId)!;
              return (
                <li key={q.id}>
                  <blockquote>{quoteText(q)}</blockquote>
                  <div className="quote-foot">
                    <a href={href(`/artifact/${a.id}${q.lens !== 'base' ? `?lens=${q.lens}` : ''}`)}>
                      {a.name} · {scriptName(q.lens)}
                    </a>
                    <button type="button" className="btn btn-text btn-small" onClick={() => removeQuote(q.id)}>
                      빼기
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {taste && p && (
        <ShareCard
          taste={taste}
          insight={insightText(insight, profile?.primary ?? null)}
          shares={totalSeconds > 0 ? shares.slice(0, 3).map((s) => ({ name: scriptName(s.key), share: s.share })) : []}
          quotes={validQuotes}
          stats={[
            { label: '둘러본 유물', value: viewed.length },
            { label: '저장한 작품', value: saved.length },
            { label: '모은 문장', value: validQuotes.length },
          ]}
        />
      )}
    </main>
  );
}

function InsightBlock({ insight: i, primary }: { insight: Insight; primary: TasteKey | null }) {
  if (i.kind === 'not_enough') {
    return (
      <p className="insight-text">
        관점별 심화 해설을 조금 더 둘러보면, 테스트 결과와 실제 관람이 어떻게 다른지 알려 드려요.
      </p>
    );
  }
  const actual = tasteProfiles[tasteOfLens(i.actual)];
  const pct = Math.round(i.share * 100);
  if (i.kind === 'differ' && primary) {
    const expected = tasteProfiles[primary];
    return (
      <div className="insight-compare">
        <figure>
          <Character taste={primary} size={72} />
          <figcaption>
            테스트
            <strong>{expected.persona}</strong>
          </figcaption>
        </figure>
        <span className="insight-arrow" aria-hidden="true">
          →
        </span>
        <figure>
          <Character taste={actual.key} size={72} />
          <figcaption>
            실제 관람
            <strong>{actual.persona}</strong>
          </figcaption>
        </figure>
        <p className="insight-text">
          테스트로는 {expected.persona}였지만, 관점 해설 시간의 {pct}%를 ‘{lensName(i.actual)}’ 해설에 썼어요. 다음 관람에서는{' '}
          {actual.persona} 코스도 맞을 수 있어요.
        </p>
      </div>
    );
  }
  return (
    <p className="insight-text">
      {i.kind === 'match' ? '테스트 결과처럼 ' : ''}관점 해설 시간의 {pct}%를 ‘{lensName(i.actual)}’ 해설에 썼어요.
    </p>
  );
}

function ShareCard({
  taste,
  insight,
  shares,
  quotes,
  stats,
}: {
  taste: TasteKey;
  insight: string;
  shares: { name: string; share: number }[];
  quotes: Quote[];
  stats: { label: string; value: number }[];
}) {
  const p = tasteProfiles[taste];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const charRef = useRef<HTMLDivElement>(null);
  const [quoteId, setQuoteId] = useState<string | null>(quotes[0]?.id ?? null);
  const [status, setStatus] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    prepareDownloads();
  }, []);

  const chosen = quotes.find((q) => q.id === quoteId) ?? quotes[0] ?? null;
  const quote = useMemo(() => {
    if (!chosen) return null;
    const a = getArtifact(chosen.artifactId);
    const text = quoteText(chosen);
    return a && text ? { text, source: `${a.name} · ${scriptName(chosen.lens)}` } : null;
  }, [chosen]);

  const date = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const statsKey = stats.map((s) => s.value).join(',');
  const sharesKey = shares.map((s) => `${s.name}${s.share.toFixed(3)}`).join(',');

  useEffect(() => {
    const canvas = canvasRef.current;
    const svg = charRef.current?.querySelector('svg');
    if (!canvas || !svg) return;
    let cancelled = false;
    const characterSvg = new XMLSerializer().serializeToString(svg).replaceAll('var(--char-outer)', '#2a2f2c');
    const data: CardData = {
      persona: p.persona,
      character: p.character,
      greeting: p.greeting,
      characterSvg,
      tint: characterTint(taste),
      insight,
      lenses: shares,
      quote,
      stats,
      date,
      venue: venue.name,
      url: SITE,
    };
    setReady(false);
    drawShareCard(canvas, data)
      .then(() => !cancelled && setReady(true))
      .catch(() => !cancelled && setStatus('카드를 그리지 못했어요. 새로고침 후 다시 시도해 주세요.'));
    return () => {
      cancelled = true;
    };
  }, [taste, insight, quote, statsKey, sharesKey, date]);

  const filename = `playmuseum-report-${taste}.png`;

  const getFile = async () => {
    const blob = await canvasToBlob(canvasRef.current!);
    return { blob, file: new File([blob], filename, { type: 'image/png' }) };
  };

  const onSave = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const { blob } = await getFile();
      const r = await saveBlob(blob, filename);
      setStatus(r === 'saved' ? '이미지를 저장했어요.' : r === 'declined' ? '저장을 취소했어요.' : '저장하지 못했어요. 이미지를 길게 눌러 저장해 보세요.');
    } catch {
      setStatus('저장하지 못했어요. 이미지를 길게 눌러 저장해 보세요.');
    } finally {
      setBusy(false);
    }
  };

  const [shareable, setShareable] = useState(false);
  useEffect(() => {
    if (!ready || !canvasRef.current) return;
    canvasToBlob(canvasRef.current)
      .then((b) => setShareable(canShareFile(new File([b], filename, { type: 'image/png' }))))
      .catch(() => setShareable(false));
  }, [ready, filename]);

  const onShare = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const { file } = await getFile();
      const r = await shareFile(file, `PLAYMUSEUM 나의 관람 취향: ${p.persona}`);
      if (r === 'failed') setStatus('공유하지 못했어요. 이미지 저장을 이용해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="share" aria-labelledby="share-title">
      <h2 id="share-title" className="section-title">
        공유 카드
      </h2>
      <p className="meta">인스타그램 스토리 크기(1080×1920) 이미지로 만들어요.</p>
      <div ref={charRef} className="visually-hidden" aria-hidden="true">
        <Character taste={taste} size={460} decorative />
      </div>
      {quotes.length > 1 && (
        <label className="field">
          <span>카드에 넣을 문장</span>
          <select id="card-quote" value={chosen?.id ?? ''} onChange={(e) => setQuoteId(e.target.value)}>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {(quoteText(q) ?? '').slice(0, 40)}…
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="share-preview">
        <canvas ref={canvasRef} width={1080} height={1920} role="img" aria-label={`${p.persona} 관람 리포트 카드`} />
      </div>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onSave} disabled={!ready || busy}>
          이미지 저장
        </button>
        {shareable && (
          <button type="button" className="btn btn-quiet" onClick={onShare} disabled={!ready || busy}>
            공유하기
          </button>
        )}
      </div>
      <p className="meta" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
