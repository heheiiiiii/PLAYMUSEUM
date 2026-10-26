import { content, getArtifact, lensName } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { reviewsOf, tastesOf, type Me, type Post } from '../logic/community';
import { href } from '../router';
import { Character } from './Character';

export function SampleNotice() {
  return (
    <p className="sample-notice">
      <span className="sample-tag">예시</span>
      다른 관람객 기록은 시연용 예시 데이터입니다. 내 저장과 감상평은 이 브라우저에서만 더해져요.
    </p>
  );
}

export function ReviewList({ reviews, showArtifact = false }: { reviews: Post[]; showArtifact?: boolean }) {
  if (reviews.length === 0) return <p className="meta">아직 감상평이 없어요.</p>;
  return (
    <ul className="reviews">
      {reviews.map((r) => {
        const a = showArtifact ? getArtifact(r.artifactId) : undefined;
        return (
          <li key={r.id} className={`review ${r.mine ? 'is-mine' : ''}`}>
            <Character taste={r.taste} size={40} decorative />
            <div>
              <p className="review-who">
                <strong>{r.nickname}</strong>
                <span className="meta">
                  {tasteProfiles[r.taste].persona}
                  {r.lens !== 'base' && ` · ${lensName(r.lens)} 해설을 보고`}
                </span>
                {!r.mine && <span className="sample-tag">예시</span>}
              </p>
              {a && (
                <a className="review-artifact" href={href(`/artifact/${a.id}`)}>
                  {a.name}
                </a>
              )}
              <p className="review-text">{r.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** 유물 상세의 ‘관람객 이야기’ */
export function ArtifactCommunity({ artifactId, me }: { artifactId: string; me: Me }) {
  const tastes = content.tastes.map((t) => t.key);
  const dist = tastesOf(artifactId, tastes, me);
  const total = dist.reduce((n, d) => n + d.count, 0);
  const reviews = reviewsOf(artifactId, me);
  const mine = me.taste ? dist.find((d) => d.taste === me.taste) : undefined;
  return (
    <section className="community" aria-labelledby="community-title">
      <h2 id="community-title" className="h-small">
        관람객 이야기
      </h2>
      <SampleNotice />
      {mine && me.taste && (
        <p className="community-lead">
          {me.saved.some((x) => x.id === artifactId)
            ? `나를 포함해 ${tasteProfiles[me.taste].persona} ${mine.count}명이 이 작품을 저장했어요.`
            : `나와 같은 ${tasteProfiles[me.taste].persona} ${mine.count}명이 이 작품을 저장했어요.`}
        </p>
      )}
      <ul className="taste-dist" aria-label="이 작품을 저장한 관람객 취향">
        {dist.map((d) => (
          <li key={d.taste} className={d.taste === me.taste ? 'is-me' : ''}>
            <Character taste={d.taste} size={32} decorative />
            <span className="dist-name">{tasteProfiles[d.taste].persona}</span>
            <span className="dist-track" aria-hidden="true">
              <span style={{ width: `${(d.count / Math.max(...dist.map((x) => x.count))) * 100}%` }} />
            </span>
            <span className="dist-n">{d.count}</span>
          </li>
        ))}
      </ul>
      <p className="meta">저장한 관람객 {total}명 기준</p>
      <ReviewList reviews={reviews} />
    </section>
  );
}
