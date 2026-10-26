import { content, getTaste, lensName } from '../content';
import { quiz } from '../data/quiz';
import { tasteProfiles } from '../data/tasteProfiles';
import { courseMinutes } from '../logic/courses';
import { href, navigate } from '../router';
import { useApp } from '../state/AppState';
import { formatMinutes } from '../components/ui';
import { courseReasonText } from './courseText';

export function Result() {
  const { profile, recommended, minutes, resetAnswers } = useApp();

  if (!profile) {
    return (
      <main className="page narrow empty">
        <h1>아직 취향 테스트 결과가 없어요</h1>
        <p>다섯 개의 짧은 질문에 답하면 나에게 맞는 관점과 관람 코스를 알려 드려요.</p>
        <a className="btn btn-primary" href={href('/quiz')}>
          취향 테스트 시작
        </a>
      </main>
    );
  }

  const primary = tasteProfiles[profile.primary];
  const primaryScore = profile.ranked[0];
  const secondary = profile.secondary ? tasteProfiles[profile.secondary] : null;
  const maxScore = Math.max(...profile.ranked.map((r) => r.score), 1);
  const course = recommended.course;

  return (
    <main className="page narrow result">
      <p className="eyebrow">나의 관람 취향</p>
      <h1 className="display result-title">{primary.persona}</h1>
      <p className="lede">{primary.fit}</p>

      <section className="why" aria-labelledby="why-title">
        <h2 id="why-title" className="h-small">
          이렇게 나온 이유
        </h2>
        <p>
          {quiz.length}개 질문 중 {primaryScore.picks}개에서 ‘{getTaste(profile.primary)?.label}’ 쪽 답을 고르셨어요.
          {profile.tie && secondary && ` ‘${secondary.persona}’와 점수가 같아, 더 여러 번 고르거나 마지막 질문에서 고른 쪽을 앞에 두었어요.`}
        </p>
        <ul className="bars" aria-label="취향별 점수">
          {profile.ranked.map((r) => (
            <li key={r.key} className={r.key === profile.primary ? 'is-top' : ''}>
              <span className="bar-label">{tasteProfiles[r.key].persona}</span>
              <span className="bar-track" aria-hidden="true">
                <span className="bar-fill" style={{ width: `${(r.score / maxScore) * 100}%` }} />
              </span>
              <span className="bar-value">{r.score}점</span>
            </li>
          ))}
        </ul>
      </section>

      {secondary && (
        <section className="secondary-taste">
          <p className="eyebrow">두 번째로 가까운 취향</p>
          <h2>{secondary.persona}</h2>
          <p>{secondary.fit}</p>
        </section>
      )}

      <section className="howto" aria-labelledby="howto-title">
        <h2 id="howto-title" className="h-small">
          추천 관람 방식
        </h2>
        <ul>
          <li>
            유물마다 기본 해설을 먼저 보여 드리고, 이어서 ‘{lensName(profile.mainLens)}’
            {profile.secondaryLens && <> → ‘{lensName(profile.secondaryLens)}’</>} 해설을 추천해요.
          </li>
          {primary.howTo.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="course-teaser">
        <p className="eyebrow">추천 코스</p>
        <h2>{course.name}</h2>
        <p>{courseReasonText(recommended, profile, minutes)}</p>
        <p className="meta">
          유물 {course.artifacts.length}점 · 약 {formatMinutes(courseMinutes(content, course))}
          {course.minutes_estimated && ' (예상치)'}
        </p>
        <a className="btn btn-primary btn-large" href={href('/course')}>
          추천 코스 보기
        </a>
      </section>

      <div className="actions">
        <a className="btn btn-quiet" href={href('/quiz?q=0')}>
          답변 수정하기
        </a>
        <button
          type="button"
          className="btn btn-quiet"
          onClick={() => {
            resetAnswers();
            navigate('/quiz');
          }}
        >
          취향 다시 설정하기
        </button>
      </div>
      <p className="fineprint">이 분류는 성격 진단이 아니라 해설과 코스를 고르기 위한 기준이에요. 답변을 바꾸면 결과도 바로 다시 계산됩니다.</p>
    </main>
  );
}
