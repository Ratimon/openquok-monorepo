import { BENCHMARK_SLOTS_LAST_REVIEWED } from '$lib/best-time-to-post/constants/benchmarkSlots';
import { formatBenchmarkWindowsForSeo } from '$lib/best-time-to-post/utils/formatBenchmarkWindowsForSeo';
import type { ChannelToolContentOverride } from '$lib/content/constants/channels/tools/shared/channelToolContentOverride.types';
import {
	buildChannelFaqLinks,
	buildToolChannelFaqLinks,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

const BLUESKY_DOCS_PATH = '/docs/social-integration/bluesky';
const channelLinks = buildChannelFaqLinks('bluesky', BLUESKY_DOCS_PATH);

const benchmarkTableRows = formatBenchmarkWindowsForSeo('bluesky');

function buildBenchmarkFaqTableHtml(): string {
	const body = benchmarkTableRows
		.map(
			(row) =>
				`<tr><td>${row.dayLabel}</td><td>${row.primaryTime}${
					row.secondaryTimes ? `, ${row.secondaryTimes}` : ''
				}</td></tr>`
		)
		.join('');

	return `<table><thead><tr><th>Day</th><th>Audience-local windows</th></tr></thead><tbody>${body}</tbody></table>`;
}

const bestTimeToolLinks = buildToolChannelFaqLinks('best-time-to-post', 'bluesky');
const photoEditorToolLinks = buildToolChannelFaqLinks('photo-editor', 'bluesky');
const skillBuilderToolLinks = buildToolChannelFaqLinks('skill-builder', 'bluesky');

/** Matches `aspectRatioPresets.ts` Bluesky group export sizes — editor defaults, not Bluesky-required dimensions. */
const BLUESKY_CANVAS_EXPORT_SIZES =
	'1080×1080 (1:1), 1080×1350 (4:5), and 1200×675 (16:9)';

/** `/tools/best-time-to-post/bluesky` — merged in best-time-to-post/general.ts */
export const blueskyBestTimeContentOverride: ChannelToolContentOverride = {
	metaTitle: 'Bluesky Best Times to Post (2026) — Free Test Plan',
	metaDescription:
		'Industry starting points for Bluesky: Tue–Wed 9–11 AM, weekday evenings around 6–8 PM, and Saturday near 5 PM in your audience timezone. Generate a free timing test plan with our calculator — not a personal peak-hour prediction.',
	hubDescription: 'Weekday 9 AM, noon, and 6 PM windows plus weekend evening slots for timing tests.',
	seoIntro: {
		heading: 'Starter windows to test in 2026',
		paragraphs: [
			'Popular weekday and weekend slots to try — not based on your account. Test for one to two weeks, then keep what works.'
		],
		highlights: [
			{ title: 'Weekday mornings', subline: 'Tue–Wed 9–11 AM' },
			{ title: 'Evenings', subline: 'About 6–8 PM' },
			{ title: 'Weekend', subline: 'Saturday ~5 PM' }
		],
		benchmarkTableCaption: `Full week · audience local time · reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}`,
		benchmarkTableRows,
		closingHtml: `Turn the grid into a copyable week plan in the <a href="#best-time-calculator">calculator below</a> — or ${faqLink(publicFaqHref.signUp, 'sign up')} to schedule on ${faqLink(channelLinks.channelLanding, 'Bluesky in OpenQuok')}.`
	},
	extraFaqItems: [
		{
			title: 'What are good times to post on Bluesky in 2026?',
			description:
				`These audience-local windows are industry starting points (reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}), not your personal peak hour:${buildBenchmarkFaqTableHtml()}Run them as controlled tests for one to two weeks, then keep the slots that work. Schedule winners from ${faqLink(channelLinks.channelLanding, 'Bluesky in OpenQuok')} or regenerate a plan on ${faqLink(bestTimeToolLinks.toolChannel, 'this calculator')}.`
		}
	]
};

/** `/tools/photo-editor/bluesky` — merged in photo-editor/general.ts */
export const blueskyPhotoEditorContentOverride: ChannelToolContentOverride = {
	metaDescription: `Free Bluesky photo editor in your browser. Export 1:1, 4:5, and 16:9 PNGs (${BLUESKY_CANVAS_EXPORT_SIZES}) from the Bluesky preset tab — download free, or save to your cloud when signed in. No sign up required.`,
	hubDescription: '1:1, 4:5, and 16:9 canvas presets (common ratios — Bluesky has no fixed size requirement).',
	heroLead: `Canvas presets pre-selected: ${BLUESKY_CANVAS_EXPORT_SIZES}. Bluesky accepts many aspect ratios; these match OpenQuok’s export defaults.`,
	extraFaqItems: [
		{
			title: 'What image sizes work on Bluesky?',
			description: `Bluesky does not publish required pixel dimensions — posts can use varied aspect ratios (up to four images or one MP4 per post). OpenQuok’s photo editor exports ${BLUESKY_CANVAS_EXPORT_SIZES} when you pick the matching presets on ${faqLink(photoEditorToolLinks.toolChannel, 'this Bluesky Photo Editor page')}. Design on the canvas, download a PNG, or save to your library, then attach when you schedule from ${faqLink(channelLinks.channelLanding, 'Bluesky in OpenQuok')}.`
		}
	]
};

/** `/tools/skill-builder/bluesky` — merged in skill-builder/general.ts */
export const blueskySkillBuilderContentOverride: ChannelToolContentOverride = {
	metaDescription:
		'Free Bluesky skill builder in your browser. Compose posts:create recipes with pre-loaded openquok CLI steps, preview SKILL.md, and export for your agent — text posts, up to four images per post, and follow-up replies. No sign up required.',
	hubDescription: 'SKILL.md export with posts:create, multi-image posts, and reply recipes.',
	heroLead:
		'Pre-loaded Bluesky posts:create recipes — text posts, up to four images on one post, and follow-up replies. Preview SKILL.md and export for your agent, or open Bluesky CLI examples from the link below.',
	extraFaqItems: [
		{
			title: 'How do I build a Bluesky agent skill?',
			description: `Open ${faqLink(skillBuilderToolLinks.toolChannel, 'this Bluesky Skill Builder page')}. Review the pre-loaded posts:create steps for text, images, and bluesky.replies. Add building blocks from the catalog if you need MCP tools. Preview SKILL.md, edit frontmatter and steps, then download the file for your agent host. When your skill schedules posts, connect Bluesky in your workspace first — ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels in OpenQuok')}. Command shapes match ${faqLink(publicFaqHref.cliBluesky, 'Bluesky CLI examples')}.`
		}
	]
};
