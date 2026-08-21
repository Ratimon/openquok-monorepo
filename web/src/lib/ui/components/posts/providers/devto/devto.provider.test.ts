import { describe, expect, it } from 'vitest';

import {
	checkDevtoLaunchValidity,
	DEVTO_MAX_TAGS,
	readDevtoLaunchSettings
} from '$lib/ui/components/posts/providers/devto/devto.provider';

describe('devto.provider', () => {
	it('reads nested bucket settings and ignores other provider keys', () => {
		const settings = readDevtoLaunchSettings({
			threads: { enabled: true },
			title: 'flat-title',
			devto: {
				title: 'Nested title',
				canonical: 'https://example.com/post',
				organization: 42,
				series: 'Shipping notes',
				tags: [{ value: 'javascript', label: 'javascript' }, 'svelte'],
				mainImage: { path: 'covers/hero.webp' }
			}
		});
		expect(settings).toEqual({
			title: 'Nested title',
			canonical: 'https://example.com/post',
			organization: 42,
			series: 'Shipping notes',
			tags: [
				{ value: 'javascript', label: 'javascript' },
				{ value: 'svelte', label: 'svelte' }
			],
			mainImage: { path: 'covers/hero.webp' }
		});
	});

	it('falls back to flat CLI keys when the nested bucket is missing', () => {
		const settings = readDevtoLaunchSettings({
			title: 'CLI title',
			canonical_url: 'https://blog.example.com/a',
			series: 'Release log',
			tags: ['webdev', 'typescript']
		});
		expect(settings.title).toBe('CLI title');
		expect(settings.canonical).toBe('https://blog.example.com/a');
		expect(settings.series).toBe('Release log');
		expect(settings.tags).toEqual([
			{ value: 'webdev', label: 'webdev' },
			{ value: 'typescript', label: 'typescript' }
		]);
	});

	it('omits blank series', () => {
		expect(readDevtoLaunchSettings({ title: 'OK', series: '   ' }).series).toBeUndefined();
		expect(readDevtoLaunchSettings({ title: 'OK', devto: { series: '' } }).series).toBeUndefined();
	});

	it('requires a title of at least 2 characters', () => {
		expect(checkDevtoLaunchValidity({ title: 'A', tags: [] })).toBe(
			'Dev.to title must be at least 2 characters'
		);
		expect(checkDevtoLaunchValidity({ title: 'OK', tags: [] })).toBe(true);
	});

	it('rejects more than 4 tags and invalid canonical URLs', () => {
		const tooMany = Array.from({ length: DEVTO_MAX_TAGS + 1 }, (_, i) => ({
			value: `t${i}`,
			label: `t${i}`
		}));
		expect(checkDevtoLaunchValidity({ title: 'OK', tags: tooMany })).toBe(
			'Dev.to allows at most 4 tags'
		);
		expect(
			checkDevtoLaunchValidity({ title: 'OK', tags: [], canonical: 'not-a-url' })
		).toBe('Canonical URL must be a valid http(s) URL');
	});
});
