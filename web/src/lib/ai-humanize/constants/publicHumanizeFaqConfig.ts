import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

export type HumanizeFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

const WHAT_IS_HUMANIZER_FAQ_TITLE = 'What is OpenQuok Humanizer?';
const ACCOUNT_FAQ_TITLE = 'Do I need an OpenQuok account?';
const HUMAN_VS_ROUGHEN_FAQ_TITLE = 'What is Human vs Roughen?';
const CHROME_FAQ_TITLE = 'Does Humanizer require Chrome?';
const GUARANTEE_FAQ_TITLE = 'Does this guarantee a post will read as written by a person?';
const PLATFORM_FAQ_TITLE = 'Can I humanize a post for a specific platform?';

const GENERIC_HUMANIZE_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: WHAT_IS_HUMANIZER_FAQ_TITLE,
		description:
			'A free browser composer that rewrites a draft so it reads less machine-written. Human mode cleans stock phrasing; Roughen makes the voice more spoken. Work stays on this page until you copy it or sign in to schedule.'
	},
	{
		title: ACCOUNT_FAQ_TITLE,
		description:
			'No. You can rewrite, attach local media, and copy the result without an account. The channel chips on this page are samples for format and character limits — they are not your accounts. Sign in or sign up only when you want to connect real accounts in your workspace and schedule.'
	},
	{
		title: HUMAN_VS_ROUGHEN_FAQ_TITLE,
		description:
			'Human is the default: keep it a social post, drop em-dash habits and stock phrasing, and vary sentence length. Roughen is rougher and more spoken — review any invented names, dates, or prices before you post.'
	},
	{
		title: CHROME_FAQ_TITLE,
		description:
			'The on-device Rewriter runs in supported Chromium browsers. If Rewriter is missing, Humanizer still applies a local phrasing cleanup so the page does something useful. Availability depends on browser support and hardware.'
	},
	{
		title: GUARANTEE_FAQ_TITLE,
		description:
			'No. Humanizer rewrites habits that often show up in machine-written drafts. Review the result and swap any details that are not yours. We do not claim outcomes against any writing classifier.'
	},
	{
		title: PLATFORM_FAQ_TITLE,
		description:
			'Yes. This page is Global Edit across sample channels — pick a sample chip in the composer to preview that format and character limit, including networks whose scheduler is still coming soon. Those chips are not your accounts. Sign in or sign up to connect real channels in your workspace and schedule.'
	}
];

function tailorHumanizeFaqItem(
	item: PublicFaqItem,
	channelSlug: string,
	platformLabel: string
): PublicFaqItem {
	switch (item.title) {
		case WHAT_IS_HUMANIZER_FAQ_TITLE:
			return {
				title: item.title,
				description: `A free browser composer that rewrites a ${platformLabel} draft so it reads less machine-written. Human mode cleans stock phrasing; Roughen makes the voice more spoken. This ${channelSlug} page focuses the preview and character limit on ${platformLabel}.`
			};
		case ACCOUNT_FAQ_TITLE:
			return item;
		case HUMAN_VS_ROUGHEN_FAQ_TITLE:
			return item;
		case CHROME_FAQ_TITLE:
			return item;
		case GUARANTEE_FAQ_TITLE:
			return item;
		case PLATFORM_FAQ_TITLE:
			return {
				title: `What's included for ${platformLabel}?`,
				description: `This page opens with ${platformLabel} selected so the preview and soft character limit match that network. Rewrite on-device, copy the result, then sign in or sign up to connect a real ${platformLabel} account in your workspace and schedule. For another platform, pick a different sample chip in the composer.`
			};
		default:
			return item;
	}
}

function buildChannelHumanizeFaqItems(channelSlug: string, platformLabel: string): PublicFaqItem[] {
	const slug = channelSlug.trim().toLowerCase();
	const label = platformLabel.trim();

	return GENERIC_HUMANIZE_FAQ_ITEMS.map((item) => tailorHumanizeFaqItem(item, slug, label));
}

export function buildHumanizeFaqSection(
	channelSlug?: string | null,
	channelLabel?: string | null
): HumanizeFaqSection {
	const slug = channelSlug?.trim().toLowerCase();
	const label = channelLabel?.trim();

	if (slug && label) {
		return {
			faqSubtitle: 'Humanizer FAQs',
			faqTitle: `${label} Humanizer, answered`,
			faqDescription: `How Human and Roughen work for ${label} drafts, when Chrome is required, and when to sign in to schedule.`,
			faqItems: buildChannelHumanizeFaqItems(slug, label)
		};
	}

	return {
		faqSubtitle: 'Humanizer FAQs',
		faqTitle: 'Humanizer, answered',
		faqDescription:
			'How Human and Roughen work, when Chrome is required, and when to sign in to save or schedule a post.',
		faqItems: [...GENERIC_HUMANIZE_FAQ_ITEMS]
	};
}
