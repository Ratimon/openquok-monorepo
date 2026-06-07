import {
	PUBLIC_FAQ_ITEMS,
	type PublicFaqItem
} from '$lib/content/constants/publicFaqCatalog';

export type CreatePublicFaqSEOSchemaParams = {
	/** Page URL where the FAQ section is rendered (typically `{canonical}#faq`). */
	pageUrl: string;
	/** Visible FAQ section headline. */
	name?: string;
	/** Visible FAQ section support copy. */
	description?: string;
	items?: readonly PublicFaqItem[];
};

/**
 * JSON-LD `FAQPage` for public landing and pricing FAQ sections.
 * @see https://schema.org/FAQPage
 */
export function createPublicFaqSEOSchema(
	params: CreatePublicFaqSEOSchemaParams
): Record<string, unknown> {
	const { pageUrl, name, description, items = PUBLIC_FAQ_ITEMS } = params;

	if (items.length === 0) {
		return {};
	}

	return {
		'@type': 'FAQPage',
		'@id': `${pageUrl.replace(/#.*$/, '')}#faq`,
		...(name ? { name } : {}),
		...(description ? { description } : {}),
		url: pageUrl.replace(/#.*$/, ''),
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.title,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.description
			}
		}))
	};
}
