import { describe, expect, it } from 'vitest';

import { resolveOpportunityCta } from './resolveOpportunityCtaHref';

describe('resolveOpportunityCta', () => {
	it('links schedule_post to creating posts docs, not the protected workspace', () => {
		const cta = resolveOpportunityCta({
			kind: 'schedule_post',
			channelSlug: 'facebook',
			ctaHref: null,
			ctaLabel: 'Schedule post'
		});
		expect(cta).toMatchObject({
			href: '/docs/creating-posts',
			label: 'Schedule post',
			external: false
		});
		expect(cta?.href).not.toContain('/account');
	});

	it('links connect_channel to the connect channels doc', () => {
		const cta = resolveOpportunityCta({
			kind: 'connect_channel',
			channelSlug: 'facebook',
			ctaHref: null,
			ctaLabel: 'Connect Facebook'
		});
		expect(cta?.href).toBe('/docs/channels/connect');
	});

	it('links directory_channel to the public channels page and ignores legacy ctaLabel', () => {
		const cta = resolveOpportunityCta({
			kind: 'directory_channel',
			channelSlug: 'peerpush',
			ctaHref: 'https://example.com/old',
			ctaLabel: 'Connect Facebook'
		});
		expect(cta).toMatchObject({
			href: '/channels/peerpush',
			label: 'Autofill on PeerPush',
			external: false
		});
	});

	it('returns null for directory_channel without channel slug', () => {
		expect(
			resolveOpportunityCta({
				kind: 'directory_channel',
				channelSlug: null,
				ctaHref: null,
				ctaLabel: null
			})
		).toBeNull();
	});
});
