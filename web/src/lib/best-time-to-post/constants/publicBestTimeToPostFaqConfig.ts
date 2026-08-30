import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';

import { BENCHMARK_SLOTS_LAST_REVIEWED } from '$lib/best-time-to-post/constants/benchmarkSlots';
import {
	buildToolChannelFaqLinks,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

export type BestTimeToPostFaqSection = {
	faqSubtitle: string;
	faqTitle: string;
	faqDescription: string;
	faqItems: PublicFaqItem[];
};

const PLATFORM_WINDOWS_FAQ_TITLE =
	'What if I want windows for a specific platform (e.g. TikTok)?';

const BENCHMARK_SOURCES_FAQ_TITLE = 'Where do the suggested clock times come from?';

function benchmarkSourcesFaqDescription(): string {
	return (
		'Each platform has a fixed benchmark catalog (morning, lunch, and evening-style windows) aligned with published industry timing surveys — last reviewed ' +
		BENCHMARK_SLOTS_LAST_REVIEWED +
		'. Slots are computed in your audience timezone (when viewers should see the post). Shown timezone only changes how those same moments appear in the text and calendar preview (for example Bangkok local time while the audience is in New York). Cadence picks which days and how many windows per day; “3 posts per week” uses the primary window on Tuesday, Wednesday, and Thursday. Nothing is pulled from your connected channels or platform analytics APIs.'
	);
}

const EXACT_TIME_FAQ_TITLE = 'Does this calculator know my exact best posting time?';

function exactBestTimeFaqDescription(): string {
	return (
		'No. This tool does not read your account analytics or predict a personal “best hour.” It outputs a timing test plan: concrete publish times you can copy and schedule, built from the benchmark catalog (see the next question). Run those posts as controlled tests for one to two weeks, then keep the windows that your OpenQuok workspace and each platform’s insights show actually work for your audience.'
	);
}

const GENERIC_BEST_TIME_FAQ_ITEMS: readonly PublicFaqItem[] = [
	{
		title: EXACT_TIME_FAQ_TITLE,
		description: exactBestTimeFaqDescription()
	},
	{
		title: BENCHMARK_SOURCES_FAQ_TITLE,
		description: benchmarkSourcesFaqDescription()
	},
	{
		title: 'Why does the tool include multiple slots?',
		description:
			'A single “magic” hour is rarely reliable. Multiple slots let you A/B test nearby windows across the week so you can replace generic advice with data from your audience.'
	},
	{
		title: 'Can I schedule the suggested slots with OpenQuok?',
		description:
			`Yes. Copy the timing test plan or use the week preview as a guide, then create scheduled posts in your OpenQuok workspace calendar, ${faqLink(publicFaqHref.cliGettingStarted, 'CLI')}, or ${faqLink(publicFaqHref.publicApi, 'Public API')}. This tool does not publish for you.`
	},
	{
		title: 'Do I need an OpenQuok account?',
		description:
			'No to generate and copy a timing test plan. Sign in when you want to queue the slots on your connected channels and track results in workspace analytics.'
	},
	{
		title: PLATFORM_WINDOWS_FAQ_TITLE,
		description:
			`Stay on this page for any platform, or open a channel page under By channel on ${faqLink(publicFaqHref.bestTimeToPostTool, 'Best Time to Post')} — TikTok, Instagram, LinkedIn, X, and other live networks. Each channel page defaults the calculator to that platform’s benchmark windows.`
	}
];

function tailorBestTimeFaqItem(
	item: PublicFaqItem,
	channelSlug: string,
	platformLabel: string
): PublicFaqItem {
	const toolLinks = buildToolChannelFaqLinks('best-time-to-post', channelSlug);

	switch (item.title) {
		case EXACT_TIME_FAQ_TITLE:
			return {
				title: item.title,
				description: `No. This ${faqLink(toolLinks.toolChannel, `${platformLabel} timing page`)} does not read your account analytics or predict your personal peak hour. It builds a ${platformLabel} timing test plan from that platform’s benchmark table in your audience timezone. Run the slots as controlled tests, then let ${platformLabel} and OpenQuok analytics decide your final schedule.`
			};
		case BENCHMARK_SOURCES_FAQ_TITLE:
			return {
				title: item.title,
				description: `The ${platformLabel} rows in our benchmark catalog (reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}) define typical ${platformLabel} windows in audience local time. This channel page pre-selects ${platformLabel}; cadence and content type choose how many of those windows appear each week. Shown timezone is for your local reading only — not a second schedule.`
			};
		case 'Why does the tool include multiple slots?':
			return {
				title: item.title,
				description: `A single “magic” ${platformLabel} hour is rarely reliable. Multiple slots let you A/B test nearby ${platformLabel} windows across the week so you can replace generic advice with data from your audience.`
			};
		case 'Can I schedule the suggested slots with OpenQuok?':
			return {
				title: item.title,
				description: `Yes. Copy the ${platformLabel} timing test plan or use the week preview as a guide, then create scheduled posts to your connected ${platformLabel} channel in OpenQuok via the calendar, ${faqLink(publicFaqHref.cliGettingStarted, 'CLI')}, or ${faqLink(publicFaqHref.publicApi, 'Public API')}. This tool does not publish for you.`
			};
		case 'Do I need an OpenQuok account?':
			return item;
		case PLATFORM_WINDOWS_FAQ_TITLE:
			return {
				title: `What's included for ${platformLabel}?`,
				description: `This page opens with ${platformLabel} benchmark windows already selected so you are not guessing. Adjust timezone, content type, and cadence, then generate a timing test plan on ${faqLink(toolLinks.toolChannel, `${platformLabel} Best Time to Post`)}. For another network, pick a different channel in the By channel section.`
			};
		default:
			return item;
	}
}

function buildChannelBestTimeFaqItems(
	channelSlug: string,
	platformLabel: string
): PublicFaqItem[] {
	const slug = channelSlug.trim().toLowerCase();
	const label = platformLabel.trim();

	return GENERIC_BEST_TIME_FAQ_ITEMS.map((item) => tailorBestTimeFaqItem(item, slug, label));
}

export function buildBestTimeToPostFaqSection(
	channelSlug?: string | null,
	channelLabel?: string | null
): BestTimeToPostFaqSection {
	const slug = channelSlug?.trim().toLowerCase();
	const label = channelLabel?.trim();

	if (slug && label) {
		return {
			faqSubtitle: 'Best Time to Post FAQs',
			faqTitle: `${label} timing tests, answered`,
			faqDescription: `How ${label} benchmark windows, audience vs shown timezone, and controlled tests relate to your real posting schedule — plus how to schedule in OpenQuok.`,
			faqItems: buildChannelBestTimeFaqItems(slug, label)
		};
	}

	return {
		faqSubtitle: 'Best Time to Post FAQs',
		faqTitle: 'Timing tests, answered',
		faqDescription:
			'How benchmark tables, audience vs shown timezone, and controlled tests relate to your real posting schedule — plus how to run tests in OpenQuok.',
		faqItems: [...GENERIC_BEST_TIME_FAQ_ITEMS]
	};
}
