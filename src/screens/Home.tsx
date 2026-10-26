import { venue } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import { href } from '../router';
import { useApp } from '../state/AppState';
import { Character } from '../components/Character';
import { HomeDemo } from '../components/HomeDemo';

export function Home() {
  const { profile, recommended, saved } = useApp();

  return (
    <main className="page home">
      <div className="home-top">
        <section className="hero">
          <p className="eyebrow home-venue">
            <span>{venue.name}</span>
            <a href={href('/venues')}>다른 박물관·미술관</a>
          </p>
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
        </section>
        <HomeDemo initial={profile?.primary ?? null} />
        <div className="actions home-actions">
          <a className="btn btn-primary btn-large" href={href('/quiz')}>
            {profile ? '취향 다시 찾기' : '내 관람 취향 발견하기'}
          </a>
          {!profile && (
            <a className="btn btn-quiet" href={href('/artifacts')}>
              테스트 없이 둘러보기
            </a>
          )}
        </div>
      </div>

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
            <a className="btn btn-quiet" href={href('/report')}>
              관람 리포트
            </a>
          </div>
        </section>
      )}

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
            <strong>문장 모으기</strong>
            <span>마음에 남은 문장과 감상평을 기록</span>
          </li>
          <li>
            <strong>리포트 받기</strong>
            <span>실제로 오래 본 관점을 공유 카드로</span>
          </li>
        </ol>
      </section>
    </main>
  );
}
