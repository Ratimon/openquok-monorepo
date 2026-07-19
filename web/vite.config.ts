import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import type { Plugin } from 'vite';
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

/** Packages that Rollup folds into async doc/mermaid chunks — per-package manual chunks stay empty. */
function skipLazyDocVendorPackage(label: string): boolean {
	const pkg = label.slice(4);
	return (
		pkg.startsWith('d3-') ||
		pkg === 'd3' ||
		pkg.startsWith('micromark') ||
		pkg.includes('cjk') ||
		pkg === 'get-east-asian-width' ||
		pkg.includes('emoji') ||
		pkg === 'skin-tone' ||
		pkg === 'ts-dedent' ||
		pkg === 'braintree-sanitize-url' ||
		pkg.startsWith('cytoscape') ||
		pkg === 'elkjs' ||
		pkg === 'dompurify' ||
		pkg === 'shiki' ||
		pkg.startsWith('shiki-') ||
		pkg.startsWith('shikijs') ||
		pkg === 'katex' ||
		pkg === 'khroma' ||
		pkg === 'lodash-es' ||
		pkg === 'stylis' ||
		pkg === 'uuid' ||
		pkg === 'mermaid' ||
		pkg.includes('dagre') ||
		pkg === 'robust-predicates' ||
		pkg === 'delaunator' ||
		pkg === 'internmap' ||
		pkg === 'cose-base' ||
		pkg === 'layout-base'
	);
}

type ModuleGraphInfo = {
	dynamicImporters: readonly string[];
	importers: readonly string[];
};

const VISITING = Symbol('visiting');

/**
 * True when a module is only reachable via `import()` (e.g. lazy docs, mermaid).
 * Assigning manual chunk names to those deps creates empty chunks because Rollup
 * keeps them inside the async boundary instead.
 */
function isOnlyDynamicallyImported(
	id: string,
	getModuleInfo: (id: string) => ModuleGraphInfo | null,
	cache = new Map<string, boolean | typeof VISITING>()
): boolean {
	const cached = cache.get(id);
	if (cached === true || cached === false) return cached;
	if (cached === VISITING) return false;

	const info = getModuleInfo(id);
	if (!info) {
		cache.set(id, false);
		return false;
	}

	if (info.dynamicImporters.length > 0) {
		cache.set(id, true);
		return true;
	}

	if (info.importers.length === 0) {
		cache.set(id, false);
		return false;
	}

	cache.set(id, VISITING);
	const onlyDynamic = info.importers.every((importer) =>
		isOnlyDynamicallyImported(importer, getModuleInfo, cache)
	);
	cache.set(id, onlyDynamic);
	return onlyDynamic;
}

function resolveClientManualChunks(
	id: string,
	api: { getModuleInfo: (id: string) => ModuleGraphInfo | null }
): string | undefined {
	if (!id.includes('node_modules')) return;

	if (id.includes('konva')) return 'vendor-konva';
	if (id.includes('@tiptap') || id.includes('prosemirror-')) return 'vendor-tiptap';
	// Do not force a shared shiki manual chunk: it merges with Vite's modulepreload helper and
	// every lazy route then downloads the full highlighter (~10MB) on first dynamic import().
	if (id.includes('@floating-ui')) return 'vendor-floating-ui';
	if (id.includes('bits-ui')) return 'vendor-bits-ui';
	if (id.includes('svelte-motion')) return 'vendor-svelte-motion';
	if (id.includes('@tanstack/svelte-form') || id.includes('@tanstack/form-core'))
		return 'vendor-tanstack-form';
	if (id.includes('parse5')) return 'vendor-parse5';
	if (id.includes('@internationalized')) return 'vendor-intl';

	if (isOnlyDynamicallyImported(id, api.getModuleInfo)) return;

	const label = npmPackageChunkLabel(id);
	if (label && skipLazyDocVendorPackage(label)) return;

	return label;
}

/** Client-only vendor splits; SSR would emit empty manual chunks for lazy-loaded deps. */
function clientVendorChunks(): Plugin {
	return {
		name: 'client-vendor-chunks',
		configEnvironment(name, config) {
			if (name !== 'client') return;

			config.build ??= {};
			config.build.rollupOptions ??= {};
			const output = config.build.rollupOptions.output;
			const manualChunks = resolveClientManualChunks;

			if (Array.isArray(output)) {
				config.build.rollupOptions.output = output.map((entry) => ({ ...entry, manualChunks }));
			} else {
				config.build.rollupOptions.output = { ...output, manualChunks };
			}
		}
	};
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), clientVendorChunks()],
	build: {
		// chunkSizeWarningLimit: 550,
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
