/// <reference types="vite/client" />

declare module 'virtual:media-manifest' {
  export const images: string[];
  export const audio: string[];
}

/** Claude 아티팩트 안에서만 있는 런타임. GitHub Pages 에서는 undefined */
interface Window {
  claude?: {
    use(name: 'downloads'): Promise<{
      save(req: { filename: string; data: Blob }): Promise<{ status: 'saved' | 'delivered' }>;
    } | null>;
  };
}
