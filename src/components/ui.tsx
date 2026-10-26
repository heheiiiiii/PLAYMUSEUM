import type { ReactNode } from 'react';
import { content, lensName, type Artifact, type LensKey, type SentenceLabel } from '../content';
import { labelMeanings } from '../data/tasteProfiles';

export function OnViewNote({ artifact }: { artifact: Artifact }) {
  if (artifact.on_view === true) return null;
  return (
    <span className={`status-chip ${artifact.on_view === false ? 'is-off' : 'is-unknown'}`}>
      {artifact.on_view === false ? '현재 전시하지 않음' : '전시 여부 확인 중'}
    </span>
  );
}

export function LensBadge({ lens, kind }: { lens: LensKey; kind: 'main' | 'secondary' }) {
  return (
    <span className={`lens-badge ${kind === 'main' ? 'is-main' : ''}`}>
      {lensName(lens)} 이야기가 풍부
    </span>
  );
}

export function LabelChip({ label }: { label: SentenceLabel }) {
  return (
    <em className={`label-chip label-${label}`} title={labelMeanings[label]}>
      {content.labels[label]?.name ?? label}
    </em>
  );
}

export function LabelLegend() {
  const keys = (Object.keys(labelMeanings) as SentenceLabel[]).filter((k) => k !== 'fact');
  return (
    <details className="legend">
      <summary>해석 · 추정 · 전설 표시는 무엇인가요?</summary>
      <p>표시가 없는 문장은 {labelMeanings.fact}입니다.</p>
      <dl>
        {keys.map((k) => (
          <div key={k}>
            <dt>
              <LabelChip label={k} />
            </dt>
            <dd>{labelMeanings[k]}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export function Meta({ children }: { children: ReactNode }) {
  return <p className="meta">{children}</p>;
}

export const floorRoom = (a: Artifact) => `${a.location.floor}층 ${a.location.room}`;

export function formatSeconds(sec: number) {
  if (sec < 60) return `약 ${sec}초`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s >= 30 ? `약 ${m}분 ${s}초` : `약 ${m}분`;
}

export function formatMinutes(min: number) {
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}
