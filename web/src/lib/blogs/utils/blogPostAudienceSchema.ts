import type { BusinessAudience, ItemList, PeopleAudience } from 'schema-dts';

import type { BlogSeoAudienceCard } from '$lib/blogs/blog.types';
import {
	buildSchemaOrgAudienceFromCards,
	createPublicAudienceSectionSEOSchema
} from '$lib/content/utils/createPublicAudienceSEOSchema';

import {
	blogAudienceCardToAudienceCard,
	isBlogAudienceCardComplete
} from '$lib/blogs/utils/blogAudienceCard';

export function buildBlogPostAudienceSchema(
	audienceCard: BlogSeoAudienceCard | null | undefined,
	canonicalUrl: string
): {
	audience: Array<BusinessAudience | PeopleAudience>;
	itemList: ItemList | Record<string, never>;
} {
	if (!isBlogAudienceCardComplete(audienceCard)) {
		return { audience: [], itemList: {} };
	}

	const displayCard = blogAudienceCardToAudienceCard(audienceCard);
	let audience = buildSchemaOrgAudienceFromCards([displayCard], canonicalUrl);
	const audienceTypeOverride = audienceCard.audience_type?.trim();
	if (audienceTypeOverride && audience[0]) {
		audience = [{ ...audience[0], audienceType: audienceTypeOverride }];
	}

	const itemList = createPublicAudienceSectionSEOSchema({
		pageUrl: canonicalUrl,
		cards: [displayCard]
	});

	return { audience, itemList };
}