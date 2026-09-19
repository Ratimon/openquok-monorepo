import { describe, expect, it } from 'vitest';

import { PUBLIC_API_POSTING_PLATFORM_SLUGS } from '$lib/content/constants/apis/index';
import {
	getPayloadWizardChannelBySlug,
	listPayloadWizardChannelsForHub,
	PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG
} from '$lib/posts/constants/publicPayloadWizardChannelConfig';
import { getRootPathPublicPayloadWizardChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import { route } from '$lib/utils/path';

describe('publicPayloadWizardChannelConfig', () => {
	it('lists every posting API platform for the hub grid', () => {
		const links = listPayloadWizardChannelsForHub();
		expect(links).toHaveLength(PUBLIC_API_POSTING_PLATFORM_SLUGS.length);
		expect(links.map((link) => link.slug)).toEqual([...PUBLIC_API_POSTING_PLATFORM_SLUGS]);
	});

	it('builds channel routes under /tools/payload-wizard', () => {
		const tiktok = getPayloadWizardChannelBySlug('tiktok');
		expect(tiktok?.platformLabel).toBe('TikTok');
		expect(tiktok?.focusedProviderIdentifier).toBe('tiktok');
		expect(tiktok?.formatExamples.length).toBeGreaterThan(0);

		const hubLink = listPayloadWizardChannelsForHub().find((link) => link.slug === 'tiktok');
		expect(hubLink?.href).toBe(route(getRootPathPublicPayloadWizardChannel('tiktok')));
	});

	it('exposes generic SEO defaults', () => {
		expect(PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG.metaTitle).toContain('Payload Wizard');
		expect(PUBLIC_PAYLOAD_WIZARD_GENERIC_CONFIG.heroTitle.length).toBeGreaterThan(0);
	});

	it('returns undefined for unknown slugs', () => {
		expect(getPayloadWizardChannelBySlug('not-a-platform')).toBeUndefined();
	});
});
