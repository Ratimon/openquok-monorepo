import { describe, expect, it } from 'vitest';

import {
	buildExternalLinkRel,
	externalLinkAnchorAttrs,
	externalLinkRelForHref,
	isConfiguredBrandSocialHref,
	isFirstPartyGithubHref,
	isTrustedExternalHref,
	resolveExternalLinkPolicy
} from './externalLinkRel';

describe('resolveExternalLinkPolicy', () => {
	it('follows openquok.com and npmjs.com', () => {
		expect(resolveExternalLinkPolicy('https://www.openquok.com/docs')).toEqual({
			trusted: true,
			follow: true
		});
		expect(resolveExternalLinkPolicy('https://www.npmjs.com/package/@openquok/node-sdk')).toEqual({
			trusted: true,
			follow: true
		});
		expect(isTrustedExternalHref('https://docs.openquok.com/x')).toBe(true);
	});

	it('follows configured brand Discord invite', () => {
		expect(isConfiguredBrandSocialHref('https://discord.gg/wXgWcYzU4')).toBe(true);
		expect(resolveExternalLinkPolicy('https://discord.gg/wXgWcYzU4')).toEqual({
			trusted: true,
			follow: true
		});
		expect(externalLinkRelForHref('https://discord.gg/wXgWcYzU4')).toBeUndefined();
	});

	it('follows first-party GitHub owner only', () => {
		expect(isFirstPartyGithubHref('https://github.com/Ratimon/openquok-monorepo')).toBe(true);
		expect(resolveExternalLinkPolicy('https://github.com/Ratimon/openquok-monorepo')).toEqual({
			trusted: true,
			follow: true
		});
		expect(isFirstPartyGithubHref('https://github.com/some-org/random-mcp')).toBe(false);
		expect(externalLinkRelForHref('https://github.com/some-org/random-mcp')).toBe(
			'noopener noreferrer nofollow'
		);
	});

	it('nofollows unrelated third-party hosts', () => {
		expect(resolveExternalLinkPolicy('https://example.com/guide')).toEqual({
			trusted: false,
			follow: false
		});
		expect(externalLinkRelForHref('https://chromewebstore.google.com/x')).toBe(
			'noopener noreferrer nofollow'
		);
	});

	it('nofollows non-configured Discord invites', () => {
		expect(isConfiguredBrandSocialHref('https://discord.gg/someone-else')).toBe(false);
		expect(externalLinkRelForHref('https://discord.gg/someone-else')).toBe(
			'noopener noreferrer nofollow'
		);
	});
});

describe('buildExternalLinkRel / externalLinkAnchorAttrs', () => {
	it('mirrors ExternalLink defaults', () => {
		expect(buildExternalLinkRel({ trusted: false, follow: false })).toBe(
			'noopener noreferrer nofollow'
		);
		expect(buildExternalLinkRel({ trusted: true, follow: false })).toBe('nofollow');
		expect(buildExternalLinkRel({ trusted: true, follow: true })).toBeUndefined();
	});

	it('returns blank-target attrs', () => {
		const attrs = externalLinkAnchorAttrs('https://discord.gg/wXgWcYzU4');
		expect(attrs.target).toBe('_blank');
		expect(attrs.rel).toBeUndefined();
		expect(attrs.trusted).toBe(true);
		expect(attrs.follow).toBe(true);
	});
});
