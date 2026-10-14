/**
 * Extension builds use `scripts/build-extension.mjs` (one self-contained module per manifest entry).
 * This file remains for tooling that expects a default Vite config path.
 */
export { default } from './vite.main.config.ts';
