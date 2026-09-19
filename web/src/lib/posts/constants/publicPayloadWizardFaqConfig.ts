import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

import { getPublicApiPostingPlatformBySlug } from '$lib/content/constants/apis/index';
import {
	buildToolChannelFaqLinks,
	faqHrefDocs,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

export type PayloadWizardFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

const WHAT_IS_PAYLOAD_WIZARD_FAQ_TITLE = 'What is the Payload Wizard?';
const IS_FREE_FAQ_TITLE = 'Is the Payload Wizard free?';
const ACCOUNT_FAQ_TITLE = 'Do I need to sign up to copy JSON?';
const SAMPLE_CHANNELS_FAQ_TITLE = 'Are the channels on this page my connected accounts?';
const ENDPOINT_FAQ_TITLE = 'Which API endpoint does the copied JSON target?';
const ORGANIZATION_ID_FAQ_TITLE = 'Why is organizationId missing from the payload?';
const WORKSPACE_FAQ_TITLE = 'When should I open the workspace Payload Wizard?';
const PLATFORM_FAQ_TITLE = 'Can I build a payload for a specific platform?';

const GENERIC_PAYLOAD_WIZARD_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: WHAT_IS_PAYLOAD_WIZARD_FAQ_TITLE,
		description:
			`A free composer on ${faqLink(publicFaqHref.publicApi, 'POST /public/posts')} that turns your draft into copy-ready JSON. Sample channels show realistic integration UUIDs and provider settings. Copy JSON stays on this page without an account.`
	},
	{
		title: IS_FREE_FAQ_TITLE,
		description:
			'Yes. Compose with sample channels, preview the live payload, and copy JSON at no cost. You do not need a trial or credit card to use the public tool. Sign in only when you want connected channels, uploads, or scheduling from your workspace.'
	},
	{
		title: ACCOUNT_FAQ_TITLE,
		description:
			'No. Copy JSON works without sign up. Schedule, upload media, and connect real channels require a workspace. Use Not now on the sign-in dialog to keep building payloads on this page.'
	},
	{
		title: SAMPLE_CHANNELS_FAQ_TITLE,
		description:
			'No. Channel chips are samples for format and field names. Replace integration UUIDs with values from GET /public/integrations after you connect channels in your workspace.'
	},
	{
		title: ENDPOINT_FAQ_TITLE,
		description:
			`POST /api/v1/public/posts. Send the copied JSON with your programmatic OAuth token. See ${faqLink(publicFaqHref.publicApi, 'Public API getting started')} for auth and request shape.`
	},
	{
		title: ORGANIZATION_ID_FAQ_TITLE,
		description:
			'Programmatic auth derives the organization from your OAuth app token. The preview omits organizationId on purpose so the payload matches what the API expects.'
	},
	{
		title: WORKSPACE_FAQ_TITLE,
		description:
			`Open the workspace wizard after you sign in when you want connected channels, real integration UUIDs, and media from your library. The public tool on ${faqLink(publicFaqHref.socialMediaPostingApi, 'posting API')} landing pages uses the same sample-channel flow.`
	},
	{
		title: PLATFORM_FAQ_TITLE,
		description:
			`Yes. Pick a sample chip in the composer or open a channel page from the By channel grid below. Each ${faqLink(publicFaqHref.publicApiProviders, 'provider settings')} doc lists the fields that land in providerSettingsByIntegrationId.`
	}
];

function tailorPayloadWizardFaqItem(
	item: PublicFaqItem,
	channelSlug: string,
	platformLabel: string
): PublicFaqItem {
	const toolLinks = buildToolChannelFaqLinks('payload-wizard', channelSlug);
	const platform = getPublicApiPostingPlatformBySlug(channelSlug);
	const providerDocsHref = platform
		? faqHrefDocs(platform.publicApiProvidersDocsPath)
		: faqHrefDocs('public-api-providers');

	switch (item.title) {
		case WHAT_IS_PAYLOAD_WIZARD_FAQ_TITLE:
			return {
				title: item.title,
				description: `A free ${platformLabel} payload builder for ${faqLink(publicFaqHref.publicApi, 'POST /public/posts')}. This ${faqLink(toolLinks.toolChannel, `${platformLabel} Payload Wizard page`)} opens with ${platformLabel} selected and shows static format tabs from shipped examples.`
			};
		case IS_FREE_FAQ_TITLE:
		case ACCOUNT_FAQ_TITLE:
		case SAMPLE_CHANNELS_FAQ_TITLE:
		case ENDPOINT_FAQ_TITLE:
		case ORGANIZATION_ID_FAQ_TITLE:
			return item;
		case WORKSPACE_FAQ_TITLE:
			return {
				title: item.title,
				description:
					`Sign in to use connected ${platformLabel} channels and copy payloads with real integration UUIDs. Field reference: ${faqLink(providerDocsHref, `${platformLabel} provider settings`)}.`
			};
		case PLATFORM_FAQ_TITLE:
			return {
				title: `What's included for ${platformLabel}?`,
				description: `This page preselects ${platformLabel}, shows posting format examples, and focuses provider settings on that network. For another platform, use the By channel grid or the generic ${faqLink(toolLinks.toolLanding, 'Payload Wizard')}.`
			};
		default:
			return item;
	}
}

function buildChannelPayloadWizardFaqItems(
	channelSlug: string,
	platformLabel: string
): PublicFaqItem[] {
	return GENERIC_PAYLOAD_WIZARD_FAQ_ITEMS.map((item) =>
		tailorPayloadWizardFaqItem(item, channelSlug, platformLabel)
	);
}

export function buildPayloadWizardFaqSection(
	channelSlug?: string | null,
	channelLabel?: string | null
): PayloadWizardFaqSection {
	const slug = channelSlug?.trim().toLowerCase();
	const label = channelLabel?.trim();

	if (slug && label) {
		return {
			faqSubtitle: 'Payload Wizard FAQs',
			faqTitle: `${label} Payload Wizard, answered`,
			faqDescription: `How sample channels work for ${label}, which endpoint the JSON targets, and when to open your workspace wizard.`,
			faqItems: buildChannelPayloadWizardFaqItems(slug, label)
		};
	}

	return {
		faqSubtitle: 'Payload Wizard FAQs',
		faqTitle: 'Payload Wizard, answered',
		faqDescription:
			'Free JSON preview for POST /public/posts — sample channels, copy without sign up, and when to use the workspace wizard.',
		faqItems: [...GENERIC_PAYLOAD_WIZARD_FAQ_ITEMS]
	};
}
