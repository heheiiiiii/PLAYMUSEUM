// Claude 아티팩트용 페이지를 만든다. `npm run build` 결과(dist/)를 읽어
// CSS·JS를 한 파일에 넣고, 아티팩트가 감싸 주는 문서 뼈대(<html>, <head>, <body>)는 뺀다.
// 이미지·음원은 dist/media 를 그대로 함께 올린다(상대 경로 media/...).
// Usage: npm run build:artifact  → dist-artifact/index.html
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const out = new URL('../dist-artifact/', import.meta.url);
const html = readFileSync(new URL('index.html', dist), 'utf8');

const pick = (re) => [...html.matchAll(re)].map((m) => m[1]);
const scripts = pick(/<script[^>]+src="\.\/([^"]+)"/g);
const styles = pick(/<link[^>]+rel="stylesheet"[^>]+href="\.\/([^"]+)"/g);
const fonts = pick(/<link[^>]+href="(https:\/\/fonts\.googleapis\.com[^"]+)"/g);
const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'PLAYMUSEUM';

const read = (p) => readFileSync(new URL(p, dist), 'utf8');
for (const p of scripts) if (read(p).includes('</script')) throw new Error(`${p} contains </script`);

const page = [
  `<title>${title}</title>`,
  '<meta name="claude:viewport-fit-sides" content="cover">',
  ...fonts.map((f) => `<link rel="stylesheet" href="${f.replaceAll('&amp;', '&')}">`),
  ...styles.map((p) => `<style>${read(p)}</style>`),
  '<div id="root"></div>',
  ...scripts.map((p) => `<script type="module">${read(p)}</script>`),
  '',
].join('\n');

mkdirSync(out, { recursive: true });
writeFileSync(new URL('index.html', out), page);

const media = [];
for (const kind of ['images', 'audio']) {
  try {
    for (const f of readdirSync(new URL(`media/${kind}/`, dist))) if (!f.startsWith('.')) media.push(join('media', kind, f));
  } catch {
    /* 폴더 없음 */
  }
}
writeFileSync(new URL('media.json', out), JSON.stringify(media, null, 2));
console.log(`dist-artifact/index.html ${(page.length / 1024).toFixed(0)}KB, media ${media.length}개`);
