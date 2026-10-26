import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps every asset path relative, so the build can be hosted
// from any sub-path on a static host.
export default defineConfig({
  base: './',
  plugins: [react()],
});
