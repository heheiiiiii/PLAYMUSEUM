import type { ReactNode } from 'react';
import type { TasteKey } from '../content';
import { tasteProfiles } from '../data/tasteProfiles';

// 취향별 캐릭터. 모두 달항아리 몸에 취향을 드러내는 소품을 하나씩 들고 있다.
// 색은 캐릭터 고유색이라 라이트·다크 모드 모두 같은 값을 쓴다(선과 얼굴은 어두운 고정색).

const LINE = '#2a2f2c';
const WHITE = '#fffdf8';
/** 몸 바깥에 놓이는 선·글자. 다크 모드에서 밝아지도록 CSS 변수를 쓴다. */
const OUTER = { fill: 'var(--char-outer)' };
const OUTER_STROKE = { stroke: 'var(--char-outer)' };

interface Look {
  body: string;
  shade: string;
  /** 몸 뒤에 그릴 것 */
  back?: ReactNode;
  /** 얼굴(눈·입). 없으면 기본 얼굴 */
  face?: ReactNode;
  /** 몸 위에 그릴 것 */
  front?: ReactNode;
}

const eyes = (
  <>
    <circle cx="48" cy="64" r="3.4" fill={LINE} />
    <circle cx="72" cy="64" r="3.4" fill={LINE} />
    <circle cx="49.2" cy="62.8" r="1" fill={WHITE} />
    <circle cx="73.2" cy="62.8" r="1" fill={WHITE} />
  </>
);
const smile = <path d="M55 73.5 Q60 78 65 73.5" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />;
const cheeks = (color: string) => (
  <>
    <ellipse cx="40" cy="72" rx="5" ry="3" fill={color} opacity="0.55" />
    <ellipse cx="80" cy="72" rx="5" ry="3" fill={color} opacity="0.55" />
  </>
);

const looks: Record<TasteKey, Look> = {
  // 소곤: 갓을 쓰고 귓속말하는 이야기 수집가
  people: {
    body: '#f1c7ae',
    shade: '#dba78a',
    face: (
      <>
        <circle cx="48" cy="64" r="3.4" fill={LINE} />
        <circle cx="49.2" cy="62.8" r="1" fill={WHITE} />
        <path d="M68.5 64.5 Q72 61 75.5 64.5" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        <path d="M56 74 Q61 77.5 65 73" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        {cheeks('#e0796a')}
      </>
    ),
    front: (
      <>
        <ellipse cx="60" cy="23" rx="35" ry="6" fill={LINE} fillOpacity="0.88" strokeWidth="1.4" style={OUTER_STROKE} />
        <path d="M48 22 C48 7 72 7 72 22 Z" fill={LINE} fillOpacity="0.92" strokeWidth="1.4" style={OUTER_STROKE} />
        <rect x="48" y="18" width="24" height="3" fill="#7a5a3a" />
        <ellipse cx="88" cy="79" rx="5" ry="7" transform="rotate(-30 88 79)" fill="#f1c7ae" stroke={LINE} strokeWidth="2" />
        <g transform="translate(86 28)">
          <rect x="0" y="0" width="28" height="17" rx="8.5" fill={WHITE} stroke={LINE} strokeWidth="1.8" />
          <path d="M6 16 L3 23 L12 16.5" fill={WHITE} stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="8" cy="8.5" r="1.8" fill={LINE} />
          <circle cx="14" cy="8.5" r="1.8" fill={LINE} />
          <circle cx="20" cy="8.5" r="1.8" fill={LINE} />
        </g>
      </>
    ),
  },
  // 두루: 동그란 안경을 쓰고 연표 두루마리를 펼친 시대 추적자
  history: {
    body: '#e9d49c',
    shade: '#cdb576',
    face: (
      <>
        {eyes}
        <circle cx="48" cy="64" r="7.5" fill="none" stroke={LINE} strokeWidth="1.8" />
        <circle cx="72" cy="64" r="7.5" fill="none" stroke={LINE} strokeWidth="1.8" />
        <path d="M55.5 63 Q60 60.5 64.5 63" fill="none" stroke={LINE} strokeWidth="1.8" />
        {smile}
        {cheeks('#d98b5f')}
      </>
    ),
    front: (
      <g>
        <rect x="24" y="82" width="72" height="15" rx="2" fill="#f7efd9" stroke={LINE} strokeWidth="1.8" />
        <rect x="18" y="80" width="8" height="19" rx="4" fill="#b88a55" stroke={LINE} strokeWidth="1.8" />
        <rect x="94" y="80" width="8" height="19" rx="4" fill="#b88a55" stroke={LINE} strokeWidth="1.8" />
        <line x1="32" y1="89.5" x2="88" y2="89.5" stroke={LINE} strokeWidth="1.4" />
        <circle cx="38" cy="89.5" r="2.2" fill="#a8362a" />
        <circle cx="54" cy="89.5" r="2.2" fill={LINE} />
        <circle cx="70" cy="89.5" r="2.2" fill={LINE} />
        <circle cx="84" cy="89.5" r="2.2" fill="#2f6a5d" />
      </g>
    ),
  },
  // 청이: 비색 몸에 구름·학 무늬, 돋보기를 든 미감 탐닉자
  craft: {
    body: '#a9cdbf',
    shade: '#86b3a2',
    back: (
      <g fill="none" stroke={WHITE} strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <path d="M28 84 q4 -5 8 0 q4 -5 8 0" />
        <path d="M70 94 q3 -4 6 0 q3 -4 6 0" />
        <path d="M30 50 l7 4 l7 -4 M37 54 l0 5" />
      </g>
    ),
    face: (
      <>
        {eyes}
        <path d="M55 73 Q60 79 65 73" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        {cheeks('#e48a7e')}
      </>
    ),
    front: (
      <g>
        <line x1="101" y1="70" x2="110" y2="83" stroke="#7a5a3a" strokeWidth="4" strokeLinecap="round" />
        <circle cx="96" cy="62" r="10" fill={WHITE} fillOpacity="0.55" stroke={LINE} strokeWidth="2.2" />
        <path d="M91 58 q3 -3 6 -2" fill="none" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M104 34 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" fill="#e3b94c" />
      </g>
    ),
  },
  // 아리: 외알 안경과 등불을 든 미스터리 탐험가
  mystery: {
    body: '#a2abcb',
    shade: '#7f89ad',
    face: (
      <>
        {eyes}
        <circle cx="72" cy="64" r="7.5" fill={WHITE} fillOpacity="0.35" stroke="#c9a44a" strokeWidth="2" />
        <path d="M79 68 q6 8 2 18" fill="none" stroke="#c9a44a" strokeWidth="1.4" />
        <path d="M43 56.5 l9 -2" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        <path d="M56.5 74.5 h7" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        {cheeks('#d77b86')}
      </>
    ),
    front: (
      <g>
        <ellipse cx="22" cy="74" rx="6" ry="8.5" transform="rotate(20 22 74)" fill="#a2abcb" stroke={LINE} strokeWidth="2" />
        <line x1="17" y1="80" x2="13" y2="86" stroke={LINE} strokeWidth="1.8" />
        <circle cx="12" cy="96" r="11" fill="#f2d27a" opacity="0.35" />
        <rect x="5" y="86" width="14" height="18" rx="4" fill="#f2d27a" stroke={LINE} strokeWidth="1.8" />
        <line x1="5" y1="92" x2="19" y2="92" stroke={LINE} strokeWidth="1.2" />
        <line x1="5" y1="98" x2="19" y2="98" stroke={LINE} strokeWidth="1.2" />
        <text x="92" y="40" fontFamily="Georgia, serif" fontSize="26" fontWeight="700" style={OUTER}>
          ?
        </text>
      </g>
    ),
  },
  // 반이: 머릿수건을 두르고 밥그릇을 든 생활 공감가
  daily: {
    body: '#ecc4bb',
    shade: '#d5a297',
    face: (
      <>
        {eyes}
        {smile}
        {cheeks('#e0796a')}
      </>
    ),
    front: (
      <g>
        <path d="M44 33 C52 30 68 30 76 33 L77 40 C68 37 52 37 43 40 Z" fill="#5f8a6f" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M76 36 l9 -5 l-1 10 z" fill="#5f8a6f" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
        <g fill="none" stroke={LINE} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
          <path d="M52 84 q-2 -3 0 -5" />
          <path d="M60 83 q-2 -3 0 -5" />
          <path d="M68 84 q-2 -3 0 -5" />
        </g>
        <path d="M46 90 a14 6 0 0 1 28 0 Z" fill={WHITE} stroke={LINE} strokeWidth="1.8" />
        <path d="M42 90 H78 C77 101 43 101 42 90 Z" fill="#f7efd9" stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M48 94 H72" stroke="#2f6a5d" strokeWidth="1.6" />
      </g>
    ),
  },
  // 가락: 헤드폰을 끼고 눈을 감은 감각 몰입가
  music: {
    body: '#cfc2e4',
    shade: '#ad9dcb',
    face: (
      <>
        <path d="M44.5 64.5 Q48 67.5 51.5 64.5" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        <path d="M68.5 64.5 Q72 67.5 75.5 64.5" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        <path d="M55 73.5 Q60 78.5 65 73.5" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        {cheeks('#e0796a')}
      </>
    ),
    front: (
      <g>
        <path d="M24 58 C22 14 98 14 96 58" fill="none" strokeWidth="4" strokeLinecap="round" style={OUTER_STROKE} />
        <rect x="15" y="50" width="12" height="20" rx="5" fill="#2f6a5d" stroke={LINE} strokeWidth="1.8" />
        <rect x="93" y="50" width="12" height="20" rx="5" fill="#2f6a5d" stroke={LINE} strokeWidth="1.8" />
        <g style={{ ...OUTER, ...OUTER_STROKE }} strokeWidth="1.8">
          <path d="M100 26 v12" />
          <ellipse cx="97.5" cy="38.5" rx="3.4" ry="2.6" stroke="none" />
          <path d="M100 26 q6 2 6 8" fill="none" style={OUTER_STROKE} />
          <path d="M14 30 v10 M22 28 v10 M14 30 L22 28" fill="none" style={OUTER_STROKE} />
          <ellipse cx="11.5" cy="40.5" rx="3" ry="2.3" stroke="none" />
          <ellipse cx="19.5" cy="38.5" rx="3" ry="2.3" stroke="none" />
        </g>
      </g>
    ),
  },
};

/** 캐릭터 몸 색 */
export const characterTint = (taste: TasteKey) => looks[taste].body;

const BODY = 'M47 24 H73 V31 C90 35 103 48 103 66 C103 88 85 105 60 105 C35 105 17 88 17 66 C17 48 30 35 47 31 Z';

export function Character({ taste, size = 96, decorative = false }: { taste: TasteKey; size?: number; decorative?: boolean }) {
  const look = looks[taste];
  const p = tasteProfiles[taste];
  return (
    <svg
      className="character"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `${p.character} (${p.persona})`}
    >
      <ellipse cx="60" cy="111" rx="30" ry="4" fill={LINE} opacity="0.12" />
      <rect x="45" y="101" width="30" height="7" rx="2.5" fill={look.shade} stroke={LINE} strokeWidth="2" />
      <path d={BODY} fill={look.body} stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M86 46 C95 54 98 66 95 78" fill="none" stroke={WHITE} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="60" cy="24.5" rx="13" ry="2.8" fill={look.shade} stroke={LINE} strokeWidth="1.6" />
      {look.back}
      {look.face ?? (
        <>
          {eyes}
          {smile}
        </>
      )}
      {look.front}
    </svg>
  );
}
