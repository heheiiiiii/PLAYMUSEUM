import { readdirSync } from 'node:fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// public/media 안에 실제로 있는 파일 목록을 빌드 시점에 모듈로 만든다.
// 앱은 이 목록에 있는 파일만 요청하므로 없는 파일 때문에 404가 나지 않는다.
// 파일을 추가하면 개발 서버를 다시 시작하거나 다시 빌드한다.
function mediaManifest(): Plugin {
  const id = 'virtual:media-manifest';
  const resolved = '\0' + id;
  const list = (dir: string) => {
    try {
      return readdirSync(dir).filter((f) => !f.startsWith('.'));
    } catch {
      return [];
    }
  };
  return {
    name: 'media-manifest',
    resolveId: (source) => (source === id ? resolved : undefined),
    load(source) {
      if (source !== resolved) return;
      return `export const images = ${JSON.stringify(list('public/media/images'))};
export const audio = ${JSON.stringify(list('public/media/audio'))};`;
    },
  };
}

// base: './' keeps every asset path relative, so the build can be hosted
// from any sub-path on a static host.
export default defineConfig({
  base: './',
  plugins: [react(), mediaManifest()],
});
