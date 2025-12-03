import { defineConfig } from 'vite';

export default defineConfig({
  root: './packages/web',
  optimizeDeps: { include: ["core", "web"] },
  build: {
      outDir: "./build",
      emptyOutDir: true,
      commonjsOptions: {
          include: [/core/, /web/, /node_modules/],
      },
  },
  server: {
      watch: {
          usePolling: true
      }
  }
});
