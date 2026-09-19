import { describe, expect, it } from 'vitest';

import {
	PUBLIC_API_POSTING_PLATFORM_SLUGS,
	getPublicApiProviderIdentifier
} from '$lib/content/constants/apis/index';
import { getPublicChannelBySlug } from '$lib/content/constants/publicChannelConfig';
import {
	PAYLOAD_WIZARD_GUEST_DEFAULT_SELECTED_SLUGS,
	PAYLOAD_WIZARD_MOCK_INTEGRATION_ID_BY_SLUG,
	PAYLOAD_WIZARD_PREVIEW_WORKSPACE_ID,
	buildPayloadWizardMockChannels,
	defaultPayloadWizardGuestSelectedIntegrationIds,
	payloadWizardMockIntegrationId
} from '$lib/posts/utils/buildPayloadWizardMockChannels';

describe('buildPayloadWizardMockChannels', () => {
	it('builds one schedulable mock per API marketing platform slug', () => {
		const mocks = buildPayloadWizardMockChannels();

		expect(mocks).toHaveLength(PUBLIC_API_POSTING_PLATFORM_SLUGS.length);
		expect(mocks.length).toBe(7);

		for (const slug of PUBLIC_API_POSTING_PLATFORM_SLUGS) {
			const channel = getPublicChannelBySlug(slug);
			expect(channel).toBeDefined();

			const mock = mocks.find((item) => item.id === payloadWizardMockIntegrationId(slug));
			expect(mock).toBeDefined();
			expect(mock?.name).toBe(channel?.platformLabel);
			expect(mock?.identifier).toBe(getPublicApiProviderIdentifier(slug));
			expect(mock?.schedulable).toBe(true);
			expect(mock?.type).toBe('social');
		}
	});

	it('uses stable illustrative integration UUIDs', () => {
		expect(PAYLOAD_WIZARD_PREVIEW_WORKSPACE_ID).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		);
		expect(PAYLOAD_WIZARD_MOCK_INTEGRATION_ID_BY_SLUG.tiktok).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		);
	});

	it('pre-selects text-first sample channels for guest landings', () => {
		const mocks = buildPayloadWizardMockChannels();
		const selected = defaultPayloadWizardGuestSelectedIntegrationIds(mocks);

		expect(selected).toHaveLength(PAYLOAD_WIZARD_GUEST_DEFAULT_SELECTED_SLUGS.length);
		expect(selected).not.toContain(payloadWizardMockIntegrationId('tiktok'));
		expect(selected).not.toContain(payloadWizardMockIntegrationId('instagram'));
		expect(selected).not.toContain(payloadWizardMockIntegrationId('youtube'));
		expect(selected).toContain(payloadWizardMockIntegrationId('facebook'));
	});
});
