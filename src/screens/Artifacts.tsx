import { content } from '../content';
import { sortByRelevance } from '../logic/courses';
import { href } from '../router';
import { useApp } from '../state/AppState';
import { ArtifactImage } from '../components/ArtifactImage';
import { floorRoom, LensBadge, OnViewNote } from '../components/ui';
import { lensName } from '../content';

export function Artifacts() {
  const { profile, isSaved } = useApp();
  const list = profile
    ? sortByRelevance(content.artifacts, profile.mainLens, profile.secondaryLens)
    : content.artifacts;

  return (
    <main className="page">
      <header className="list-head">
        <p className="eyebrow">{content.meta.exhibition}</p>
        <h1 className="display">전체 유물</h1>
        <p className="lede">
          {profile
            ? `‘${lensName(profile.mainLens)}’${profile.secondaryLens ? `, ‘${lensName(profile.secondaryLens)}’` : ''} 이야기가 풍부한 유물부터 보여 드려요. 나머지는 관람 동선 순서예요.`
            : '관람 동선 순서로 보여 드려요. 취향 테스트를 하면 관심사에 가까운 유물부터 보여 드려요.'}
        </p>
      </header>
      <ul className="grid">
        {list.map((a) => {
          const main = profile && a.strong_lenses.includes(profile.mainLens);
          const sec = profile?.secondaryLens && a.strong_lenses.includes(profile.secondaryLens);
          return (
            <li key={a.id} className="tile">
              <a href={href(`/artifact/${a.id}`)}>
                <ArtifactImage artifact={a} variant="card" />
                <div className="tile-body">
                  <p className="meta">
                    {a.type === 'painting' ? '그림' : '유물'} · {floorRoom(a)}
                  </p>
                  <h2>{a.name}</h2>
                  <p className="meta">{a.era}</p>
                  <div className="chips">
                    {main && <LensBadge lens={profile!.mainLens} kind="main" />}
                    {sec && <LensBadge lens={profile!.secondaryLens!} kind="secondary" />}
                    <OnViewNote artifact={a} />
                    {isSaved(a.id) && <span className="status-chip is-saved">저장함</span>}
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
