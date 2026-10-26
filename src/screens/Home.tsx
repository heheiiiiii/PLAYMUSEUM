import { content, getArtifact } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { href } from '../router';
import { useApp } from '../state/AppState';
import { Character } from '../components/Character';

const SAMPLE_ID = 'A01';

export function Home() {
  const { profile, recommended, saved } = useApp();
  const sample = getArtifact(SAMPLE_ID) ?? content.artifacts[0];

  return (
    <main className="page home">
      <section className="hero">
        <p className="eyebrow">{content.meta.exhibition}</p>
        <h1 className="display">
          같은 유물도,
          <br />
          당신의 취향에 따라
          <br />
          새로운 이야기가 됩니다.
        </h1>
        <p className="lede">
          다섯 가지 질문으로 관람 취향을 찾고, 그에 맞는 관람 코스와 해설을 받아 보세요. 배경지식이 없어도 괜찮아요.
        </p>
        <div className="actions">
          <a className="btn btn-primary btn-large" href={href('/quiz')}>
            {profile ? '취향 다시 찾기' : '내 관람 취향 발견하기'}
          </a>
          {!profile && (
            <a className="btn btn-quiet" href={href('/artifacts')}>
              테스트 없이 둘러보기
            </a>
          )}
        </div>
      </section>

      {profile && (
        <section className="resume" aria-label="이어서 보기">
          <Character taste={profile.primary} size={72} />
          <div className="resume-text">
            <p className="eyebrow">지난번 결과</p>
            <p className="resume-taste">{tasteProfiles[profile.primary].persona}</p>
            <p className="meta">
              추천 코스 · {recommended.course.name}
              {saved.length > 0 && ` · 저장한 작품 ${saved.length}점`}
            </p>
          </div>
          <div className="actions">
            <a className="btn btn-primary" href={href('/course')}>
              추천 코스 이어 보기
            </a>
            <a className="btn btn-quiet" href={href('/result')}>
              결과 다시 보기
            </a>
          </div>
        </section>
      )}

      <section className="cast" aria-labelledby="cast-title">
        <h2 id="cast-title">여섯 가지 관람 취향</h2>
        <p className="meta">취향 테스트를 하면 나와 닮은 관람 친구를 알려 드려요.</p>
        <ul className="cast-list">
          {content.tastes.map((t) => (
            <li key={t.key}>
              <a href={href(`/lounge/${t.key}`)}>
                <Character taste={t.key} size={84} decorative />
                <strong>{tasteProfiles[t.key].character}</strong>
                <span>{tasteProfiles[t.key].persona}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="lens-preview" aria-labelledby="lens-preview-title">
        <div className="lens-preview-head">
          <p className="eyebrow">예시 · {sample.name}</p>
          <h2 id="lens-preview-title">한 유물, 다섯 개의 질문</h2>
          <p>기본 해설은 누구에게나 같고, 그다음 이야기는 고르는 관점에 따라 달라집니다.</p>
        </div>
        <ol className="lens-list">
          {content.lenses.map((l) => (
            <li key={l.key}>
              <a href={href(`/artifact/${sample.id}?lens=${l.key}`)}>
                <span className="lens-name">{l.name}</span>
                <span className="lens-q">{l.question}</span>
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title">이렇게 관람해요</h2>
        <ol className="steps">
          <li>
            <strong>취향 찾기</strong>
            <span>1분 안에 끝나는 다섯 문항</span>
          </li>
          <li>
            <strong>코스 받기</strong>
            <span>취향과 관람 시간에 맞춘 동선</span>
          </li>
          <li>
            <strong>관점 바꿔 보기</strong>
            <span>기본 해설 뒤에 내 관점의 이야기</span>
          </li>
          <li>
            <strong>기록하기</strong>
            <span>마음에 든 작품을 저장</span>
          </li>
        </ol>
      </section>
    </main>
  );
}
