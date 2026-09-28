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
	it('follows openquok.com only', () => {
		expect(resolveExternalLinkPolicy('https://www.openquok.com/docs')).toEqual({
			trusted: true,
			follow: true
		});
		expect(isTrustedExternalHref('https://docs.openquok.com/x')).toBe(true);
		expect(externalLinkRelForHref('https://www.openquok.com/docs')).toBeUndefined();
	});

	it('nofollows npmjs.com and other product hosts', () => {
		expect(resolveExternalLinkPolicy('https://www.npmjs.com/package/@openquok/node-sdk')).toEqual({
			trusted: false,
			follow: false
		});
		expect(isTrustedExternalHref('https://www.npmjs.com/package/@openquok/node-sdk')).toBe(false);
		expect(externalLinkRelForHref('https://www.npmjs.com/package/@openquok/node-sdk')).toBe(
			'noopener noreferrer nofollow'
		);
	});

	it('nofollows configured brand Bluesky profile', () => {
		expect(
			isConfiguredBrandSocialHref('https://bsky.app/profile/openquok.bsky.social')
		).toBe(true);
		expect(
			resolveExternalLinkPolicy('https://bsky.app/profile/openquok.bsky.social')
		).toEqual({
			trusted: false,
			follow: false
		});
		expect(externalLinkRelForHref('https://bsky.app/profile/openquok.bsky.social')).toBe(
			'noopener noreferrer nofollow'
		);
	});

	it('nofollows configured brand Discord invite', () => {
		expect(isConfiguredBrandSocialHref('https://discord.gg/wXgWcYzU4')).toBe(true);
		expect(resolveExternalLinkPolicy('https://discord.gg/wXgWcYzU4')).toEqual({
			trusted: false,
			follow: false
		});
		expect(externalLinkRelForHref('https://discord.gg/wXgWcYzU4')).toBe(
			'noopener noreferrer nofollow'
		);
	});

	it('nofollows first-party GitHub owner', () => {
		expect(isFirstPartyGithubHref('https://github.com/Ratimon/openquok-monorepo')).toBe(true);
		expect(resolveExternalLinkPolicy('https://github.com/Ratimon/openquok-monorepo')).toEqual({
			trusted: false,
			follow: false
		});
		expect(isFirstPartyGithubHref('https://github.com/some-org/random-mcp')).toBe(false);
		expect(externalLinkRelForHref('https://github.com/some-org/random-mcp')).toBe(
			'noopener noreferrer nofollow'
		);
		expect(externalLinkRelForHref('https://github.com/Ratimon/openquok-monorepo')).toBe(
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

	it('returns blank-target attrs for brand social (nofollow)', () => {
		const attrs = externalLinkAnchorAttrs('https://discord.gg/wXgWcYzU4');
		expect(attrs.target).toBe('_blank');
		expect(attrs.rel).toBe('noopener noreferrer nofollow');
		expect(attrs.trusted).toBe(false);
		expect(attrs.follow).toBe(false);
	});
});
