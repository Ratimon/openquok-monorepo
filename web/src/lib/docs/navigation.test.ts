import { describe, expect, it } from 'vitest';

import {
	docsTabHref,
	getDocsTabIdFromPathname,
	getDocsTabIdFromSlug
} from '$lib/docs/navigation';

describe('getDocsTabIdFromPathname', () => {
	it.each([
		['/docs', 'general'],
		['/docs/', 'general'],
		['/docs/getting-started', 'general'],
		['/docs/getting-started/quickstart', 'general'],
		['/docs/getting-started-for-cli', 'cli'],
		['/docs/getting-started-for-mcp', 'mcp'],
		['/docs/getting-started-for-public-api', 'public-api'],
		['/docs/cloud', 'cloud'],
		['/docs/cloud/trial', 'cloud'],
		['/docs/installation', 'self-hosting'],
		['/docs/installation/docker-compose', 'self-hosting'],
		['/docs/getting-started-for-cli', 'cli'],
		['/docs/cli-usages', 'cli'],
		['/docs/getting-started-for-mcp', 'mcp'],
		['/docs/getting-started-for-public-api', 'public-api'],
		['/docs/oauth2-for-apps', 'public-api'],
		['/docs/developer-guidelines', 'contributing'],
		['/docs/not-a-real-section', 'general']
	] as const)('%s → %s', (pathname, tabId) => {
		expect(getDocsTabIdFromPathname(pathname)).toBe(tabId);
	});

	it('treats a non-default locale prefix as the same tab', () => {
		expect(getDocsTabIdFromPathname('/docs/es')).toBe('general');
		expect(getDocsTabIdFromPathname('/docs/es/cloud')).toBe('cloud');
		expect(getDocsTabIdFromPathname('/docs/es/installation')).toBe('self-hosting');
		expect(getDocsTabIdFromPathname('/docs/es/getting-started-for-cli')).toBe('cli');
	});
});

describe('getDocsTabIdFromSlug', () => {
	it.each([
		['', 'general'],
		['getting-started', 'general'],
		['getting-started/quickstart', 'general'],
		['cloud', 'cloud'],
		['cloud/trial', 'cloud'],
		['installation', 'self-hosting'],
		['getting-started-for-cli', 'cli'],
		['getting-started-for-mcp', 'mcp'],
		['getting-started-for-public-api', 'public-api'],
		['oauth2-for-apps', 'public-api'],
		['developer-guidelines', 'contributing'],
		['mystery-page', 'general']
	] as const)('%s → %s', (slug, tabId) => {
		expect(getDocsTabIdFromSlug(slug)).toBe(tabId);
	});
});

describe('docsTabHref', () => {
	it('uses /docs for General and the tab home for every other tab', () => {
		expect(docsTabHref('general')).toBe('/docs');
		expect(docsTabHref('cloud')).toBe('/docs/cloud');
		expect(docsTabHref('self-hosting')).toBe('/docs/getting-started-for-dev');
		expect(docsTabHref('cli')).toBe('/docs/getting-started-for-cli');
		expect(docsTabHref('mcp')).toBe('/docs/getting-started-for-mcp');
		expect(docsTabHref('public-api')).toBe('/docs/getting-started-for-public-api');
		expect(docsTabHref('contributing')).toBe('/docs/developer-guidelines');
	});
});
