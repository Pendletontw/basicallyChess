import { defineConfig } from 'vite';

export default defineConfig({
  root: './packages/web',
  optimizeDeps: { include: ["core"] },
  build: {
      outDir: "./packages/web/build",
      commonjsOptions: {
          include: [/core/, /node_modules/],
      },
  },
  server: {
      watch: {
          usePolling: true
      }
  }
});
