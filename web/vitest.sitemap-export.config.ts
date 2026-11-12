import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		name: 'sitemap-export',
		environment: 'node',
		include: ['src/lib/seo/sitemap/writeSitemapProgrammaticPathsJson.export.test.ts']
	}
});
