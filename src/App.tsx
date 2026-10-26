import { href, useRoute } from './router';
import { useApp } from './state/AppState';
import { MiniPlayer } from './components/SoundPlayer';
import { Home } from './screens/Home';
import { Quiz } from './screens/Quiz';
import { Result } from './screens/Result';
import { Course } from './screens/Course';
import { Artifacts } from './screens/Artifacts';
import { Artifact } from './screens/Artifact';
import { Records } from './screens/Records';
import { NotFound } from './screens/NotFound';
import { Lounge } from './screens/Lounge';

type Section = 'home' | 'course' | 'artifacts' | 'lounge' | 'records' | 'quiz';

export function App() {
  const { parts, query } = useRoute();
  const { saved } = useApp();
  const [first = '', second] = parts;

  let screen;
  let section: Section | null = null;
  switch (first) {
    case '':
      screen = <Home />;
      section = 'home';
      break;
    case 'quiz': {
      const q = query.get('q');
      screen = <Quiz key={q ?? 'quiz'} startAt={q != null ? Number(q) || 0 : undefined} />;
      section = 'quiz';
      break;
    }
    case 'result':
      screen = <Result />;
      section = 'course';
      break;
    case 'course':
      screen = <Course />;
      section = 'course';
      break;
    case 'artifacts':
      screen = <Artifacts />;
      section = 'artifacts';
      break;
    case 'artifact':
      screen = second ? <Artifact id={second} query={query} /> : <NotFound />;
      section = query.get('course') ? 'course' : 'artifacts';
      break;
    case 'lounge':
      screen = <Lounge taste={second} />;
      section = 'lounge';
      break;
    case 'records':
      screen = <Records />;
      section = 'records';
      break;
    default:
      screen = <NotFound />;
  }

  const links: { key: Section; to: string; label: string }[] = [
    { key: 'home', to: '/', label: '홈' },
    { key: 'course', to: '/course', label: '코스' },
    { key: 'artifacts', to: '/artifacts', label: '유물' },
    { key: 'lounge', to: '/lounge', label: '라운지' },
    { key: 'records', to: '/records', label: '기록' },
  ];
  const focusMode = section === 'quiz';

  return (
    <div className={`shell ${focusMode ? 'is-focus' : ''}`}>
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          // 해시 라우터가 #main 을 경로로 읽지 않도록 직접 초점만 옮긴다.
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        본문으로 건너뛰기
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="wordmark" href={href('/')} aria-label="PLAYMUSEUM 처음 화면">
            <span className="seal" aria-hidden="true">
              觀
            </span>
            PLAYMUSEUM
          </a>
          {!focusMode && (
            <nav className="nav" aria-label="주요 메뉴">
              {links.slice(1).map((l) => (
                <a key={l.key} href={href(l.to)} aria-current={section === l.key ? 'page' : undefined}>
                  {l.label}
                  {l.key === 'records' && saved.length > 0 && <span className="count">{saved.length}</span>}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>
      <div id="main" className="main" tabIndex={-1}>
        {screen}
      </div>
      <div className="dock">
        <MiniPlayer />
        {!focusMode && (
          <nav className="tabbar" aria-label="하단 메뉴">
            {links.map((l) => (
              <a key={l.key} href={href(l.to)} aria-current={section === l.key ? 'page' : undefined}>
                {l.label}
                {l.key === 'records' && saved.length > 0 && <span className="count">{saved.length}</span>}
              </a>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
