import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const extensionRoot = __dirname;

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		target: 'es2022',
		minify: false,
		sourcemap: true,
		rollupOptions: {
			input: {
				background: resolve(extensionRoot, 'src/background.ts'),
				sidepanel: resolve(extensionRoot, 'src/ui/sidepanel/sidepanel.ts'),
			},
			output: {
				entryFileNames: (chunk) => {
					if (chunk.name === 'sidepanel') return 'sidepanel.js';
					if (chunk.name === 'background') return 'background.js';
					return `${chunk.name}.js`;
				},
				assetFileNames: (asset) => {
					if (asset.name?.endsWith('.css')) return 'sidepanel.css';
					return 'assets/[name]-[hash][extname]';
				},
				format: 'es',
			},
		},
	},
});
