import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				background: resolve(__dirname, 'src/background.ts'),
			},
			output: {
				entryFileNames: '[name].js',
				format: 'es',
			},
		},
		target: 'es2022',
		minify: false,
		sourcemap: true,
	},
});
