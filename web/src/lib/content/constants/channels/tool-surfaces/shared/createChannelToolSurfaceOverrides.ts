import { BENCHMARK_SLOTS_LAST_REVIEWED } from '$lib/best-time-to-post/constants/benchmarkSlots';
import { formatBenchmarkWindowsForSeo } from '$lib/best-time-to-post/utils/formatBenchmarkWindowsForSeo';
import type { PublicFaqItem } from '$lib/content/constants/faq';
import type { ChannelToolContentOverride } from '$lib/content/constants/channels/tools/shared/channelToolContentOverride.types';
import {
	buildChannelFaqLinks,
	buildToolChannelFaqLinks,
	faqHrefDocs,
	faqLink,
	publicFaqHref
} from '$lib/content/utils/publicFaqLinks';

import { buildBenchmarkFaqTableHtml } from '$lib/content/constants/channels/tool-surfaces/shared/buildBenchmarkFaqTableHtml';
import { getToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMetaBySlug';
import type { ToolSurfaceChannelMeta } from '$lib/content/constants/channels/tool-surfaces/shared/channelToolSurfaceMeta.types';

const CLI_EXAMPLES_HREF_BY_SLUG: Record<string, string> = {
	facebook: publicFaqHref.cliFacebook,
	threads: publicFaqHref.cliThreads,
	instagram: publicFaqHref.cliInstagram,
	youtube: publicFaqHref.cliYoutube,
	tiktok: publicFaqHref.cliTiktok,
	linkedin: publicFaqHref.cliLinkedin,
	x: publicFaqHref.cliX,
	bluesky: publicFaqHref.cliBluesky,
	devto: publicFaqHref.cliDevto
};

function resolveMeta(slug: string): ToolSurfaceChannelMeta {
	return getToolSurfaceChannelMeta(slug);
}

export function createBestTimeContentOverrideFromMeta(
	meta: ToolSurfaceChannelMeta
): ChannelToolContentOverride {
	const slug = meta.slug;
	const { platformLabel, bestTime } = meta;
	const benchmarkTableRows = formatBenchmarkWindowsForSeo(slug);
	const channelLinks = buildChannelFaqLinks(slug, meta.docsPath);
	const bestTimeToolLinks = buildToolChannelFaqLinks('best-time-to-post', slug);
	const tableHtml = buildBenchmarkFaqTableHtml(slug);

	const extraFaqItems: PublicFaqItem[] = [
		{
			title: `What are good times to post on ${platformLabel} in 2026?`,
			description:
				`These audience-local windows are industry starting points (reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}), not your personal peak hour:${tableHtml}Run them as controlled tests for one to two weeks, then keep the slots that work. Schedule winners from ${faqLink(channelLinks.channelLanding, `${platformLabel} in OpenQuok`)} or regenerate a plan on ${faqLink(bestTimeToolLinks.toolChannel, 'this calculator')}.`
		}
	];

	if (bestTime.officialInsightsHref && bestTime.officialInsightsLabel) {
		extraFaqItems.push({
			title: `How do I find my real best time on ${platformLabel}?`,
			description: `This page does not read your ${platformLabel} analytics. After you run the benchmark test plan, open ${faqLink(bestTime.officialInsightsHref, bestTime.officialInsightsLabel)} and compare engagement for the windows you tried. Adjust your OpenQuok schedule from what your account data shows — not from the static table alone.`
		});
	}

	const channelExtraBestTime = meta.extraBestTimeFaqItems ?? [];

	return {
		metaTitle: `${platformLabel} Best Times to Post (2026) — Free Test Plan`,
		metaDescription: bestTime.metaDescription,
		hubDescription: bestTime.hubDescription,
		seoIntro: {
			heading: bestTime.seoIntroHeading,
			paragraphs: [bestTime.seoIntroParagraph],
			highlights: bestTime.highlights,
			benchmarkTableCaption: `Full week · audience local time · reviewed ${BENCHMARK_SLOTS_LAST_REVIEWED}`,
			benchmarkTableRows,
			closingHtml: `Turn the grid into a copyable week plan in the <a href="#best-time-calculator">calculator below</a> — or ${faqLink(publicFaqHref.signUp, 'sign up')} to schedule on ${faqLink(channelLinks.channelLanding, `${platformLabel} in OpenQuok`)}.`
		},
		extraFaqItems: [...channelExtraBestTime, ...extraFaqItems]
	};
}

export function createBestTimeContentOverride(slug: string): ChannelToolContentOverride {
	return createBestTimeContentOverrideFromMeta(resolveMeta(slug));
}

export function createPhotoEditorContentOverrideFromMeta(
	meta: ToolSurfaceChannelMeta
): ChannelToolContentOverride {
	const slug = meta.slug;
	const { platformLabel, photoEditor } = meta;
	const channelLinks = buildChannelFaqLinks(slug, meta.docsPath);
	const photoEditorToolLinks = buildToolChannelFaqLinks('photo-editor', slug);

	return {
		metaDescription: photoEditor.metaDescription,
		hubDescription: photoEditor.hubDescription,
		heroLead: photoEditor.heroLead,
		extraFaqItems: [
			{
				title: photoEditor.faqTitle,
				description: `${photoEditor.faqBodyLead} Design on the canvas, download a PNG, or save to your library, then attach when you schedule from ${faqLink(channelLinks.channelLanding, `${platformLabel} in OpenQuok`)} via ${faqLink(photoEditorToolLinks.toolChannel, 'this Photo Editor page')}.`
			}
		]
	};
}

export function createPhotoEditorContentOverride(slug: string): ChannelToolContentOverride {
	return createPhotoEditorContentOverrideFromMeta(resolveMeta(slug));
}

export function createSkillBuilderContentOverrideFromMeta(
	meta: ToolSurfaceChannelMeta
): ChannelToolContentOverride {
	const slug = meta.slug;
	const { platformLabel, skillBuilder } = meta;
	const channelLinks = buildChannelFaqLinks(slug, meta.docsPath);
	const skillBuilderToolLinks = buildToolChannelFaqLinks('skill-builder', slug);
	const cliHref = CLI_EXAMPLES_HREF_BY_SLUG[slug] ?? faqHrefDocs(`cli-examples/${slug.trim().toLowerCase()}`);

	return {
		metaDescription: skillBuilder.metaDescription,
		hubDescription: skillBuilder.hubDescription,
		heroLead: skillBuilder.heroLead,
		extraFaqItems: [
			{
				title: skillBuilder.faqTitle,
				description: `${skillBuilder.faqBodyLead} When your skill schedules posts, connect ${platformLabel} in your workspace first — ${faqLink(publicFaqHref.connectChannelsGuide, 'connect channels in OpenQuok')}. Command shapes match ${faqLink(cliHref, `${platformLabel} CLI examples`)} and ${faqLink(skillBuilderToolLinks.toolChannel, 'this Skill Builder page')}.`
			}
		]
	};
}

export function createSkillBuilderContentOverride(slug: string): ChannelToolContentOverride {
	return createSkillBuilderContentOverrideFromMeta(resolveMeta(slug));
}

export function createChannelToolSurfaceOverridesFromMeta(meta: ToolSurfaceChannelMeta): {
	bestTime: ChannelToolContentOverride;
	photoEditor: ChannelToolContentOverride;
	skillBuilder: ChannelToolContentOverride;
} {
	return {
		bestTime: createBestTimeContentOverrideFromMeta(meta),
		photoEditor: createPhotoEditorContentOverrideFromMeta(meta),
		skillBuilder: createSkillBuilderContentOverrideFromMeta(meta)
	};
}

export function createChannelToolSurfaceOverrides(slug: string): {
	bestTime: ChannelToolContentOverride;
	photoEditor: ChannelToolContentOverride;
	skillBuilder: ChannelToolContentOverride;
} {
	return createChannelToolSurfaceOverridesFromMeta(resolveMeta(slug));
}
