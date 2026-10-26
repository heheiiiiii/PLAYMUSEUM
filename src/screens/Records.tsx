import { useState } from 'react';
import { getArtifact, lensName, type Artifact, type ScriptKey } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { href } from '../router';
import { useApp, type SavedItem } from '../state/AppState';
import { ArtifactImage } from '../components/ArtifactImage';
import { Character } from '../components/Character';
import { NoteEditor } from '../components/NoteEditor';
import { floorRoom } from '../components/ui';

const viewName = (k: ScriptKey) => (k === 'base' ? '기본 해설' : `${lensName(k)} 해설`);

const dateText = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export function Records() {
  const { saved, profile } = useApp();
  const items = saved
    .map((s) => ({ s, a: getArtifact(s.id) }))
    .filter((x): x is { s: SavedItem; a: Artifact } => !!x.a);
  const noteCount = items.filter((x) => x.s.note).length;

  return (
    <main className="page narrow records">
      <header className="records-head">
        {profile && <Character taste={profile.primary} size={88} />}
        <div>
          <p className="eyebrow">나의 관람 기록</p>
          <h1 className="display">저장한 작품</h1>
          <p className="meta">
            {profile && `${tasteProfiles[profile.primary].character} · ${tasteProfiles[profile.primary].persona}`}
            {items.length > 0 && `${profile ? ' · ' : ''}작품 ${items.length}점 · 감상평 ${noteCount}개`}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <section className="empty">
          <h2>아직 저장한 작품이 없어요</h2>
          <p>유물 화면에서 ‘이 작품 저장’을 누르거나 감상평을 남기면 여기에 모입니다. 그때 보고 있던 관점도 함께 기록돼요.</p>
          <div className="actions">
            <a className="btn btn-primary" href={href(profile ? '/course' : '/quiz')}>
              {profile ? '추천 코스 보기' : '취향 테스트 하기'}
            </a>
            <a className="btn btn-quiet" href={href('/artifacts')}>
              전체 유물 보기
            </a>
          </div>
        </section>
      ) : (
        <ul className="record-list">
          {items.map(({ s, a }) => (
            <RecordItem key={s.id} item={s} artifact={a} />
          ))}
        </ul>
      )}
      <p className="fineprint">기록은 이 브라우저에만 저장돼요. 다른 기기와는 연결되지 않고, 브라우저 데이터를 지우면 함께 사라집니다.</p>
    </main>
  );
}

function RecordItem({ item: s, artifact: a }: { item: SavedItem; artifact: Artifact }) {
  const { removeSaved } = useApp();
  const [writing, setWriting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const remove = () => {
    if (s.note && !confirming) {
      setConfirming(true);
      return;
    }
    removeSaved(s.id);
  };

  return (
    <li className="record">
      <div className="record-main">
        <a href={href(`/artifact/${a.id}${s.lens !== 'base' ? `?lens=${s.lens}` : ''}`)} className="record-link">
          <ArtifactImage artifact={a} variant="thumb" />
          <div>
            <h2>{a.name}</h2>
            <p className="meta">
              {a.era} · {floorRoom(a)}
            </p>
            <p className="record-lens">
              {viewName(s.lens)}을 보며 저장
              {s.taste && ` · 당시 취향 ${tasteProfiles[s.taste].persona}`}
            </p>
            <p className="meta">{dateText(s.savedAt)}</p>
          </div>
        </a>
        <button
          type="button"
          className="btn btn-text btn-small"
          onClick={remove}
          aria-label={`${a.name} 저장 해제`}
        >
          저장 해제
        </button>
      </div>

      {confirming && (
        <div className="confirm" role="alert">
          <p>감상평도 함께 지워져요. 저장을 해제할까요?</p>
          <div className="actions">
            <button type="button" className="btn btn-quiet btn-small" onClick={() => setConfirming(false)}>
              취소
            </button>
            <button type="button" className="btn btn-danger btn-small" onClick={() => removeSaved(s.id)}>
              감상평과 함께 해제
            </button>
          </div>
        </div>
      )}

      {s.note || writing ? (
        <div className="record-note">
          <p className="eyebrow">나의 감상</p>
          <NoteEditor artifactId={a.id} lens={s.lens} />
        </div>
      ) : (
        <button type="button" className="btn btn-quiet btn-small record-write" onClick={() => setWriting(true)}>
          감상평 쓰기
        </button>
      )}
    </li>
  );
}
