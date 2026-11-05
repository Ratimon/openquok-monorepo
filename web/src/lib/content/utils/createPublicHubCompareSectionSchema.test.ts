import { describe, expect, it } from 'vitest';

import { PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE } from '$lib/content/constants/hubs/productHubSocialVsDirectoryCompare';
import { createPublicHubCompareSectionSchema } from '$lib/content/utils/createPublicHubCompareSectionSchema';

describe('createPublicHubCompareSectionSchema', () => {
	it('emits WebPageElement with two ItemList columns for social vs directory hub compare', () => {
		const canonical = 'https://www.example.com/compare';
		const webPageId = `${canonical}#webpage`;

		const result = createPublicHubCompareSectionSchema({
			canonical,
			webPageId,
			section: PUBLIC_PRODUCT_HUB_SOCIAL_VS_DIRECTORY_COMPARE
		});

		expect(result.webPageHasPartRef).toEqual({
			'@id': `${canonical}#social-vs-directory-compare`
		});

		const block = result.nodes[0] as { hasPart?: { name?: string }[] };
		expect(block.hasPart?.length).toBe(2);
		expect(block.hasPart?.[0]?.name).toContain('Social media schedulers');
		expect(block.hasPart?.[1]?.name).toContain('Directory submission');
	});
});
