// 관람 리포트 공유 카드 (인스타그램 스토리 크기 1080×1920 PNG).
// 화면 테마와 관계없이 늘 같은 색으로 그린다.

export interface CardData {
  persona: string;
  character: string;
  greeting: string;
  /** 캐릭터 SVG 문서 문자열 */
  characterSvg: string;
  /** 캐릭터 몸 색 (배경 원에 쓴다) */
  tint: string;
  /** 한 줄 요약 */
  insight: string;
  /** 오래 본 관점 상위 3개 */
  lenses: { name: string; share: number }[];
  quote: { text: string; source: string } | null;
  stats: { label: string; value: number }[];
  date: string;
  url: string;
}

export const CARD_W = 1080;
export const CARD_H = 1920;

const C = {
  paper: '#f0f0ea',
  ink: '#1c211e',
  soft: '#59615b',
  line: '#d6d8cf',
  celadon: '#2f6a5d',
  seal: '#a8362a',
  white: '#fafaf6',
};
const SERIF = "'Gowun Batang', 'Nanum Myeongjo', 'AppleMyungjo', serif";
const SANS = "'IBM Plex Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

/** 글자 폭을 재서 줄을 나눈다. 띄어쓰기 단위로 나누고, 한 단어가 너무 길면 글자 단위로 자른다. */
export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  let line = '';
  const push = (l: string) => lines.push(l);
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) push(line);
    line = '';
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      continue;
    }
    let chunk = '';
    for (const ch of word) {
      if (ctx.measureText(chunk + ch).width > maxWidth) {
        push(chunk);
        chunk = ch;
      } else chunk += ch;
    }
    line = chunk;
  }
  if (line) push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }
  return lines;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

async function ensureFonts() {
  if (!document.fonts?.load) return;
  await Promise.allSettled([
    document.fonts.load(`700 80px 'Gowun Batang'`, '관람'),
    document.fonts.load(`400 40px 'Gowun Batang'`, '관람'),
    document.fonts.load(`500 36px 'IBM Plex Sans KR'`, '관람'),
    document.fonts.load(`400 30px 'IBM Plex Sans KR'`, '관람'),
    document.fonts.load(`500 28px 'IBM Plex Mono'`, 'PLAY'),
  ]);
}

export async function drawShareCard(canvas: HTMLCanvasElement, d: CardData): Promise<void> {
  await ensureFonts();
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  const M = 96; // 좌우 여백
  const W = CARD_W - M * 2;

  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // 머리: 낙관 + 워드마크 + 날짜
  ctx.fillStyle = C.seal;
  ctx.beginPath();
  ctx.roundRect(M, 96, 64, 64, 8);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.font = `700 40px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('觀', M + 32, 130);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.ink;
  ctx.font = `500 30px ${MONO}`;
  ctx.fillText('P L A Y M U S E U M', M + 88, 130);
  ctx.textAlign = 'right';
  ctx.fillStyle = C.soft;
  ctx.font = `400 26px ${SANS}`;
  ctx.fillText(d.date, CARD_W - M, 130);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // 세로 배치(px): 머리 96–160 · 캐릭터 210–610 · 취향 690–900 · 요약·막대 940–1290
  // · 모은 문장 ~1290–1560 · 숫자 1590–1730 · 꼬리 1810–1860
  const STATS_TOP = 1590;

  // 캐릭터
  const cx = CARD_W / 2;
  const cy = 410;
  ctx.fillStyle = d.tint;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(cx, cy, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  try {
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(d.characterSvg)}`;
    const img = await loadImage(url);
    ctx.drawImage(img, cx - 190, cy - 200, 380, 380);
  } catch {
    /* 캐릭터 그림 없이도 카드는 완성된다 */
  }

  // 취향 이름
  ctx.textAlign = 'center';
  ctx.fillStyle = C.celadon;
  ctx.font = `500 30px ${SANS}`;
  ctx.fillText('나의 관람 취향', cx, 690);
  ctx.fillStyle = C.ink;
  ctx.font = `700 96px ${SERIF}`;
  ctx.fillText(d.persona, cx, 788);
  ctx.fillStyle = C.soft;
  ctx.font = `400 34px ${SERIF}`;
  for (const [i, l] of wrapText(ctx, `${d.character}: “${d.greeting}”`, W, 2).entries()) ctx.fillText(l, cx, 852 + i * 46);
  ctx.textAlign = 'left';

  let y = 940;
  const rule = (at: number) => {
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(M, at);
    ctx.lineTo(CARD_W - M, at);
    ctx.stroke();
  };
  rule(y);
  y += 62;

  // 실제 관람 요약 + 관점 막대
  ctx.fillStyle = C.ink;
  ctx.font = `500 36px ${SANS}`;
  for (const l of wrapText(ctx, d.insight, W, 2)) {
    ctx.fillText(l, M, y);
    y += 50;
  }
  y += 10;
  const labelW = 230;
  for (const l of d.lenses) {
    ctx.fillStyle = C.soft;
    ctx.font = `400 28px ${SANS}`;
    ctx.fillText(l.name, M, y + 10);
    const bx = M + labelW;
    const bw = W - labelW - 110;
    ctx.fillStyle = C.line;
    ctx.beginPath();
    ctx.roundRect(bx, y - 8, bw, 16, 8);
    ctx.fill();
    ctx.fillStyle = C.celadon;
    ctx.beginPath();
    ctx.roundRect(bx, y - 8, Math.max(16, bw * l.share), 16, 8);
    ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = `500 28px ${MONO}`;
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(l.share * 100)}%`, CARD_W - M, y + 10);
    ctx.textAlign = 'left';
    y += 50;
  }

  // 모은 문장: 숫자 줄 위에 남은 자리만큼 줄 수를 정한다
  if (d.quote) {
    y += 16;
    rule(y);
    y += 70;
    const LINE = 58;
    // 마지막 줄 아래 출처(+58)까지 STATS_TOP - 30 안에 들어야 한다
    const room = Math.floor((STATS_TOP - 30 - y) / LINE);
    ctx.font = `400 40px ${SERIF}`;
    const lines = wrapText(ctx, d.quote.text, W - 70, Math.max(1, Math.min(4, room)));
    ctx.fillStyle = C.celadon;
    ctx.font = `700 110px ${SERIF}`;
    ctx.fillText('“', M - 8, y + 36);
    ctx.fillStyle = C.ink;
    ctx.font = `400 40px ${SERIF}`;
    for (const l of lines) {
      ctx.fillText(l, M + 70, y);
      y += LINE;
    }
    ctx.fillStyle = C.soft;
    ctx.font = `400 26px ${SANS}`;
    ctx.fillText(`— ${d.quote.source}`, M + 70, y);
  }

  // 숫자
  rule(STATS_TOP);
  const colW = W / d.stats.length;
  d.stats.forEach((s, i) => {
    const x = M + colW * i + colW / 2;
    ctx.textAlign = 'center';
    ctx.fillStyle = C.ink;
    ctx.font = `700 64px ${SERIF}`;
    ctx.fillText(String(s.value), x, STATS_TOP + 90);
    ctx.fillStyle = C.soft;
    ctx.font = `400 26px ${SANS}`;
    ctx.fillText(s.label, x, STATS_TOP + 132);
  });

  // 꼬리
  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink;
  ctx.font = `400 32px ${SERIF}`;
  ctx.fillText('같은 유물도, 당신의 취향에 따라 새로운 이야기가 됩니다.', cx, CARD_H - 110);
  ctx.fillStyle = C.soft;
  ctx.font = `500 24px ${MONO}`;
  ctx.fillText(d.url, cx, CARD_H - 64);
  ctx.textAlign = 'left';
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  );
}
