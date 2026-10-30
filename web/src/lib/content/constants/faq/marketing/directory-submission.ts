import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';
import type { PublicMarketingLandingFaqSection } from '$lib/content/constants/faq/marketing/types';
import { faqHrefDocs, faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';

const DIRECTORY_AGENCY_FAQ_TITLE = 'Do you submit directories for me like a $300 agency?';
const directorySubmissionDocsHref = faqHrefDocs('directory-submission');
const chromeExtensionDocsHref = faqHrefDocs('installation/chrome-extension');
const directoryChannelsHubHref = `${route('channels')}#public-directory-channels-hub-heading`;
const buildBacklinksHref = route('build-backlinks');
const pricingHref = publicFaqHref.pricing;

export const DIRECTORY_LAUNCH_DR_GUARANTEE_FAQ_TITLE =
	'Do you guarantee a specific Domain Rating (DR) increase?';

/** Shared DR expectations FAQ — landing tool page, `/channels/{directory}`, and agent × directory landings. */
export function buildDirectoryLaunchDrGuaranteeFaqItem(options?: {
	platformLabel?: string;
}): PublicFaqItem {
	const platformLabel = options?.platformLabel?.trim();
	const platformClause = platformLabel
		? ` A ${platformLabel} launch is one listing. The same rules apply.`
		: '';

	return {
		title: DIRECTORY_LAUNCH_DR_GUARANTEE_FAQ_TITLE,
		description:
			`Directory launch is DIY software. You submit each form. OpenQuok gives business profiles, extension autofill, submission tracking, and DR analytics. We do not guarantee a DR score or a timeline.${platformClause} DR can change when your site is strong, your listings are relevant, directories allow dofollow links, and crawlers find them. New domains often see slow change. Sites with high DR may see small moves. Track DR in ${faqLink(publicFaqHref.docsInsights, 'workspace analytics')}. Pick directories in ${faqLink(buildBacklinksHref, 'Build backlinks')}.`
	};
}

/** Insert the shared DR expectations FAQ once (deduped by title). */
export function insertDirectoryLaunchDrGuaranteeFaqItems(
	items: readonly PublicFaqItem[],
	options?: { platformLabel?: string }
): PublicFaqItem[] {
	const faq = buildDirectoryLaunchDrGuaranteeFaqItem(options);
	if (items.some((item) => item.title === faq.title)) {
		return [...items];
	}
	return [...items, faq];
}

const DIRECTORY_SUBMISSION_TAILORED_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: 'Why not blast 30 directories in one day?',
		description: `Bulk automation can trigger rejections and account flags when many listings appear at once. OpenQuok spreads your work, while you open one directory at a time, review autofilled fields, and submit when it looks right. That human pace protects your brand on PeerPush, Uneed, and the next sites you add. See ${faqLink(directorySubmissionDocsHref, 'directory submission')}.`
	},
	{
		title: DIRECTORY_AGENCY_FAQ_TITLE,
		description: `No. OpenQuok is software plus your review — not a done-for-you team. You keep directory logins and approve every form. You avoid agency fees that often start around $300 on public pricing pages while still moving faster than copy-paste alone. Compare workspace plans on ${faqLink(pricingHref, 'pricing')}.`
	},
	buildDirectoryLaunchDrGuaranteeFaqItem(),
	{
		title: 'How is this different from cheap “24–48 hour” automation?',
		description: `Fast bulk tools optimize for speed. OpenQuok optimizes for approval safety: one business profile, the ${faqLink(publicFaqHref.browserExtensionLanding, 'browser extension')} for autofill, and steady progress in one dashboard. You choose which directories to open and when to click submit. Install steps: ${faqLink(chromeExtensionDocsHref, 'extension docs')}.`
	},
	{
		title: 'Which directories does OpenQuok support today?',
		description: `PeerPush and Uneed are live directory launch platforms. Each has its own submit flow and paid options on the directory site. OpenQuok does not bundle those listing fees. Browse ${faqLink(directoryChannelsHubHref, 'directory launch platforms')} and ${faqLink(buildBacklinksHref, 'build backlinks')} for research.`
	},
	{
		title: 'Can I reuse the same profile for social scheduling?',
		description: `Yes. Business profiles also feed social channels in the same workspace. Directory launch and social scheduling are separate workflows, but you keep one product story. ${faqLink(publicFaqHref.signUp, 'Sign up for free')} and connect channels from ${faqLink(publicFaqHref.connectChannelsGuide, 'Connect channel')}.`
	}
];

export const PUBLIC_DIRECTORY_SUBMISSION_LANDING_FAQ_SECTION: PublicMarketingLandingFaqSection = {
	faqSubtitle: 'Directory submission tool',
	faqTitle: 'Questions about directory launch',
	faqDescription:
		'Why we favor your review and a steady pace over overnight bulk automation — and how OpenQuok supports that workflow.',
	faqItems: appendPublicGeneralFaqItems(
		DIRECTORY_SUBMISSION_TAILORED_FAQ_ITEMS,
		PUBLIC_CHANNELS_HUB_FAQ_ITEM_IDS
	)
};
