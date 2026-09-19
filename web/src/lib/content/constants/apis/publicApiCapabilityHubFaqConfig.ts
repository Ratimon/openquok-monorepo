import type { PublicApiCapability } from '$lib/content/constants/apis/types';
import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import { faqHrefDocs, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

export type PublicApiCapabilityHubFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

function buildPublicApiRateLimitsFaqAnswer(): string {
	return `Each workspace programmatic token (opo_…) is limited to 30 requests per hour across all /public/* endpoints on OpenQuok Cloud. The cap applies per HTTP request, not per post — batch multiple channels in one POST to stay efficient. OpenQuok bills workspaces on ${faqLink(publicFaqHref.pricing, 'paid plans')}, not per-post credits. Scheduled posts still count toward your monthly post quota. See ${faqLink(faqHrefDocs('cloud/limits'), 'cloud limits')} for every cap.`;
}

function buildPostingHubFaq(): PublicApiCapabilityHubFaqSection {
	return {
		faqSubtitle: 'Posting API FAQ',
		faqTitle: 'Social media posting API, answered',
		faqDescription:
			'How OpenQuok public API posting works, what you need before your first request, and how workspace billing differs from credit-based APIs.',
		faqItems: [
			{
				title: 'What is the OpenQuok social media posting API?',
				description:
					`It is the programmatic surface behind ${faqLink(publicFaqHref.publicApi, 'POST /public/posts')}. You send one JSON payload with channel UUIDs, optional media, and per-network provider settings. OpenQuok creates the post group and enqueues publish jobs for each channel row.`
			},
			{
				title: 'Do I need a paid plan to use the posting API?',
				description:
					`Yes. Public API access is included on paid workspace plans, not the free tier. ${faqLink(publicFaqHref.signUp, 'Sign up for free')} to start a trial, connect channels with the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}, then upgrade on ${faqLink(publicFaqHref.pricing, 'Pricing')} when you are ready to ship.`
			},
			{
				title: 'Does OpenQuok charge credits per post like other posting APIs?',
				description:
					`No. OpenQuok bills workspaces, not per-post credits. Scheduled posts count toward your monthly post quota on the plan you choose. API traffic is subject to a 30 requests per hour cap per opo_ token — see ${faqLink(faqHrefDocs('cloud/limits'), 'cloud limits')} and ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
			},
			{
				title: 'What are the public API rate limits?',
				description: buildPublicApiRateLimitsFaqAnswer()
			},
			{
				title: 'Where do I find channel UUIDs for integrationIds?',
				description:
					`Call ${faqLink(faqHrefDocs('apis-integrations/list'), 'GET /public/integrations')} with your workspace programmatic token. Each connected channel returns a UUID and an identifier such as \`threads\` or \`tiktok\`. Per-network field tables live under ${faqLink(publicFaqHref.publicApiProviders, 'provider settings')}.`
			},
			{
				title: 'Can I test payloads before I write integration code?',
				description:
					`Yes. Use the Payload Wizard bento on this page with sample channels. Copy JSON stays free. After you sign in, open the full wizard in your workspace or follow the ${faqLink(publicFaqHref.cliGettingStarted, 'CLI getting started')} guide for local scripts.`
			}
		]
	};
}

function buildSchedulingHubFaq(): PublicApiCapabilityHubFaqSection {
	return {
		faqSubtitle: 'Scheduling API FAQ',
		faqTitle: 'Social media scheduling API, answered',
		faqDescription:
			'How scheduledAt, time zones, repeat intervals, and workspace quotas work when you schedule posts through the public API.',
		faqItems: [
			{
				title: 'How do I schedule a post through the API?',
				description:
					`Send ${faqLink(publicFaqHref.publicApi, 'POST /public/posts')} with \`status: "scheduled"\` and \`scheduledAt\` set to an ISO-8601 UTC timestamp. OpenQuok stores the instant in UTC and publishes when the worker dequeues the row. Use \`draft\` when you want to persist without enqueuing.`
			},
			{
				title: 'Which time zone does scheduledAt use?',
				description:
					'OpenQuok expects UTC in API payloads. Convert your local publish time to UTC before you send the request. The dashboard calendar shows times in your browser locale, but the API always reads ISO-8601 with a Z suffix or an explicit offset.'
			},
			{
				title: 'Can I set a repeat cadence from the API?',
				description:
					`Yes. Pass \`repeatInterval\` with values such as \`day\`, \`week\`, or \`month\`. After a post publishes, OpenQuok queues the next copy on that cadence. See ${faqLink(faqHrefDocs('cli-usages/managing-posts'), 'CLI managing posts')} for examples that mirror the API shape.`
			},
			{
				title: 'Do scheduled API posts count toward my plan quota?',
				description:
					`Yes. Every scheduled row counts toward \`posts_per_month\` on your workspace plan. API rate limits are separate from post volume — each opo_ token gets 30 requests per hour on OpenQuok Cloud. See ${faqLink(faqHrefDocs('cloud/limits'), 'cloud limits')} and ${faqLink(publicFaqHref.pricing, 'Pricing')}.`
			},
			{
				title: 'What are the scheduling API rate limits?',
				description: buildPublicApiRateLimitsFaqAnswer()
			},
			{
				title: 'How do I connect channels before I schedule?',
				description:
					`${faqLink(publicFaqHref.signUp, 'Sign up for free')}, open a workspace, and connect networks with the ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels guide')}. List UUIDs with ${faqLink(faqHrefDocs('apis-integrations/list'), 'GET /public/integrations')} before your first scheduled payload.`
			}
		]
	};
}

export function getPublicApiCapabilityHubFaq(
	capability: PublicApiCapability
): PublicApiCapabilityHubFaqSection {
	return capability === 'posting' ? buildPostingHubFaq() : buildSchedulingHubFaq();
}

export const PUBLIC_API_POSTING_HUB_FAQ = buildPostingHubFaq();

export const PUBLIC_API_SCHEDULING_HUB_FAQ = buildSchedulingHubFaq();
