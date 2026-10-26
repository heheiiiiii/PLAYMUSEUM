import { useState } from 'react';
import { venueContent, venueKindName, venues, type Venue } from '../content';
import { navigate } from '../router';
import { useVenue } from '../state/Venue';

type Filter = 'all' | 'museum' | 'art';

export function Venues() {
  const { venueId, switchVenue } = useVenue();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const q = query.trim();
  const list = venues
    .filter((v) => filter === 'all' || v.kind === filter)
    .filter((v) => !q || v.name.includes(q) || v.city.includes(q))
    .sort((a, b) => Number(b.status === 'open') - Number(a.status === 'open'));

  const choose = (v: Venue) => {
    if (v.id === venueId || switchVenue(v.id)) navigate('/');
  };

  return (
    <main className="page narrow venues">
      <header className="list-head">
        <p className="eyebrow">관람지 고르기</p>
        <h1 className="display">어디로 관람 가세요?</h1>
        <p className="lede">고른 곳의 작품과 코스, 해설로 바뀝니다. 취향 테스트 결과는 어디서나 그대로 쓰여요.</p>
      </header>

      <div className="venue-tools">
        <label className="visually-hidden" htmlFor="venue-search">
          관람지 검색
        </label>
        <input
          id="venue-search"
          type="search"
          className="search"
          placeholder="이름이나 지역으로 찾기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="segmented" role="group" aria-label="종류">
          {(
            [
              ['all', '전체'],
              ['museum', '박물관'],
              ['art', '미술관'],
            ] as [Filter, string][]
          ).map(([k, label]) => (
            <button key={k} type="button" aria-pressed={filter === k} className={filter === k ? 'is-on' : ''} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="meta">‘{q}’에 맞는 관람지가 없어요.</p>
      ) : (
        <ul className="venue-list">
          {list.map((v) => {
            const c = venueContent(v.id);
            const open = v.status === 'open' && !!c;
            const current = v.id === venueId;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  className={`venue ${current ? 'is-current' : ''} ${open ? '' : 'is-soon'}`}
                  disabled={!open}
                  onClick={() => choose(v)}
                  aria-current={current || undefined}
                >
                  <span className={`venue-kind kind-${v.kind}`}>{venueKindName(v)}</span>
                  <span className="venue-body">
                    <strong>{v.name}</strong>
                    <span className="meta">{v.city}</span>
                    {open && c ? (
                      <span className="venue-stats">
                        작품 {c.artifacts.length}점 · 코스 {c.courses.length}개{v.blurb && ` · ${v.blurb}`}
                      </span>
                    ) : (
                      <span className="venue-stats">해설 준비 중</span>
                    )}
                  </span>
                  <span className="venue-state">{current ? '관람 중' : open ? '선택' : '준비 중'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="fineprint">관람지는 계속 늘어납니다. 저장한 작품과 모은 문장은 관람지마다 따로 기록돼요.</p>
    </main>
  );
}
