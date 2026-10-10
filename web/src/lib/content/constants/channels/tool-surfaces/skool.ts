import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';
import { BENCHMARK_SLOTS_LAST_REVIEWED } from '$lib/best-time-to-post/constants/benchmarkSlots';
import { faqLink } from '$lib/content/utils/publicFaqLinks';

export const skoolToolSurfaceMeta: ToolSurfaceChannelMeta = {
	slug: 'skool',
	platformLabel: 'Skool',
	docsPath: '/docs/social-integration/skool',
	bestTime: {
		metaDescription:
			'Industry starting points for Skool communities: weekday morning, lunch, and early-evening slots in audience local time. Free timing test plan — not Skool account analytics.',
		hubDescription:
			'Weekday 9 AM, noon, and 6 PM windows for community feed timing tests.',
		seoIntroHeading: 'Starter windows for Skool group posts',
		seoIntroParagraph:
			'Course and community feeds often spike when members check in before work, at lunch, and after dinner — test these bands against your own engagement. OpenQuok does not read Skool analytics on this page.',
		highlights: [
			{ title: 'Mornings', subline: '9 AM weekdays' },
			{ title: 'Lunch', subline: '12 PM' },
			{ title: 'Evenings', subline: '~6 PM' }
		],
		officialInsightsHref: 'https://help.skool.com/',
		officialInsightsLabel: 'Skool Help'
	},
	extraBestTimeFaqItems: [
		{
			title: 'Does this tool use my Skool group analytics?',
			description:
				'No. Skool does not expose workspace or per-post metrics in OpenQuok today, and this calculator does not read your Skool login. It outputs a benchmark timing test plan from a static table (last reviewed ' +
				BENCHMARK_SLOTS_LAST_REVIEWED +
				'). Run the slots, then see what gets replies in your group feed.'
		}
	],
	photoEditor: {
		metaDescription:
			'Free Skool community post image editor. Export 16:9 and 1:1 PNGs from Skool presets — Skool has no published required dimensions; these match common inline feed images.',
		hubDescription: '16:9 and 1:1 canvas presets for community post attachments.',
		heroLead:
			'Skool does not publish fixed image dimensions. OpenQuok presets export 1200×675 (16:9) and 1080×1080 (1:1) — resize graphics before you attach them in the composer.',
		faqTitle: 'What image size should I use on Skool posts?',
		faqBodyLead:
			'Skool accepts images on the main post and on follow-up comments when the group allows media. Use the 16:9 preset for wide graphics and 1:1 for square cards — then upload from OpenQuok at publish time.'
	},
	skillBuilder: {
		metaDescription:
			'Free Skool skill builder. Community post recipes with title, group, category, images, and follow-up comments — export SKILL.md for agents after browser extension connect.',
		hubDescription: 'Group posts with title, category, images, and skool.replies follow-ups.',
		heroLead:
			'Pre-loaded Skool posts:create recipes — title and group settings, optional label, image attachments, and delayed follow-up comments. Connect with the OpenQuok browser extension first.',
		faqTitle: 'How do I build a Skool agent skill?',
		faqBodyLead: `Install the ${faqLink('/docs/installation/chrome-extension', 'OpenQuok browser extension')}, connect Skool in the dashboard, then export SKILL.md from the recipes on this page — aligned with Skool CLI examples.`
	}
};
