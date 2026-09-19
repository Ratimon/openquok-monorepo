import type { CreateSocialPostChannelViewModel } from '$lib/channels';
import type { PublicApiPlatformSlug } from '$lib/content/constants/apis/types';

import {
	PUBLIC_API_POSTING_PLATFORM_SLUGS,
	getPublicApiProviderIdentifier
} from '$lib/content/constants/apis/index';
import { PUBLIC_API_MOCK_INTEGRATION_ID } from '$lib/content/constants/apis/shared';
import { getPublicChannelBySlug } from '$lib/content/constants/channels/index';
import { normalizeIntegrationEditorMode } from '$lib/integrations/integrationEditorMode';

/** Fake workspace id used only to satisfy payload preview validation — omitted from copied JSON. */
export const PAYLOAD_WIZARD_PREVIEW_WORKSPACE_ID = 'e7f6a5b4-c3d2-41e0-9f8a-7b6c5d4e3f2a';

/**
 * Sample integration UUIDs for the public Payload Wizard. These are illustrative only —
 * replace with real channel ids from `GET /public/integrations` in production.
 */
export const PAYLOAD_WIZARD_MOCK_INTEGRATION_ID_BY_SLUG: Record<PublicApiPlatformSlug, string> = {
	tiktok: PUBLIC_API_MOCK_INTEGRATION_ID,
	x: '2a8b5e4c-1d3f-4a5b-9c0d-8e7f6a5b4c3d',
	instagram: '3c7d8e9f-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
	youtube: '4d8e9f0a-6b7c-4d8e-9f0a-1b2c3d4e5f60',
	facebook: '5e9f0a1b-7c8d-4e9f-0a1b-2c3d4e5f6071',
	threads: '6f0a1b2c-8d9e-4f0a-1b2c-3d4e5f607182',
	linkedin: '7a1b2c3d-9e0f-4a1b-2c3d-4e5f60718293'
};

export function payloadWizardMockIntegrationId(slug: PublicApiPlatformSlug): string {
	return PAYLOAD_WIZARD_MOCK_INTEGRATION_ID_BY_SLUG[slug];
}

/**
 * Sample channels for the public Payload Wizard composer (7 API marketing platforms).
 * Catalog icons and labels only — not the visitor's workspace accounts.
 */
export function buildPayloadWizardMockChannels(): CreateSocialPostChannelViewModel[] {
	return PUBLIC_API_POSTING_PLATFORM_SLUGS.map((slug) => {
		const channel = getPublicChannelBySlug(slug);
		if (!channel) {
			throw new Error(`Missing public channel catalog entry for API platform slug: ${slug}`);
		}
		const id = payloadWizardMockIntegrationId(slug);
		return {
			id,
			internalId: `${id}-internal`,
			name: channel.platformLabel,
			identifier: getPublicApiProviderIdentifier(slug),
			picture: null,
			type: 'social',
			disabled: false,
			inBetweenSteps: false,
			refreshNeeded: false,
			schedulable: true,
			unschedulableReason: null,
			group: null,
			postingTimes: [{ time: 540 }],
			editor: normalizeIntegrationEditorMode(slug === 'x' ? 'html' : 'normal')
		};
	});
}
