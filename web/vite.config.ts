import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
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
