import type { Answer, FAQPage, Question } from 'schema-dts';

import {
	PUBLIC_FAQ_ITEMS,
	type PublicFaqItem
} from '$lib/content/constants/publicFaqConfig';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

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
): FAQPage | Record<string, never> {
	const { pageUrl, name, description, items = PUBLIC_FAQ_ITEMS } = params;

	if (items.length === 0) {
		return {};
	}

	const pageBase = pageUrl.replace(/#.*$/, '');

	return {
		'@type': 'FAQPage',
		'@id': `${pageBase}#faq`,
		...(name ? { name } : {}),
		...(description ? { description } : {}),
		url: pageBase,
		mainEntity: items.map(
			(item) =>
				({
					'@type': 'Question',
					name: item.title,
					acceptedAnswer: {
						'@type': 'Answer',
						text: stripHtmlToPlainText(item.description)
					} as Answer
				}) as Question
		)
	};
}
