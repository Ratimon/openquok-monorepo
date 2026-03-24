import adapterAuto from '@sveltejs/adapter-auto';
import adapterVercel from '@sveltejs/adapter-vercel';

const adapter = process.env.VERCEL ? adapterVercel() : adapterAuto();
// import preprocess from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import autoprefixer from "autoprefixer";

import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables using Vite's loadEnv
// Vite uses MODE to determine which .env files to load:
// - MODE=development loads .env.development and .env.development.local
// - MODE=production loads .env.production and .env.production.local
// Falls back to NODE_ENV if MODE is not set
// Use env.VITE_* in config when you need build-time env (e.g. API URL for CSP)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mode = process.env.MODE || process.env.NODE_ENV || 'development';
const env = loadEnv(mode, resolve(__dirname), 'VITE_');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess({
			style: {
			css: {
				postcss: {
				plugins: [ autoprefixer()],
				},
			}
			},
			script: {
				ts: true,
			}
		}),
		// mdsvex(mdsvexOptions)
		],
	kit: {
		adapter,
		alias: {
			'web-config': './src/web-config.json',
			'$data': './src/data',
			'$tests': './src/tests'
		}
	}
};

export default config;
