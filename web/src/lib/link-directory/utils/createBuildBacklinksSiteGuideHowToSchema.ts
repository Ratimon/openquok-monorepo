import type { LinkDirectoryOpportunityDto } from '$lib/link-directory/link-directory.types';
import { createHowToSEOSchema } from '$lib/seo/createHowToSEOSchema';

export function sortPublishedOpportunities(
	opportunities: LinkDirectoryOpportunityDto[]
): LinkDirectoryOpportunityDto[] {
	return [...opportunities]
		.filter((opportunity) => opportunity.isAdminPublished)
		.sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Site-level HowTo: each published opportunity is one ordered playbook step. */
export function createBuildBacklinksSiteGuideHowToSchema(params: {
	canonicalUrl: string;
	siteTitle: string;
	siteDescription?: string | null;
	opportunities: LinkDirectoryOpportunityDto[];
}) {
	const { canonicalUrl, siteTitle, siteDescription, opportunities } = params;
	const ordered = sortPublishedOpportunities(opportunities);

	const steps = ordered
		.map((opportunity) => {
			const name = opportunity.title.trim();
			const text =
				opportunity.description?.trim() ||
				`Follow the detailed steps for “${name}” on this guide.`;
			if (!name) return null;
			return {
				name,
				text,
				url: `${canonicalUrl}#${opportunity.slug}`
			};
		})
		.filter((step): step is { name: string; text: string; url: string } => step !== null);

	return createHowToSEOSchema({
		canonicalUrl,
		fragmentId: 'howto-site',
		name: `How to earn backlinks on ${siteTitle}`,
		description: siteDescription?.trim() || undefined,
		steps
	});
}

/** Per-opportunity HowTo from JSON sub-steps (when present). */
export function createBuildBacklinksOpportunityHowToSchemas(params: {
	canonicalUrl: string;
	opportunities: LinkDirectoryOpportunityDto[];
}) {
	const { canonicalUrl, opportunities } = params;

	return sortPublishedOpportunities(opportunities)
		.map((opportunity) => {
			const steps = [...(opportunity.steps ?? [])]
				.sort((a, b) => a.order - b.order)
				.map((step) => ({
					name: step.title,
					text: step.body,
					url: `${canonicalUrl}#${opportunity.slug}`
				}));

			return createHowToSEOSchema({
				canonicalUrl,
				fragmentId: `howto-${opportunity.slug}`,
				name: opportunity.title,
				description: opportunity.description ?? undefined,
				steps
			});
		})
		.filter((node) => Object.keys(node).length > 0);
}
