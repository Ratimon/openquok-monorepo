import { describe, expect, it } from 'vitest';

import { docSlugsSafeForPrerender } from '$lib/docs/content';

describe('docSlugsSafeForPrerender', () => {
	it('excludes section indexes that have child pages (avoids file/dir prerender conflicts)', () => {
		const slugs = [
			'getting-started-for-dev',
			'getting-started-for-dev/quick-start',
			'getting-started-for-dev/architecture',
			'installation',
			'installation/vercel'
		];

		expect(docSlugsSafeForPrerender(slugs)).toEqual([
			'getting-started-for-dev/quick-start',
			'getting-started-for-dev/architecture',
			'installation/vercel'
		]);
	});

	it('keeps leaf-only sections and drops empty root slug', () => {
		expect(docSlugsSafeForPrerender(['', 'oauth2-for-apps', 'admin/roles'])).toEqual([
			'oauth2-for-apps',
			'admin/roles'
		]);
	});
});
