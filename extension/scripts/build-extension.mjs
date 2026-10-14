import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const extensionRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const sharedBuild = {
	target: 'es2022',
	minify: false,
	sourcemap: true,
};

/** MV3: each manifest entry must be one self-contained ES module (no shared `assets/` chunks). */
const inlineEntries = [
	{ file: 'src/background.ts', out: 'background.js' },
	{ file: 'src/popup/popup.ts', out: 'popup.js' },
];

const contentScriptSpecs = [
	{ name: 'uneed-join-line', file: 'uneed-join-line.ts' },
	{ name: 'uneed-paid-launch', file: 'uneed-paid-launch.ts' },
	{ name: 'uneed-maker-profile', file: 'uneed-maker-profile.ts' },
];

let emptyOutDir = true;

for (const entry of inlineEntries) {
	await build({
		build: {
			...sharedBuild,
			outDir: resolve(extensionRoot, 'dist'),
			emptyOutDir,
			rollupOptions: {
				input: resolve(extensionRoot, entry.file),
				output: {
					format: 'es',
					entryFileNames: entry.out,
					assetFileNames: (asset) => {
						if (asset.name?.endsWith('.css')) return 'popup.css';
						return 'assets/[name]-[hash][extname]';
					},
					inlineDynamicImports: true,
				},
			},
		},
	});
	emptyOutDir = false;
}

for (const spec of contentScriptSpecs) {
	await build({
		build: {
			...sharedBuild,
			outDir: resolve(extensionRoot, 'dist'),
			emptyOutDir: false,
			rollupOptions: {
				input: resolve(extensionRoot, `src/content/directory-launch/${spec.file}`),
				output: {
					format: 'es',
					entryFileNames: `content/directory-launch/${spec.name}.js`,
					inlineDynamicImports: true,
				},
			},
		},
	});
}
