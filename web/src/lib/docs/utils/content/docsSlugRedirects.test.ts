import { describe, expect, it } from 'vitest';

import { docsRedirectPath, resolveLegacyDocsSlug } from './docsSlugRedirects';

describe('resolveLegacyDocsSlug', () => {
	it('maps playbooks section slugs to saved', () => {
		expect(resolveLegacyDocsSlug('playbooks')).toBe('saved');
		expect(resolveLegacyDocsSlug('playbooks/explore-and-bookmarks')).toBe(
			'saved/explore-and-bookmarks'
		);
		expect(resolveLegacyDocsSlug('channels/connect')).toBeNull();
	});
});

describe('docsRedirectPath', () => {
	it('builds docs and localized markdown redirect URLs', () => {
		expect(docsRedirectPath('playbooks/my-library')).toBe('/docs/saved/my-library');
		expect(docsRedirectPath('playbooks', { localePrefix: 'es', search: '?q=1' })).toBe(
			'/docs/es/saved?q=1'
		);
		expect(
			docsRedirectPath('playbooks/compose-a-playbook', { markdown: true, search: '?raw=1' })
		).toBe('/docs/saved/compose-a-playbook/markdown?raw=1');
	});
});
