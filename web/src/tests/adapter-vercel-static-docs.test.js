import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
	collapsePrerenderTrailingSlashRoutes,
	isPrerenderTrailingSlashPairRoute
} from '../../adapter-vercel-static-docs.mjs';

const fixtureConfigPath = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'../../.vercel/output/config.json'
);

describe('isPrerenderTrailingSlashPairRoute', () => {
	it('detects adapter-vercel slash rewrite/redirect pairs', () => {
		expect(
			isPrerenderTrailingSlashPairRoute({
				src: '/compare/openquok/buffer',
				dest: '/compare/openquok/buffer/'
			})
		).toBe(true);
		expect(
			isPrerenderTrailingSlashPairRoute({
				src: '/compare/openquok/buffer/',
				status: 308,
				headers: { Location: '/compare/openquok/buffer' }
			})
		).toBe(true);
		expect(
			isPrerenderTrailingSlashPairRoute({
				src: '^/about/?(?:/__data.json)?$',
				dest: '/(public)/about'
			})
		).toBe(false);
	});
});

describe('collapsePrerenderTrailingSlashRoutes', () => {
	it('collapses large prerender pair blocks when build output exists', () => {
		if (!fs.existsSync(fixtureConfigPath)) return;

		const config = JSON.parse(fs.readFileSync(fixtureConfigPath, 'utf8'));
		const before = config.routes?.length ?? 0;

		const { config: next, removed, collapsed } = collapsePrerenderTrailingSlashRoutes(config);
		expect(collapsed).toBe(true);
		expect(removed).toBeGreaterThan(1000);
		expect(next.routes.length).toBeLessThan(300);
		expect(next.routes.length).toBe(before - removed + 1);
		expect(next.routes[0]).toEqual({
			src: '/(.*)/$',
			status: 308,
			headers: { Location: '/$1' }
		});

		expect(Object.keys(next.overrides ?? {}).length).toBe(Object.keys(config.overrides ?? {}).length);
	});

	it('leaves small or unmatched configs unchanged', () => {
		const config = {
			routes: [
				{ src: '/about', dest: '/about/' },
				{ src: '/about/', status: 308, headers: { Location: '/about' } }
			]
		};
		const result = collapsePrerenderTrailingSlashRoutes(config);
		expect(result.collapsed).toBe(false);
		expect(result.config.routes).toHaveLength(2);
	});
});