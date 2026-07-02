import type {
	Action,
	AggregateRating,
	Answer,
	CreativeWork,
	FAQPage,
	InteractionCounter,
	ItemPage,
	Organization,
	Person,
	Question,
	SoftwareApplication,
	Thing,
	WithContext
} from 'schema-dts';

import type { ListingSchemaType } from '$lib/listings/constants/listingSchemaTypes';
import type { ListingFaqItemProgrammerModel } from '$lib/listings/listing.types';

type ListingSeoInput = {
	title: string;
	slug: string;
	description?: string | null;
	excerpt?: string | null;
	clickUrl?: string | null;
	defaultImageUrl?: string | null;
	schemaType?: string | null;
	faq?: ListingFaqItemProgrammerModel[] | null;
	categoryName?: string | null;
	tagNames?: string[];
	likes?: number;
	views?: number;
	clicks?: number;
	averageRating?: number;
	updatedAt?: string | null;
	createdAt?: string | null;
	ownerId?: string | null;
};

type SchemaEntityType = Thing | SoftwareApplication | CreativeWork | Organization | Person;

function buildInteractionStatistics(listing: ListingSeoInput): InteractionCounter[] {
	const stats: InteractionCounter[] = [];
	if (listing.likes) {
		stats.push({
			'@type': 'InteractionCounter',
			interactionType: 'https://schema.org/LikeAction' as unknown as Action,
			userInteractionCount: listing.likes
		});
	}
	if (listing.views) {
		stats.push({
			'@type': 'InteractionCounter',
			interactionType: 'https://schema.org/ViewAction' as unknown as Action,
			userInteractionCount: listing.views
		});
	}
	if (listing.clicks) {
		stats.push({
			'@type': 'InteractionCounter',
			interactionType: 'https://schema.org/ClickAction' as unknown as Action,
			userInteractionCount: listing.clicks
		});
	}
	return stats;
}

function withRatingAndStats<T extends SoftwareApplication | CreativeWork>(
	schema: T,
	listing: ListingSeoInput
): T {
	if (listing.averageRating && listing.averageRating > 0) {
		schema.aggregateRating = {
			'@type': 'AggregateRating',
			ratingValue: listing.averageRating.toString(),
			reviewCount: 1,
			worstRating: '1',
			bestRating: '5'
		} as AggregateRating;
	}
	const interactionStatistic = buildInteractionStatistics(listing);
	if (interactionStatistic.length > 0) {
		schema.interactionStatistic = interactionStatistic;
	}
	return schema;
}

function buildMainEntity(
	listing: ListingSeoInput,
	listingUrl: string,
	imageUrl?: string
): SchemaEntityType {
	const schemaType = (listing.schemaType || 'SoftwareApplication') as ListingSchemaType;
	const description = listing.description || listing.excerpt || '';
	const keywords = listing.tagNames?.join(', ');

	switch (schemaType) {
		case 'SoftwareApplication':
			return withRatingAndStats(
				{
					'@type': 'SoftwareApplication',
					name: listing.title,
					description,
					image: imageUrl,
					applicationCategory: listing.categoryName || 'WebApplication',
					url: listingUrl,
					keywords
				},
				listing
			);
		case 'CreativeWork':
			return withRatingAndStats(
				{
					'@type': 'CreativeWork',
					name: listing.title,
					description,
					image: imageUrl,
					url: listingUrl,
					keywords
				},
				listing
			);
		case 'Organization':
			return {
				'@type': 'Organization',
				name: listing.title,
				description,
				image: imageUrl,
				url: listingUrl
			};
		case 'Person':
			return {
				'@type': 'Person',
				name: listing.title,
				description,
				image: imageUrl,
				url: listingUrl
			};
		default:
			return {
				'@type': 'Thing',
				name: listing.title,
				description,
				image: imageUrl,
				url: listingUrl
			};
	}
}

export function createListingSEOSchema(
	listing: ListingSeoInput,
	listingUrl: string,
	imageBaseUrl?: string
): WithContext<any> {
	const imageUrl = listing.defaultImageUrl
		? imageBaseUrl
			? `${imageBaseUrl}${listing.defaultImageUrl}`
			: listing.defaultImageUrl
		: undefined;

	const mainEntity = buildMainEntity(listing, listingUrl, imageUrl);

	const itemPageSchema: ItemPage = {
		'@type': 'ItemPage',
		lastReviewed: listing.updatedAt ? new Date(listing.updatedAt).toISOString() : undefined,
		reviewedBy: listing.ownerId || undefined,
		significantLink: listing.clickUrl || undefined,
		mainEntity
	};

	const schemas: unknown[] = [itemPageSchema];

	if (listing.faq && listing.faq.length > 0) {
		const faqSchema: FAQPage = {
			'@type': 'FAQPage',
			mainEntity: listing.faq.map(
				(item) =>
					({
						'@type': 'Question',
						name: item.question,
						acceptedAnswer: {
							'@type': 'Answer',
							text: item.answer
						} as Answer
					}) as Question
			)
		};
		schemas.push(faqSchema);
	}

	return {
		'@context': 'https://schema.org',
		'@graph': schemas
	} as WithContext<any>;
}

/** Merge listing `schemaJson` nodes into a JSON-LD `@graph` array. */
export function mergeListingSchemaIntoGraph(
	baseGraph: Record<string, unknown>[],
	schemaJson: Record<string, unknown> | null | undefined
): Record<string, unknown>[] {
	if (!schemaJson || Object.keys(schemaJson).length === 0) {
		return baseGraph;
	}

	const graph = schemaJson['@graph'];
	if (Array.isArray(graph)) {
		return [...baseGraph, ...graph.filter((node) => node && typeof node === 'object')];
	}

	if (typeof schemaJson['@type'] === 'string') {
		return [...baseGraph, schemaJson];
	}

	return baseGraph;
}
