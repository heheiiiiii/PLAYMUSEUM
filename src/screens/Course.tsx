import { useState } from 'react';
import { content, getCourse, getTaste, lensName, type Artifact, type Course as CourseT } from '../content';
import { TIME_OPTIONS } from '../config';
import { courseMinutes, visibleStops } from '../logic/courses';
import { href } from '../router';
import { useApp } from '../state/AppState';
import { ArtifactImage } from '../components/ArtifactImage';
import { floorRoom, formatMinutes, LensBadge, OnViewNote } from '../components/ui';
import { courseReasonText } from './courseText';

export function Course() {
  const { profile, recommended, minutes, setMinutes, chosenCourseId, chooseCourse, isSaved } = useApp();
  const [fitOnly, setFitOnly] = useState(false);
  const chosen = chosenCourseId ? getCourse(chosenCourseId) : undefined;
  const course = chosen ?? recommended.course;
  const isRecommended = course.id === recommended.course.id;
  const stops = visibleStops(content, course);
  const est = courseMinutes(content, course);
  const skipped = course.artifacts.length - stops.length;

  const others = content.courses
    .filter((c) => c.id !== course.id)
    .filter((c) => !fitOnly || courseMinutes(content, c) <= minutes);

  return (
    <main className="page course">
      <div className="course-layout">
        <div className="course-main">
          {!profile && (
            <aside className="banner">
              <p>취향 테스트를 하면 관심사에 맞춘 코스와 해설 순서를 골라 드려요.</p>
              <a className="btn btn-primary btn-small" href={href('/quiz')}>
                취향 테스트 하기
              </a>
            </aside>
          )}

          <fieldset className="time-picker">
            <legend>오늘 관람할 수 있는 시간</legend>
            <div className="segmented">
              {TIME_OPTIONS.map((m, i) => (
                <label key={m} className={minutes === m ? 'is-on' : ''}>
                  <input
                    type="radio"
                    name="minutes"
                    id={`minutes-${m}`}
                    checked={minutes === m}
                    onChange={() => setMinutes(m)}
                  />
                  {i === TIME_OPTIONS.length - 1 ? `${formatMinutes(m)} 이상` : formatMinutes(m)}
                </label>
              ))}
            </div>
          </fieldset>

          <header className="course-head">
            <p className="eyebrow">{isRecommended ? (profile ? '나에게 맞춘 코스' : '추천 코스') : '직접 고른 코스'}</p>
            <h1 className="display">{course.name}</h1>
            {isRecommended ? (
              <p className="lede">{courseReasonText(recommended, profile, minutes)}</p>
            ) : (
              <p className="lede">
                {course.lens ? `‘${lensName(course.lens)}’ 관점으로 엮은 코스예요.` : '관점을 정하지 않고 고른 코스예요.'}{' '}
                <button type="button" className="btn-link" onClick={() => chooseCourse(null)}>
                  추천 코스로 돌아가기
                </button>
              </p>
            )}
            <dl className="course-facts">
              <div>
                <dt>예상 시간</dt>
                <dd>
                  약 {formatMinutes(est)}
                  {course.minutes_estimated && <small> 예상치</small>}
                </dd>
              </div>
              <div>
                <dt>유물</dt>
                <dd>{stops.length}점</dd>
              </div>
              <div>
                <dt>층</dt>
                <dd>{[...new Set(stops.map((a) => a.location.floor))].join(' · ')}층</dd>
              </div>
            </dl>
            {est > minutes && (
              <p className="notice">선택한 관람 시간({formatMinutes(minutes)})보다 길 수 있어요. 일부 유물은 건너뛰어도 괜찮아요.</p>
            )}
            {course.notice && <p className="notice">{course.notice}</p>}
            {skipped > 0 && <p className="notice">지금 전시하지 않는 유물 {skipped}점은 코스에서 뺐어요.</p>}
            {course.sound_default && (
              <p className="notice">사운드와 함께 보는 코스예요. 유물 화면에서 재생 버튼을 누르면 다음 유물에서도 이어집니다.</p>
            )}
          </header>

          <ol className="stops">
            {stops.map((a, i) => (
              <StopCard key={a.id} artifact={a} n={i + 1} course={course} saved={isSaved(a.id)} />
            ))}
          </ol>

          {stops[0] && (
            <a className="btn btn-primary btn-large btn-block" href={href(`/artifact/${stops[0].id}?course=${course.id}`)}>
              첫 번째 유물부터 관람 시작
            </a>
          )}
        </div>

        <aside className="course-side" aria-labelledby="others-title">
          <h2 id="others-title" className="h-small">
            다른 코스
          </h2>
          <label className="check">
            <input type="checkbox" id="fit-only" checked={fitOnly} onChange={(e) => setFitOnly(e.target.checked)} />
            {formatMinutes(minutes)} 안에 끝나는 코스만
          </label>
          {others.length === 0 && <p className="meta">조건에 맞는 다른 코스가 없어요.</p>}
          <ul className="course-list">
            {others.map((c) => (
              <OtherCourse key={c.id} course={c} onChoose={() => chooseCourse(c.id === recommended.course.id ? null : c.id)} />
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}

function StopCard({ artifact: a, n, course, saved }: { artifact: Artifact; n: number; course: CourseT; saved: boolean }) {
  const { profile } = useApp();
  const main = profile && a.strong_lenses.includes(profile.mainLens);
  const sec = profile?.secondaryLens && a.strong_lenses.includes(profile.secondaryLens);
  return (
    <li className="stop">
      <a href={href(`/artifact/${a.id}?course=${course.id}`)} className="stop-link">
        <span className="stop-n">{n}</span>
        <ArtifactImage artifact={a} variant="card" />
        <div className="stop-body">
          <p className="meta">
            {floorRoom(a)} · {a.era}
          </p>
          <h3>{a.name}</h3>
          <p className="stop-intro">{a.base.sentences[0]?.text}</p>
          <div className="chips">
            {main && <LensBadge lens={profile!.mainLens} kind="main" />}
            {sec && <LensBadge lens={profile!.secondaryLens!} kind="secondary" />}
            <OnViewNote artifact={a} />
            {saved && <span className="status-chip is-saved">저장함</span>}
          </div>
        </div>
      </a>
    </li>
  );
}

function OtherCourse({ course: c, onChoose }: { course: CourseT; onChoose: () => void }) {
  const tag = c.taste ? getTaste(c.taste)?.label : c.lens ? `${lensName(c.lens)} 관점` : '관점 없음';
  return (
    <li>
      <div>
        <strong>{c.name}</strong>
        <span className="meta">
          {tag} · {visibleStops(content, c).length}점 · 약 {formatMinutes(courseMinutes(content, c))}
        </span>
      </div>
      <button type="button" className="btn btn-quiet btn-small" onClick={onChoose}>
        이 코스로 보기
      </button>
    </li>
  );
}
