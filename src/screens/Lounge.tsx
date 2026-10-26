import { useId, useRef, useState } from 'react';
import { content, getArtifact, lensName, venue, type ScriptKey, type TasteKey } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';
import {
  favoritesOf,
  feed,
  hasSampleData,
  sampleCommentsOf,
  totalSavesOf,
  visitorsOf,
  type Me,
  type Post,
} from '../logic/community';
import { href, navigate } from '../router';
import { NOTE_MAX, useApp } from '../state/AppState';
import { COMMENT_MAX, useSocial } from '../state/useSocial';
import { ArtifactImage } from '../components/ArtifactImage';
import { Character } from '../components/Character';
import { SampleNotice } from '../components/Community';
import { BookmarkIcon, CommentIcon, FeedIcon, GridIcon, HeartIcon, PlusIcon } from '../components/Icons';

const isTaste = (v: string | undefined): v is TasteKey => !!v && content.tastes.some((t) => t.key === v);
const scriptName = (k: ScriptKey) => (k === 'base' ? '기본 해설' : `${lensName(k)} 해설`);
const shortDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
};

export function Lounge({ taste: param }: { taste?: string }) {
  const { profile, saved } = useApp();
  const social = useSocial();
  const me: Me = { taste: profile?.primary ?? null, saved };
  const taste: TasteKey | null = isTaste(param) ? param : null;
  const [view, setView] = useState<'feed' | 'grid'>('feed');
  const [composing, setComposing] = useState(false);
  const posts = feed(me, taste);
  const allPosts = feed(me);

  return (
    <main className="page lounge">
      <header className="lounge-top">
        <div>
          <p className="eyebrow">{venue.name}</p>
          <h1 className="display">라운지</h1>
        </div>
        <button type="button" className="btn btn-quiet btn-small new-post" onClick={() => setComposing((v) => !v)} aria-expanded={composing}>
          <PlusIcon />
          새 게시물
        </button>
      </header>

      {composing && <Composer onDone={() => setComposing(false)} />}

      <nav className="stories" aria-label="취향별로 보기">
        <button type="button" className={`story ${taste === null ? 'is-on' : ''}`} onClick={() => navigate('/lounge')} aria-pressed={taste === null}>
          <span className="story-ring">
            <span className="story-all">전체</span>
          </span>
          <span className="story-name">모두</span>
        </button>
        {content.tastes.map((t) => {
          const has = allPosts.some((p) => p.taste === t.key);
          return (
            <button
              key={t.key}
              type="button"
              className={`story ${taste === t.key ? 'is-on' : ''} ${has ? 'has-posts' : ''}`}
              onClick={() => navigate(`/lounge/${t.key}`)}
              aria-pressed={taste === t.key}
            >
              <span className="story-ring">
                <Character taste={t.key} size={56} decorative />
              </span>
              <span className="story-name">
                {tasteProfiles[t.key].character}
                {profile?.primary === t.key && <small> · 나</small>}
              </span>
            </button>
          );
        })}
      </nav>

      {taste && <TasteProfileHeader taste={taste} me={me} postCount={posts.length} />}

      <div className="view-tabs" role="tablist" aria-label="보기 방식">
        <button type="button" role="tab" aria-selected={view === 'feed'} className={view === 'feed' ? 'is-on' : ''} onClick={() => setView('feed')}>
          <FeedIcon />
          피드
        </button>
        <button type="button" role="tab" aria-selected={view === 'grid'} className={view === 'grid' ? 'is-on' : ''} onClick={() => setView('grid')}>
          <GridIcon />
          인기 작품
        </button>
      </div>

      {hasSampleData() && <SampleNotice />}

      {view === 'feed' ? (
        posts.length === 0 ? (
          <section className="empty lounge-empty">
            <h2>아직 게시물이 없어요</h2>
            <p>이 관람지의 첫 감상평을 남겨 보세요.</p>
            <button type="button" className="btn btn-primary" onClick={() => setComposing(true)}>
              새 게시물 쓰기
            </button>
          </section>
        ) : (
          <ul className="feed">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} social={social} />
            ))}
          </ul>
        )
      ) : (
        <PopularGrid taste={taste} me={me} />
      )}
    </main>
  );
}

function TasteProfileHeader({ taste, me, postCount }: { taste: TasteKey; me: Me; postCount: number }) {
  const p = tasteProfiles[taste];
  const top = favoritesOf(taste, content.artifacts, me, 1)[0];
  return (
    <section className="taste-profile" aria-live="polite">
      <Character taste={taste} size={88} />
      <div>
        <h2>
          {p.character} <span className="meta">{p.persona}</span>
        </h2>
        <dl className="profile-stats">
          <div>
            <dt>관람객</dt>
            <dd>{visitorsOf(taste, me)}</dd>
          </div>
          <div>
            <dt>게시물</dt>
            <dd>{postCount}</dd>
          </div>
          {top && top.count > 0 && (
            <div>
              <dt>최애 작품</dt>
              <dd className="is-text">
                <a href={href(`/artifact/${top.artifact.id}`)}>{top.artifact.name}</a>
              </dd>
            </div>
          )}
        </dl>
        <p className="speech">“{p.greeting}”</p>
      </div>
    </section>
  );
}

function PostCard({ post: p, social }: { post: Post; social: ReturnType<typeof useSocial> }) {
  const { isSaved, toggleSaved, saveNote } = useApp();
  const a = getArtifact(p.artifactId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  if (!a) return null;

  const liked = social.isLiked(p.id);
  const likeCount = p.likes + (liked ? 1 : 0);
  const sample = sampleCommentsOf(p.id);
  const mine = social.comments[p.id] ?? [];
  const commentCount = sample.length + mine.length;
  const saved = isSaved(a.id);
  const persona = tasteProfiles[p.taste];
  const long = p.text.length > 90;

  return (
    <li className={`post ${p.mine ? 'is-mine' : ''}`}>
      <header className="post-head">
        <span className="avatar">
          <Character taste={p.taste} size={36} decorative />
        </span>
        <div className="post-who">
          <strong>{p.nickname}</strong>
          {!p.mine && <span className="sample-tag">예시</span>}
          <a href={href(`/artifact/${a.id}${p.lens !== 'base' ? `?lens=${p.lens}` : ''}`)} className="post-place">
            {a.name}
          </a>
        </div>
        <span className="post-persona">{persona.persona}</span>
      </header>

      <a className="post-media" href={href(`/artifact/${a.id}${p.lens !== 'base' ? `?lens=${p.lens}` : ''}`)} aria-label={`${a.name} 보기`}>
        <ArtifactImage artifact={a} variant="card" />
        <span className="post-lens">{scriptName(p.lens)}</span>
      </a>

      <div className="post-actions">
        <button type="button" className={`icon-btn ${liked ? 'is-liked' : ''}`} aria-pressed={liked} aria-label={liked ? '좋아요 취소' : '좋아요'} onClick={() => social.toggleLike(p.id)}>
          <HeartIcon filled={liked} />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="댓글 달기"
          onClick={() => {
            setOpen(true);
            window.setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <CommentIcon />
        </button>
        <button type="button" className={`icon-btn push-right ${saved ? 'is-saved' : ''}`} aria-pressed={saved} aria-label={saved ? '저장 해제' : '내 기록에 저장'} onClick={() => toggleSaved(a.id, p.lens)}>
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      <div className="post-body">
        <p className="post-likes">좋아요 {likeCount}개</p>
        <p className={`post-caption ${long && !expanded ? 'is-clamped' : ''}`}>
          <strong>{p.nickname}</strong> {p.text}
        </p>
        {long && !expanded && (
          <button type="button" className="btn-plain" onClick={() => setExpanded(true)}>
            더 보기
          </button>
        )}
        {commentCount > 0 && !open && (
          <button type="button" className="btn-plain" onClick={() => setOpen(true)}>
            댓글 {commentCount}개 모두 보기
          </button>
        )}
        {open && (
          <ul className="comments">
            {sample.map((c) => (
              <li key={c.id}>
                <strong>{c.nickname}</strong> {c.text} <span className="sample-tag">예시</span>
              </li>
            ))}
            {mine.map((c) => (
              <li key={c.id}>
                <strong>나</strong> {c.text}{' '}
                <button type="button" className="btn-plain" onClick={() => social.removeComment(p.id, c.id)} aria-label="내 댓글 삭제">
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
        {p.date && <p className="post-date">{shortDate(p.date)}</p>}
        {p.mine &&
          (confirmDelete ? (
            <p className="post-confirm">
              게시물을 지울까요? 작품 저장은 남아요.{' '}
              <button type="button" className="btn-plain is-danger" onClick={() => saveNote(a.id, '', p.lens)}>
                지우기
              </button>{' '}
              <button type="button" className="btn-plain" onClick={() => setConfirmDelete(false)}>
                취소
              </button>
            </p>
          ) : (
            <button type="button" className="btn-plain" onClick={() => setConfirmDelete(true)}>
              게시물 삭제
            </button>
          ))}
      </div>

      {open && (
        <form
          className="comment-form"
          onSubmit={(e) => {
            e.preventDefault();
            social.addComment(p.id, draft);
            setDraft('');
          }}
        >
          <label htmlFor={inputId} className="visually-hidden">
            댓글
          </label>
          <input
            ref={inputRef}
            id={inputId}
            value={draft}
            maxLength={COMMENT_MAX}
            placeholder="댓글 달기…"
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" className="btn-plain is-accent" disabled={!draft.trim()}>
            게시
          </button>
        </form>
      )}
    </li>
  );
}

function PopularGrid({ taste, me }: { taste: TasteKey | null; me: Me }) {
  const tastes = content.tastes.map((t) => t.key);
  const ranked = content.artifacts
    .map((a, i) => ({ a, i, n: taste ? favoritesOf(taste, [a], me, 1)[0].count : totalSavesOf(a.id, tastes, me) }))
    .sort((x, y) => y.n - x.n || x.i - y.i);
  return (
    <section aria-label="인기 작품">
      <p className="meta grid-caption">{taste ? `${tasteProfiles[taste].persona}들이 많이 저장한 순` : '모든 관람객이 많이 저장한 순'}</p>
      <ul className="photo-grid">
        {ranked.map(({ a, n }, i) => (
          <li key={a.id}>
            <a href={href(`/artifact/${a.id}`)} aria-label={`${i + 1}위 ${a.name}, 저장 ${n}명`}>
              <ArtifactImage artifact={a} variant="card" />
              <span className="grid-overlay">
                <span className="grid-rank">{i + 1}</span>
                <span className="grid-count">
                  <BookmarkIcon filled /> {n}
                </span>
              </span>
              <span className="grid-name">{a.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Composer({ onDone }: { onDone: () => void }) {
  const { saved, saveNote, storageOk } = useApp();
  const [artifactId, setArtifactId] = useState(content.artifacts[0].id);
  const [lens, setLens] = useState<ScriptKey>('base');
  const [text, setText] = useState('');
  const existing = saved.find((s) => s.id === artifactId)?.note;

  return (
    <form
      className="composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        saveNote(artifactId, text, lens);
        setText('');
        onDone();
        navigate('/lounge');
      }}
    >
      <h2 className="h-small">새 게시물</h2>
      <div className="composer-row">
        <label className="field">
          <span>작품</span>
          <select id="compose-artifact" value={artifactId} onChange={(e) => setArtifactId(e.target.value)}>
            {content.artifacts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>어떤 해설을 보고</span>
          <select id="compose-lens" value={lens} onChange={(e) => setLens(e.target.value as ScriptKey)}>
            <option value="base">기본 해설</option>
            {content.lenses.map((l) => (
              <option key={l.key} value={l.key}>
                {l.name} 해설
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span>감상</span>
        <textarea
          id="compose-text"
          rows={4}
          maxLength={NOTE_MAX}
          value={text}
          placeholder="이 작품 앞에서 든 생각, 마음에 남은 장면을 나눠 주세요."
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {existing && <p className="meta">이 작품에 이미 쓴 감상평이 있어요. 올리면 새 글로 바뀌어요.</p>}
      <div className="note-foot">
        <span className="meta note-count">
          {text.length} / {NOTE_MAX}
        </span>
        <div className="actions">
          <button type="button" className="btn btn-text btn-small" onClick={onDone}>
            취소
          </button>
          <button type="submit" className="btn btn-primary btn-small" disabled={!text.trim()}>
            올리기
          </button>
        </div>
      </div>
      <p className="fineprint">
        {storageOk
          ? '게시물은 내 감상평으로도 저장돼요. 지금은 서버가 없어 이 브라우저에서만 보입니다.'
          : '이 브라우저에서는 기록을 저장할 수 없어요.'}
      </p>
    </form>
  );
}
