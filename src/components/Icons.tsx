// 라운지 아이콘 (선 굵기 1.8, currentColor)
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
  </svg>
);
export const CommentIcon = () => (
  <svg {...base} aria-hidden="true">
    <path d="M20 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.2A8 8 0 1 1 20 11.5z" />
  </svg>
);
export const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg {...base} fill={filled ? 'currentColor' : 'none'} aria-hidden="true">
    <path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" />
  </svg>
);
export const PlusIcon = () => (
  <svg {...base} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);
export const GridIcon = () => (
  <svg {...base} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
    <path d="M9.2 3.5v17M14.8 3.5v17M3.5 9.2h17M3.5 14.8h17" />
  </svg>
);
export const FeedIcon = () => (
  <svg {...base} aria-hidden="true">
    <rect x="4" y="3.5" width="16" height="11" rx="1.5" />
    <path d="M4 18h16M4 21h10" />
  </svg>
);
