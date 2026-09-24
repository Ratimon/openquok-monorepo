import type { PublicApiCapability } from '$lib/content/constants/apis/types';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_API_POSTING_HUB_FAQ_ITEM_IDS,
	PUBLIC_API_SCHEDULING_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/publicFaqConfig';
import { faqHrefDocs, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type PublicApiCapabilityHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

function buildPublicApiRateLimitsFaqAnswer(): string {
	return `Each opo_ token allows 30 requests per hour on OpenQuok Cloud. The limit counts HTTP requests, not posts. Send one POST for many channels when you can. OpenQuok bills workspaces on ${faqLink(publicFaqHref.pricing, 'paid plans')}, not per-post credits. Scheduled posts still use your monthly post quota. See ${faqLink(faqHrefDocs('billing/limits'), 'cloud limits')} for all limits.`;
}

function buildPostingHubFaq(): PublicApiCapabilityHubFaqSection {
	return {
		faqSubtitle: 'Posting API FAQ',
		faqTitle: 'Social media posting API, answered',
		faqDescription:
			'Plain answers about posting through the OpenQuok public API, workspace plans, and limits.',
		faqItems: appendPublicGeneralFaqItems(
			[
			{
				title: 'What is the OpenQuok social media posting API?',
				description:
					`You send one JSON request to publish on connected channels. OpenQuok creates a post group and sends each channel its job. See ${faqLink(publicFaqHref.publicApi, 'create a post')}.`
			},
			{
				title: 'Do I need a paid plan to use the posting API?',
				description:
					`Yes. The public API needs a paid workspace plan. ${faqLink(publicFaqHref.signUp, 'Sign up for free')}, connect channels with the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}, then upgrade on ${faqLink(publicFaqHref.pricing, 'Pricing')} when you are ready to ship.`
			},
			{
				title: 'Does OpenQuok charge credits per post like other posting APIs?',
				description:
					`No. OpenQuok bills workspaces, not per-post credits. Scheduled posts use your monthly post quota. Each opo_ token allows 30 requests per hour. See ${faqLink(faqHrefDocs('billing/limits'), 'cloud limits')} and ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
			},
			{
				title: 'What are the public API rate limits?',
				description: buildPublicApiRateLimitsFaqAnswer()
			},
			{
				title: 'Where do I find channel UUIDs for integrationIds?',
				description:
					`Call ${faqLink(faqHrefDocs('apis-integrations/list'), 'list integrations')} with your opo_ token. Each connected channel returns a UUID and a name such as threads or tiktok. See ${faqLink(publicFaqHref.publicApiProviders, 'provider settings')} for network fields.`
			},
			{
				title: 'Can I test payloads before I write integration code?',
				description:
					`Yes. Use the Payload Wizard on this page with sample channels. Copy JSON for free. Sign in for the full wizard, or follow the ${faqLink(publicFaqHref.cliGettingStarted, 'CLI getting started')} guide for local scripts.`
			}
		],
			PUBLIC_API_POSTING_HUB_FAQ_ITEM_IDS
		)
	};
}

function buildSchedulingHubFaq(): PublicApiCapabilityHubFaqSection {
	return {
		faqSubtitle: 'Scheduling API FAQ',
		faqTitle: 'Social media scheduling API, answered',
		faqDescription:
			'Plain answers about scheduled posts, time zones, repeat rules, and workspace limits.',
		faqItems: appendPublicGeneralFaqItems(
			[
			{
				title: 'How do I schedule a post through the API?',
				description:
					`Send ${faqLink(publicFaqHref.publicApi, 'create a post')} with status scheduled and scheduledAt set to a UTC time. OpenQuok publishes at that time. Use status draft to save without publishing.`
			},
			{
				title: 'Which time zone does scheduledAt use?',
				description:
					'Use UTC in API requests. Convert local time to UTC before you send. The dashboard may show local time, but the API reads UTC.'
			},
			{
				title: 'Can I set a repeat cadence from the API?',
				description:
					`Yes. Set repeatInterval to day, week, or month. OpenQuok schedules the next post after each publish. See ${faqLink(faqHrefDocs('cli-usages/managing-posts'), 'CLI managing posts')} for examples.`
			},
			{
				title: 'Do scheduled API posts count toward my plan quota?',
				description:
					`Yes. Scheduled posts count toward your monthly post limit. API rate limits are separate: 30 requests per hour per opo_ token. See ${faqLink(faqHrefDocs('billing/limits'), 'cloud limits')} and ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
			},
			{
				title: 'What are the scheduling API rate limits?',
				description: buildPublicApiRateLimitsFaqAnswer()
			},
			{
				title: 'How do I connect channels before I schedule?',
				description:
					`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and connect networks with the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}. Then ${faqLink(faqHrefDocs('apis-integrations/list'), 'list integrations')} to copy channel UUIDs for your first scheduled post.`
			}
		],
			PUBLIC_API_SCHEDULING_HUB_FAQ_ITEM_IDS
		)
	};
}

export function getPublicApiCapabilityHubFaq(
	capability: PublicApiCapability
): PublicApiCapabilityHubFaqSection {
	return capability === 'posting' ? buildPostingHubFaq() : buildSchedulingHubFaq();
}

export const PUBLIC_API_POSTING_HUB_FAQ = buildPostingHubFaq();

export const PUBLIC_API_SCHEDULING_HUB_FAQ = buildSchedulingHubFaq();
