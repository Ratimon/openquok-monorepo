import { describe, expect, it } from 'vitest';

import {
	hostedMarketingAnchorAttrs,
	hostedMarketingHref,
	isHostedMarketingPath,
	isOpenquokHostedOrigin,
	OPENQUOK_HOSTED_WEB_ORIGIN,
	rewriteHtmlHostedMarketingHrefs
} from '$lib/utils/hostedMarketingHref';

const HOSTED_ORIGIN = 'https://www.openquok.com';
const APEX_ORIGIN = 'https://openquok.com';
const STAGING_ORIGIN = 'https://app.openquok.com';
const SELF_HOST_ORIGIN = 'https://scheduler.example.com';
const LOCAL_ORIGIN = 'http://localhost:5173';

describe('isOpenquokHostedOrigin', () => {
	it('matches openquok.com and subdomains', () => {
		expect(isOpenquokHostedOrigin(HOSTED_ORIGIN)).toBe(true);
		expect(isOpenquokHostedOrigin(APEX_ORIGIN)).toBe(true);
		expect(isOpenquokHostedOrigin(STAGING_ORIGIN)).toBe(true);
	});

	it('rejects other hosts', () => {
		expect(isOpenquokHostedOrigin(SELF_HOST_ORIGIN)).toBe(false);
		expect(isOpenquokHostedOrigin(LOCAL_ORIGIN)).toBe(false);
		expect(isOpenquokHostedOrigin('https://openquok.com.evil.com')).toBe(false);
		expect(isOpenquokHostedOrigin('not-a-url')).toBe(false);
	});
});

describe('isHostedMarketingPath', () => {
	it('matches marketing prefixes including nested paths', () => {
		expect(isHostedMarketingPath('/docs')).toBe(true);
		expect(isHostedMarketingPath('/docs/foo')).toBe(true);
		expect(isHostedMarketingPath('/blog/slug')).toBe(true);
		expect(isHostedMarketingPath('/pricing')).toBe(true);
		expect(isHostedMarketingPath('/pricing#pricing-compare')).toBe(true);
		expect(isHostedMarketingPath('/about')).toBe(true);
		expect(isHostedMarketingPath('/agents/openclaw')).toBe(true);
		expect(isHostedMarketingPath('/tools/skill-builder')).toBe(true);
		expect(isHostedMarketingPath('/building-blocks?type=official')).toBe(true);
	});

	it('does not match functional app routes', () => {
		expect(isHostedMarketingPath('/account')).toBe(false);
		expect(isHostedMarketingPath('/sign-in')).toBe(false);
		expect(isHostedMarketingPath('/')).toBe(false);
		expect(isHostedMarketingPath('/p/abc')).toBe(false);
		expect(isHostedMarketingPath('/documentation')).toBe(false);
	});
});

describe('hostedMarketingHref', () => {
	it('stays relative on the hosted origin', () => {
		expect(hostedMarketingHref('/docs/foo', HOSTED_ORIGIN, { isDev: false })).toBe('/docs/foo');
		expect(hostedMarketingHref('/blog/slug', APEX_ORIGIN, { isDev: false })).toBe('/blog/slug');
	});

	it('stays relative in Vite DEV even on a self-host origin', () => {
		expect(hostedMarketingHref('/docs/foo', SELF_HOST_ORIGIN, { isDev: true })).toBe('/docs/foo');
		expect(hostedMarketingHref('/docs/foo', LOCAL_ORIGIN, { isDev: true })).toBe('/docs/foo');
	});

	it('rewrites marketing paths to the hosted origin on self-host production', () => {
		expect(hostedMarketingHref('/docs/foo', SELF_HOST_ORIGIN, { isDev: false })).toBe(
			`${OPENQUOK_HOSTED_WEB_ORIGIN}/docs/foo`
		);
		expect(
			hostedMarketingHref(
				'/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience',
				SELF_HOST_ORIGIN,
				{ isDev: false }
			)
		).toBe(
			`${OPENQUOK_HOSTED_WEB_ORIGIN}/blog/how-to-warm-up-a-tiktok-account-to-reach-a-us-audience`
		);
		expect(hostedMarketingHref('/pricing#pricing-compare', SELF_HOST_ORIGIN, { isDev: false })).toBe(
			`${OPENQUOK_HOSTED_WEB_ORIGIN}/pricing#pricing-compare`
		);
	});

	it('leaves non-marketing paths unchanged', () => {
		expect(hostedMarketingHref('/account', SELF_HOST_ORIGIN, { isDev: false })).toBe('/account');
		expect(hostedMarketingHref('/sign-in', HOSTED_ORIGIN, { isDev: false })).toBe('/sign-in');
		expect(hostedMarketingHref('https://discord.gg/example', SELF_HOST_ORIGIN, { isDev: false })).toBe(
			'https://discord.gg/example'
		);
	});
});

describe('hostedMarketingAnchorAttrs', () => {
	it('does not mark hosted or DEV links as external', () => {
		expect(hostedMarketingAnchorAttrs('/docs', HOSTED_ORIGIN, { isDev: false })).toEqual({
			href: '/docs',
			external: false
		});
		expect(hostedMarketingAnchorAttrs('/docs', SELF_HOST_ORIGIN, { isDev: true })).toEqual({
			href: '/docs',
			external: false
		});
	});

	it('opens self-host backlinks in a new tab with rel=noopener only', () => {
		expect(hostedMarketingAnchorAttrs('/docs', SELF_HOST_ORIGIN, { isDev: false })).toEqual({
			href: `${OPENQUOK_HOSTED_WEB_ORIGIN}/docs`,
			external: true,
			target: '_blank',
			rel: 'noopener'
		});
		const rel = hostedMarketingAnchorAttrs('/blog/slug', SELF_HOST_ORIGIN, { isDev: false }).rel;
		expect(rel).toBe('noopener');
		expect(rel).not.toContain('nofollow');
		expect(rel).not.toContain('noreferrer');
	});

	it('does not treat third-party URLs as hosted backlinks', () => {
		expect(
			hostedMarketingAnchorAttrs('https://discord.gg/example', SELF_HOST_ORIGIN, { isDev: false })
		).toEqual({
			href: 'https://discord.gg/example',
			external: false
		});
	});
});

describe('rewriteHtmlHostedMarketingHrefs', () => {
	it('leaves relative marketing anchors on the hosted origin', () => {
		const html = '<p>See the <a href="/docs/getting-started-for-cli">CLI guide</a>.</p>';
		expect(rewriteHtmlHostedMarketingHrefs(html, HOSTED_ORIGIN, { isDev: false })).toBe(html);
	});

	it('rewrites self-host production FAQ links to hosted backlinks', () => {
		const html =
			'<p>Follow the <a href="/docs/installation/docker-compose">Docker Compose setup</a>.</p>';
		expect(rewriteHtmlHostedMarketingHrefs(html, SELF_HOST_ORIGIN, { isDev: false })).toBe(
			`<p>Follow the <a href="${OPENQUOK_HOSTED_WEB_ORIGIN}/docs/installation/docker-compose" target="_blank" rel="noopener">Docker Compose setup</a>.</p>`
		);
	});

	it('does not rewrite GitHub or functional app hrefs', () => {
		const html =
			'<p><a href="https://github.com/Ratimon/openquok-monorepo">GitHub</a> and <a href="/sign-up">sign up</a>.</p>';
		expect(rewriteHtmlHostedMarketingHrefs(html, SELF_HOST_ORIGIN, { isDev: false })).toBe(html);
	});
});
