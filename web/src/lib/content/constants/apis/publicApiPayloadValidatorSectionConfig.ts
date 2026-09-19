import type { PublicApiCapability } from '$lib/content/constants/apis/types';

export type PublicApiPayloadValidatorSection = {
	subtitle: string;
	title: string;
	description: string;
	mediaOnRight?: boolean;
};

export const PUBLIC_API_POSTING_PAYLOAD_VALIDATOR_HUB_SECTION: PublicApiPayloadValidatorSection = {
	subtitle: 'Payload validator',
	title: 'Preview JSON for POST /public/posts before you write integration code',
	description:
		'Compose with sample channels, copy a validated JSON body, and paste it into curl or your SDK. Scheduling and uploads need a workspace — copy JSON stays free.',
	mediaOnRight: true
};

export const PUBLIC_API_SCHEDULING_PAYLOAD_VALIDATOR_HUB_SECTION: PublicApiPayloadValidatorSection = {
	subtitle: 'Payload validator',
	title: 'Preview JSON for POST /public/posts before you write integration code',
	description:
		'Compose with sample channels, set repeatInterval for recurring schedules, copy a validated JSON body, and paste it into curl or your SDK. Scheduling and uploads need a workspace — copy JSON stays free.',
	mediaOnRight: false
};

const HUB_PAYLOAD_VALIDATOR_SECTION_BY_CAPABILITY: Record<
	PublicApiCapability,
	PublicApiPayloadValidatorSection
> = {
	posting: PUBLIC_API_POSTING_PAYLOAD_VALIDATOR_HUB_SECTION,
	scheduling: PUBLIC_API_SCHEDULING_PAYLOAD_VALIDATOR_HUB_SECTION
};

export function getPublicApiCapabilityPayloadValidatorHubSection(
	capability: PublicApiCapability
): PublicApiPayloadValidatorSection {
	return HUB_PAYLOAD_VALIDATOR_SECTION_BY_CAPABILITY[capability];
}
