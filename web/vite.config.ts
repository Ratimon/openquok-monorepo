import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

/** After the last `/node_modules/`, yields npm scope+name or package name (pnpm-safe). */
function npmPackageChunkLabel(id: string): string | undefined {
	const normalized = id.replace(/\\/g, '/');
	const marker = '/node_modules/';
	const i = normalized.lastIndexOf(marker);
	if (i === -1) return undefined;
	const tail = normalized.slice(i + marker.length);
	const segments = tail.split('/');
	const head = segments[0];
	if (!head || head === '.pnpm') return undefined;
	if (head.startsWith('@')) {
		const pkg = `${head}/${segments[1] ?? ''}`;
		return `npm-${pkg.replace(/^@/, '').replace('/', '-')}`;
	}
	return `npm-${head}`;
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		// chunkSizeWarningLimit: 550,
		rollupOptions: {
			output: {
				/**
				 * Named vendor chunks + per-package fallback so Rollup does not merge many dependencies into one
				 * ~500kB “misc” chunk (gzip stays similar; loads split across routes).
				 */
				manualChunks(id) {
					if (!id.includes('node_modules')) return;

					if (id.includes('konva')) return 'vendor-konva';
					if (id.includes('@tiptap') || id.includes('prosemirror-')) return 'vendor-tiptap';
					if (id.includes('@shikijs') || id.includes('/shiki')) return 'vendor-shiki';
					if (id.includes('@uppy')) return 'vendor-uppy';
					if (id.includes('@floating-ui')) return 'vendor-floating-ui';
					if (id.includes('bits-ui')) return 'vendor-bits-ui';
					if (id.includes('svelte-motion')) return 'vendor-svelte-motion';
					if (id.includes('@tanstack/svelte-form') || id.includes('@tanstack/form-core'))
						return 'vendor-tanstack-form';
					if (id.includes('parse5')) return 'vendor-parse5';
					if (id.includes('@internationalized')) return 'vendor-intl';

					return npmPackageChunkLabel(id);
				}
			}
		}
	},
	server: {
		https: {
			key: fs.readFileSync('./.cert/localhost-key.pem'),
			cert: fs.readFileSync('./.cert/localhost.pem')
		},
		host: 'localhost',
		port: 5173,
		// Same-origin `/api` in dev so auth cookies set during OAuth match the page origin (HTTPS + port 5173).
		// Without this, `https://localhost:5173` → `http://localhost:3000` is cross-site and refresh cookies are not sent.
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true
			},
			// Local uploads (STORAGE_PROVIDER=local) are served by the backend at /uploads/*
			'/uploads': {
				target: 'http://localhost:3000',
				changeOrigin: true
			}
		}
	},
	css: {
		transformer: 'postcss',
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
