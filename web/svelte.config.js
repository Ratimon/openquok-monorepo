import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';
import adapterVercel from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import autoprefixer from 'autoprefixer';
import { loadEnv } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import { mdsvexCodeHighlighter } from './mdsvex.config.mjs';
import { adapterVercelWithoutPrerenderDeps } from './adapter-vercel-static-docs.mjs';

/**
 * Adapter selection (build-time):
 * - VERCEL set → adapter-vercel (SaaS / Vercel CI; wins over Docker flags)
 * - OPENQUOK_ADAPTER=node or DOCKER=1 → adapter-node (self-host / container)
 * - otherwise → adapter-auto (local / platform zero-config)
 */
function resolveAdapter() {
	if (process.env.VERCEL) {
		return adapterVercelWithoutPrerenderDeps(() => adapterVercel());
	}
	if (process.env.OPENQUOK_ADAPTER === 'node' || process.env.DOCKER === '1') {
		// Leave compression to a reverse proxy when present; avoids double work in containers.
		return adapterNode({ precompress: false });
	}
	return adapterAuto();
}

const adapter = resolveAdapter();

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
	// mdsvex still emits `<script context="module">` for frontmatter until a release uses `<script module>` (Svelte 5).
	compilerOptions: {
		warningFilter: (warning) => warning.code !== 'script_context_deprecated'
	},
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		mdsvex({
			extensions: ['.md', '.svx'],
			highlight: {
				highlighter: mdsvexCodeHighlighter
			}
		}),
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
		})
		],
	kit: {
		adapter,
		prerender: {
			// Docs i18n markdown routes can overlap (e.g. `/docs/es/markdown` matches both `[lang=lang]` and `[...slug]`).
			// Prefer continuing the build while keeping visibility in logs.
			handleEntryGeneratorMismatch: 'warn'
		},
		alias: {
			'web-config': './src/web-config.json',
			'$data': './src/data',
			'$tests': './src/tests',
			'$openquok-core-examples': '../agent/skills/openquok-core/resources/examples'
		}
	}
};

export default config;
