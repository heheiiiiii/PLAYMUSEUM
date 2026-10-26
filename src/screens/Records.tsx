import { getArtifact, lensName, type ScriptKey } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { href } from '../router';
import { useApp } from '../state/AppState';
import { ArtifactImage } from '../components/ArtifactImage';
import { floorRoom } from '../components/ui';

const viewName = (k: ScriptKey) => (k === 'base' ? '기본 해설' : `${lensName(k)} 해설`);

const dateText = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export function Records() {
  const { saved, removeSaved, profile } = useApp();
  const items = saved.map((s) => ({ s, a: getArtifact(s.id) })).filter((x) => x.a);

  return (
    <main className="page narrow records">
      <header className="list-head">
        <p className="eyebrow">나의 관람 기록</p>
        <h1 className="display">저장한 작품</h1>
        {profile && <p className="lede">지금 취향: {tasteProfiles[profile.primary].persona}</p>}
      </header>

      {items.length === 0 ? (
        <section className="empty">
          <h2>아직 저장한 작품이 없어요</h2>
          <p>유물 화면에서 ‘이 작품 저장’을 누르면 여기에 모입니다. 그때 보고 있던 관점도 함께 기록돼요.</p>
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
            <li key={s.id} className="record">
              <a href={href(`/artifact/${a!.id}${s.lens !== 'base' ? `?lens=${s.lens}` : ''}`)} className="record-link">
                <ArtifactImage artifact={a!} variant="thumb" />
                <div>
                  <h2>{a!.name}</h2>
                  <p className="meta">
                    {a!.era} · {floorRoom(a!)}
                  </p>
                  <p className="record-lens">
                    {viewName(s.lens)}을 보며 저장
                    {s.taste && ` · 당시 취향 ${tasteProfiles[s.taste].persona}`}
                  </p>
                  <p className="meta">{dateText(s.savedAt)}</p>
                </div>
              </a>
              <button type="button" className="btn btn-text btn-small" onClick={() => removeSaved(s.id)} aria-label={`${a!.name} 저장 해제`}>
                저장 해제
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="fineprint">기록은 이 브라우저에만 저장돼요. 다른 기기와는 연결되지 않고, 브라우저 데이터를 지우면 함께 사라집니다.</p>
    </main>
  );
}
