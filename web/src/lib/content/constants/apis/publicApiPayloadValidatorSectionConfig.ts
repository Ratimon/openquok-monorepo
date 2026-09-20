import type { PublicApiCapability } from '$lib/content/constants/apis/types';

export type PublicApiPayloadValidatorSection = {
	subtitle: string;
	title: string;
	description: string;
	mediaOnRight?: boolean;
};

export const PUBLIC_API_POSTING_PAYLOAD_VALIDATOR_HUB_SECTION: PublicApiPayloadValidatorSection = {
	subtitle: 'Free payload wizard',
	title: 'Test your social media posting API payload before you ship code',
	description:
		'Compose a post with sample channels in your browser. Copy the JSON body and paste it into curl, your SDK, or an agent workflow. Copy JSON is free — no account required. Scheduling and file uploads need a workspace.',
	mediaOnRight: true
};

export const PUBLIC_API_SCHEDULING_PAYLOAD_VALIDATOR_HUB_SECTION: PublicApiPayloadValidatorSection = {
	subtitle: 'Free payload wizard',
	title: 'Test your social media scheduling API payload before you ship code',
	description:
		'Compose a scheduled post with sample channels in your browser. Set the publish time and optional repeat cadence, then copy the JSON body. Copy JSON is free — no account required. Scheduling and file uploads need a workspace.',
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
