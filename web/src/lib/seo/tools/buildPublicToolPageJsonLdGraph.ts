import type { PublicFaqItem } from '$lib/content/constants/faq';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import {
	createBreadcrumbListSchema,
	type BreadcrumbCrumb
} from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import {
	createJsonLdGraph,
	filterNonEmptyJsonLdNodes,
	type JsonLdGraphNode,
	type JsonLdGraphSchema
} from '$lib/seo/jsonLdSchema';

import {
	createPublicToolWebApplicationSchema,
	type CreatePublicToolWebApplicationSchemaParams
} from './createPublicToolWebApplicationSchema';

export type PublicToolFaqSectionForSchema = {
	faqTitle: string;
	faqDescription: string;
	faqItems: readonly PublicFaqItem[];
};

export type BuildPublicToolPageJsonLdGraphParams = {
	webApp: CreatePublicToolWebApplicationSchemaParams;
	breadcrumbItems: readonly BreadcrumbCrumb[];
	siteOrigin: string;
	faqSection?: PublicToolFaqSectionForSchema | null;
	/** Extra nodes (e.g. `HowTo`, `Dataset`) — omit empty objects. */
	additionalNodes?: readonly (JsonLdGraphNode | Record<string, never>)[];
};

/** Standard `@graph` for public tool hub and channel pages. */
export function buildPublicToolPageJsonLdGraph(
	params: BuildPublicToolPageJsonLdGraphParams
): JsonLdGraphSchema {
	const { webApp, breadcrumbItems, siteOrigin, faqSection, additionalNodes = [] } = params;
	const canonicalUrl = webApp.canonicalUrl;

	const faqNode =
		faqSection && faqSection.faqItems.length > 0
			? createPublicFaqSEOSchema({
					pageUrl: `${canonicalUrl}#faq`,
					name: faqSection.faqTitle,
					description: faqSection.faqDescription,
					items: faqSection.faqItems
				})
			: {};

	return createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			createPublicToolWebApplicationSchema(webApp),
			faqNode,
			...additionalNodes,
			createBreadcrumbListSchema([...breadcrumbItems], siteOrigin)
		])
	);
}
