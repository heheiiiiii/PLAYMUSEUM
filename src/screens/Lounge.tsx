import { content, type TasteKey } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { favoritesOf, reviewsByTaste, visitorsOf } from '../logic/community';
import { href, navigate } from '../router';
import { useApp } from '../state/AppState';
import { ArtifactImage } from '../components/ArtifactImage';
import { Character } from '../components/Character';
import { ReviewList, SampleNotice, TastePicker } from '../components/Community';

const isTaste = (v: string | undefined): v is TasteKey => !!v && content.tastes.some((t) => t.key === v);

export function Lounge({ taste: param }: { taste?: string }) {
  const { profile, saved } = useApp();
  const me = { taste: profile?.primary ?? null, saved };
  const taste: TasteKey = isTaste(param) ? param : (profile?.primary ?? 'people');
  const p = tasteProfiles[taste];
  const favorites = favoritesOf(taste, content.artifacts, me);
  const reviews = reviewsByTaste(taste, me);

  return (
    <main className="page lounge">
      <header className="list-head">
        <p className="eyebrow">취향 라운지</p>
        <h1 className="display">같은 취향, 다른 관람객</h1>
        <p className="lede">취향이 같은 사람들은 어떤 유물 앞에서 오래 머물렀을까요?</p>
      </header>

      <TastePicker value={taste} onChange={(t) => navigate(`/lounge/${t}`)} mine={profile?.primary ?? null} />

      <section className="lounge-hero" aria-live="polite">
        <Character taste={taste} size={128} />
        <div>
          <p className="eyebrow">
            {p.persona} · 관람객 {visitorsOf(taste, me)}명
          </p>
          <h2 className="display lounge-name">{p.character}</h2>
          <p className="speech">“{p.greeting}”</p>
          {profile?.primary === taste ? (
            <p className="meta">내 취향이에요.</p>
          ) : (
            !profile && (
              <a className="btn btn-quiet btn-small" href={href('/quiz')}>
                내 취향 찾기
              </a>
            )
          )}
        </div>
      </section>

      <SampleNotice />

      <section aria-labelledby="fav-title">
        <h2 id="fav-title" className="section-title">
          {p.persona}들이 많이 저장한 유물
        </h2>
        <ol className="favorites">
          {favorites.map((f, i) => (
            <li key={f.artifact.id}>
              <a href={href(`/artifact/${f.artifact.id}`)}>
                <span className="fav-rank">{i + 1}</span>
                <ArtifactImage artifact={f.artifact} variant="thumb" />
                <span className="fav-body">
                  <strong>{f.artifact.name}</strong>
                  <span className="meta">
                    {f.total}명 중 {f.count}명이 저장{f.withMe && ' · 나도 저장함'}
                  </span>
                  <span className="fav-track" aria-hidden="true">
                    <span style={{ width: `${(f.count / f.total) * 100}%` }} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="rev-title">
        <h2 id="rev-title" className="section-title">
          {p.persona}들의 감상평
        </h2>
        <ReviewList reviews={reviews} showArtifact />
      </section>
    </main>
  );
}
