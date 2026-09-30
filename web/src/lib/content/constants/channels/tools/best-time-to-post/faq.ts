import type { PublicFaqItem } from '$lib/content/constants/faq';
import {
	appendPublicGeneralFaqItems,
	PUBLIC_BEST_TIME_TO_POST_TOOL_FAQ_ITEM_IDS
} from '$lib/content/constants/faq';

import { BENCHMARK_SLOTS_LAST_REVIEWED } from '$lib/best-time-to-post/constants/benchmarkSlots';
import { BENCHMARK_SLOTS_SOURCE_HREF } from '$lib/best-time-to-post/constants/benchmarkSlotsPublicSource';
import { getBestTimeChannelContentOverride } from '$lib/content/constants/channels/tools/best-time-to-post/general';
import { faqLink, publicFaqHref } from '$lib/content/utils/publicFaqLinks';

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
	const sourceLink = faqLink(BENCHMARK_SLOTS_SOURCE_HREF, 'benchmarkSlots.ts on GitHub');
	return (
		`OpenQuok editors summarize public timing studies into a fixed timetable (last reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}). The calculator reads that file. We do not pull live data from your social accounts. Times use your audience’s local clock. See ${sourceLink} for every hour we ship. Pick cadence and content type in the calculator to change how many slots you get each week.`
	);
}

function channelBenchmarkSourcesFaqDescription(
	channelSlug: string,
	platformLabel: string
): string {
	const sourceLink = faqLink(BENCHMARK_SLOTS_SOURCE_HREF, 'benchmarkSlots.ts on GitHub');

	if (channelSlug === 'bluesky') {
		return (
			`The table on this page matches our open-source Bluesky timetable (reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}). We built it from public timing research — not from Bluesky’s servers and not from your account. Surveys disagree on weekend versus weekday peaks, so treat each row as a test. See ${sourceLink} for the exact hours. Change cadence or content type above to show more or fewer slots.`
		);
	}

	return (
		`These ${platformLabel} times come from OpenQuok’s open timetable (reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}). We wrote the ${platformLabel} rows from public research. We do not use your ${platformLabel} analytics. Times use your audience’s local clock. See ${sourceLink} for the source. Change cadence or content type above to show more or fewer slots.`
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
	switch (item.title) {
		case EXACT_TIME_FAQ_TITLE:
			return {
				title: item.title,
				description: `No. This page does not read your account analytics or predict your personal peak hour. It builds a ${platformLabel} timing test plan from that platform’s benchmark table in your audience timezone. Run the slots as controlled tests, then let ${platformLabel} and OpenQuok analytics decide your final schedule.`
			};
		case BENCHMARK_SOURCES_FAQ_TITLE:
			return {
				title: item.title,
				description: channelBenchmarkSourcesFaqDescription(channelSlug, platformLabel)
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
				description: `This page opens with ${platformLabel} benchmark windows locked in the calculator so you are not guessing. Adjust audience timezone, content type, and cadence, then generate a copyable timing test plan in the calculator below. For another network, pick a different channel in the By channel section, or use the all-platforms ${faqLink(publicFaqHref.bestTimeToPostTool, 'Best Time to Post')} hub.`
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

	const tailored = GENERIC_BEST_TIME_FAQ_ITEMS.map((item) =>
		tailorBestTimeFaqItem(item, slug, label)
	);
	const extraItems = getBestTimeChannelContentOverride(slug)?.extraFaqItems ?? [];

	return [...tailored, ...extraItems];
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
			faqItems: appendPublicGeneralFaqItems(
				buildChannelBestTimeFaqItems(slug, label),
				PUBLIC_BEST_TIME_TO_POST_TOOL_FAQ_ITEM_IDS
			)
		};
	}

	return {
		faqSubtitle: 'Best Time to Post FAQs',
		faqTitle: 'Timing tests, answered',
		faqDescription:
			'How benchmark tables, audience vs shown timezone, and controlled tests relate to your real posting schedule — plus how to run tests in OpenQuok.',
		faqItems: appendPublicGeneralFaqItems(
			[...GENERIC_BEST_TIME_FAQ_ITEMS],
			PUBLIC_BEST_TIME_TO_POST_TOOL_FAQ_ITEM_IDS
		)
	};
}
