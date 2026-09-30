import { describe, expect, it } from 'vitest';

import { listAvailablePublicChannels } from '$lib/content/constants/channels';
import {
	bestTimeToolContentOverridesBySlug,
	photoEditorToolContentOverridesBySlug,
	skillBuilderToolContentOverridesBySlug,
	TOOL_SURFACE_CHANNEL_SLUGS
} from '$lib/content/constants/channels/tool-surfaces';
import { getBestTimeChannelBySlug } from '$lib/content/constants/channels/tools/best-time-to-post/general';
import { getCanvasChannelBySlug } from '$lib/content/constants/channels/tools/photo-editor/general';
import { getSkillBuilderChannelContentOverride } from '$lib/content/constants/channels/tools/skill-builder/general';

describe('tool-surfaces registry', () => {
	it('covers every live channel catalog slug', () => {
		const catalogSlugs = listAvailablePublicChannels().map((c) => c.slug).sort();
		expect([...TOOL_SURFACE_CHANNEL_SLUGS].sort()).toEqual(catalogSlugs);
	});

	it('registers best-time, photo-editor, and skill-builder overrides for each slug', () => {
		for (const slug of TOOL_SURFACE_CHANNEL_SLUGS) {
			expect(bestTimeToolContentOverridesBySlug[slug]?.seoIntro?.benchmarkTableRows?.length).toBe(
				7
			);
			expect(photoEditorToolContentOverridesBySlug[slug]?.heroLead).toBeTruthy();
			expect(skillBuilderToolContentOverridesBySlug[slug]?.extraFaqItems?.length).toBeGreaterThan(
				0
			);
		}
	});

	it('merges Instagram best-time override with benchmark FAQ table', () => {
		const config = getBestTimeChannelBySlug('instagram');
		expect(config?.metaTitle).toContain('Instagram');
		expect(config?.seoIntro?.highlights?.length).toBe(3);
		const sectionTitles =
			config &&
			bestTimeToolContentOverridesBySlug.instagram?.extraFaqItems?.map((item) => item.title);
		expect(sectionTitles).toContain('What are good times to post on Instagram in 2026?');
		expect(sectionTitles).toContain('How do I find my real best time on Instagram?');
	});

	it('merges TikTok photo editor preset copy', () => {
		const config = getCanvasChannelBySlug('tiktok');
		expect(config?.heroLead).toMatch(/carousel|9:16/i);
	});

	it('includes skill-builder CLI FAQ for Facebook', () => {
		const override = getSkillBuilderChannelContentOverride('facebook');
		expect(override?.extraFaqItems?.[0]?.description).toMatch(/CLI examples/i);
	});
});
