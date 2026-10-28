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
				popup: resolve(extensionRoot, 'src/popup/popup.ts'),
			},
			output: {
				entryFileNames: (chunk) => {
					if (chunk.name === 'popup') return 'popup.js';
					if (chunk.name === 'background') return 'background.js';
					return `${chunk.name}.js`;
				},
				assetFileNames: (asset) => {
					if (asset.name?.endsWith('.css')) return 'popup.css';
					return 'assets/[name]-[hash][extname]';
				},
				format: 'es',
			},
		},
	},
});
