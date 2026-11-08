import { defineConfig } from 'vite';

// Top-level await in main.js needs an ES2022 target. Set base to '/<repo>/' for GitHub Pages.
export default defineConfig({
  base: './',
  build: { target: 'es2022' },
});
