import { defineConfig } from 'vite';

export default defineConfig({
  root: './packages/web',
  optimizeDeps: { include: ["@trent/core"] },
  build: {
      commonjsOptions: {
          include: [/common/, /node_modules/],
      },
  },
  server: {
      watch: {
          usePolling: true
      }
  }
});
