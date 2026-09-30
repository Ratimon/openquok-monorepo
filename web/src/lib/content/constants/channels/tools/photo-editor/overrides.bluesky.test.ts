import { describe, expect, it } from 'vitest';

import { buildPhotoEditorFaqSection } from '$lib/content/constants/channels/tools/photo-editor/faq';
import { getCanvasChannelBySlug } from '$lib/content/constants/channels/tools/photo-editor/general';

describe('photo-editor Bluesky content override', () => {
	it('merges hub description and meta description with export sizes', () => {
		const config = getCanvasChannelBySlug('bluesky');
		expect(config).toBeDefined();
		expect(config?.hubDescription).toContain('16:9');
		expect(config?.metaDescription).toContain('1080×1080');
		expect(config?.metaDescription).toContain('1200×675');
		expect(config?.heroLead).toContain('1080×1350');
		expect(config?.metaTitle).toContain('No Sign Up');
	});

	it('includes Bluesky image sizes FAQ', () => {
		const section = buildPhotoEditorFaqSection('bluesky', 'Bluesky');
		const titles = section.faqItems.map((item) => item.title);
		expect(titles).toContain('What image sizes work on Bluesky?');
		expect(titles).toContain('Which aspect ratios are supported?');

		const aspectItem = section.faqItems.find(
			(item) => item.title === 'Which aspect ratios are supported?'
		);
		expect(aspectItem?.description).toContain('1080×1080');
		expect(aspectItem?.description).not.toMatch(/story|reel/i);
	});
});
