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
	{ file: 'src/background.ts', out: 'background.js', cssOut: null },
	{ file: 'src/ui/sidepanel/sidepanel.ts', out: 'sidepanel.js', cssOut: 'sidepanel.css' },
];

/** One bundled host script per directory site (all provider slugs on that site). */
const contentScriptSpecs = [
	{
		out: 'openquok-directory-peerpush.js',
		file: 'peerpush-host.ts',
	},
	{
		out: 'openquok-directory-uneed.js',
		file: 'uneed-host.ts',
	},
];

let emptyOutDir = true;

for (const entry of inlineEntries) {
	const cssOut = entry.cssOut;
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
						if (cssOut && asset.name?.endsWith('.css')) {
							return cssOut;
						}
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
					entryFileNames: `content/directory-launch/${spec.out}`,
					inlineDynamicImports: true,
				},
			},
		},
	});
}
