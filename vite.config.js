import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: process.env.GITHUB_REPOSITORY && !process.env.GITHUB_REPOSITORY.endsWith('.github.io')
    ? '/' + process.env.GITHUB_REPOSITORY.split('/')[1] + '/'
    : '/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          animation: [
            '@animate-ui/react/provider',
            '@animate-ui/react/primitives/buttons/button',
            '@animate-ui/react/primitives/effects/fade',
          ],
        },
      },
    },
  },
});
