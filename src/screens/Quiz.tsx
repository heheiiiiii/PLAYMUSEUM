import { useEffect, useRef, useState } from 'react';
import { quiz } from '../data/quiz';
import { isComplete } from '../logic/scoring';
import { navigate } from '../router';
import { useApp } from '../state/AppState';

export function Quiz({ startAt }: { startAt?: number }) {
  const { answers, setAnswer } = useApp();
  const firstOpen = quiz.findIndex((q) => !answers[q.id]);
  const [index, setIndex] = useState(() =>
    startAt != null ? Math.min(Math.max(startAt, 0), quiz.length - 1) : firstOpen === -1 ? 0 : firstOpen,
  );
  const q = quiz[index];
  const chosen = answers[q.id];
  const done = isComplete(quiz, answers);
  const answered = quiz.filter((x) => answers[x.id]).length;
  const isLast = index === quiz.length - 1;
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [index]);

  const choose = (optionId: string) => {
    setAnswer(q.id, optionId);
  };

  const next = () => {
    if (!isLast) setIndex(index + 1);
    else if (done) navigate('/result');
  };

  return (
    <main className="page narrow quiz">
      <div className="quiz-top">
        <button type="button" className="btn btn-text" onClick={() => (index === 0 ? navigate('/') : setIndex(index - 1))}>
          ← {index === 0 ? '나가기' : '이전 질문'}
        </button>
        <span className="quiz-count">
          {index + 1} / {quiz.length}
        </span>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label="답한 질문"
        aria-valuemin={0}
        aria-valuemax={quiz.length}
        aria-valuenow={answered}
      >
        {quiz.map((x, i) => (
          <button
            key={x.id}
            type="button"
            className={`progress-step ${answers[x.id] ? 'is-done' : ''} ${i === index ? 'is-current' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`${i + 1}번 질문${answers[x.id] ? ' (답함)' : ''}`}
          />
        ))}
      </div>

      <h1 className="quiz-q" tabIndex={-1} ref={heading}>
        {q.prompt}
      </h1>
      {q.hint && <p className="meta">{q.hint}</p>}

      <div className="options" role="radiogroup" aria-label={q.prompt}>
        {q.options.map((o) => {
          const selected = chosen === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`option ${selected ? 'is-selected' : ''}`}
              onClick={() => choose(o.id)}
            >
              <span className="option-mark" aria-hidden="true" />
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>

      <div className="quiz-bottom">
        {isLast ? (
          <>
            <button type="button" className="btn btn-primary btn-large" disabled={!done} onClick={next}>
              결과 보기
            </button>
            {!done && <p className="meta">답하지 않은 질문이 {quiz.length - answered}개 있어요. 위 막대를 눌러 이동할 수 있어요.</p>}
          </>
        ) : (
          <button type="button" className="btn btn-primary btn-large" disabled={!chosen} onClick={next}>
            다음 질문
          </button>
        )}
      </div>
    </main>
  );
}
