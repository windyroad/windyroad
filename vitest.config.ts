import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // tests/*.spec.mjs are standalone Playwright e2e scripts, run via
    // `node tests/<name>.spec.mjs` against a live server, not vitest suites.
    exclude: [...configDefaults.exclude, 'tests/**/*.spec.mjs'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
