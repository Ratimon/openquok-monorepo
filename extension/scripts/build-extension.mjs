import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const extensionRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const buildTarget = process.env.BUILD_TARGET === 'firefox' ? 'firefox' : 'chromium';
const outDirName = process.env.EXTENSION_OUT_DIR?.trim() || 'dist';
const outDir = resolve(extensionRoot, outDirName);

const sharedBuild = {
	target: 'es2022',
	minify: false,
	sourcemap: true,
};

/** MV3: each manifest entry must be one self-contained ES module (no shared `assets/` chunks). */
const bundleEntries = [
	{ input: 'src/background.ts', out: 'background.js' },
	{ input: 'src/ui/sidepanel/sidepanel.ts', out: 'sidepanel.js', cssName: 'sidepanel.css' },
	{
		input: 'src/content/directory-launch/peerpush-host.ts',
		out: 'content/directory-launch/openquok-directory-peerpush.js',
	},
	{
		input: 'src/content/directory-launch/uneed-host.ts',
		out: 'content/directory-launch/openquok-directory-uneed.js',
	},
	{
		input: 'src/content/directory-launch/open-launch-host.ts',
		out: 'content/directory-launch/openquok-directory-open-launch.js',
	},
	{
		input: 'src/content/dashboard/openquok-dashboard-session.ts',
		out: 'content/dashboard/openquok-dashboard-session.js',
	},
	{
		input: 'src/content/social-reddit/reddit-submit-host.ts',
		out: 'content/social-reddit/openquok-reddit-submit.js',
	},
];

let emptyOutDir = true;

for (const entry of bundleEntries) {
	const cssName = entry.cssName ?? null;
	await build({
		define: {
			__OPENQUOK_BUILD_TARGET__: JSON.stringify(buildTarget),
		},
		build: {
			...sharedBuild,
			outDir,
			emptyOutDir,
			rollupOptions: {
				input: resolve(extensionRoot, entry.input),
				output: {
					format: 'es',
					entryFileNames: entry.out,
					assetFileNames: (asset) => {
						if (cssName && asset.name?.endsWith('.css')) return cssName;
						return 'assets/[name]-[hash][extname]';
					},
					inlineDynamicImports: true,
				},
			},
		},
	});
	emptyOutDir = false;
}
