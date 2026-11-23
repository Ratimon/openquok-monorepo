import {
	BUILD_BACKLINKS_VIRTUAL_TAGS,
	resolveBuildBacklinksTagSlug
} from '$lib/link-directory/constants/buildBacklinksTagTaxonomy';
import type {
	BuildBacklinksHubFilters,
	LinkDirectoryCategoryDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/link-directory.types';

export type BuildBacklinksActiveFilterChip = {
	id: string;
	phrase: string;
	clear: Partial<BuildBacklinksHubFilters>;
};

function formatEnumLabel(value: string): string {
	if (value === 'manual_review') return 'manual review';
	return value.replace(/_/g, ' ');
}

function formatOpportunityTypeSlug(slug: string): string {
	return slug
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

function resolveTagLabel(
	slug: string,
	tagsCatalog: LinkDirectoryTagDto[]
): string {
	const resolved = resolveBuildBacklinksTagSlug(slug);
	if (resolved.kind === 'virtual') return resolved.tag.name;
	if (resolved.kind === 'editorial') {
		return tagsCatalog.find((tag) => tag.slug === slug)?.name ?? slug;
	}
	return slug;
}

export function buildBuildBacklinksActiveFilterChips(
	filters: BuildBacklinksHubFilters,
	categoriesVm: LinkDirectoryCategoryDto[],
	tagsVm: LinkDirectoryTagDto[]
): BuildBacklinksActiveFilterChip[] {
	const chips: BuildBacklinksActiveFilterChip[] = [];

	if (filters.category) {
		const name =
			categoriesVm.find((category) => category.slug === filters.category)?.name ??
			filters.category;
		chips.push({
			id: `category:${filters.category}`,
			phrase: `category is ${name}`,
			clear: { category: undefined }
		});
	}

	for (const slug of filters.tags ?? []) {
		const resolved = resolveBuildBacklinksTagSlug(slug);
		if (resolved.kind === 'virtual') {
			const query = resolved.tag.toPublishedQuery();
			if (query.dofollow?.length === 1) {
				chips.push({
					id: `tag:${slug}`,
					phrase: `link type is ${formatEnumLabel(query.dofollow[0])}`,
					clear: { tags: undefined, dofollow: undefined }
				});
				continue;
			}
			if (query.costTiers?.length === 1) {
				chips.push({
					id: `tag:${slug}`,
					phrase: `cost is ${query.costTiers[0]}`,
					clear: { tags: undefined, costTiers: undefined }
				});
				continue;
			}
			if (query.approvalMode?.length === 1) {
				chips.push({
					id: `tag:${slug}`,
					phrase: `approval is ${formatEnumLabel(query.approvalMode[0])}`,
					clear: { tags: undefined, approvalMode: undefined }
				});
				continue;
			}
			if (query.opportunityTypeSlugs?.length === 1) {
				const typeSlug = query.opportunityTypeSlugs[0];
				chips.push({
					id: `tag:${slug}`,
					phrase: `opportunity is ${formatOpportunityTypeSlug(typeSlug)}`,
					clear: { tags: undefined, opportunityTypeSlugs: undefined }
				});
				continue;
			}
		}
		chips.push({
			id: `tag:${slug}`,
			phrase: `tag is ${resolveTagLabel(slug, tagsVm)}`,
			clear: { tags: undefined }
		});
	}

	if (filters.search?.trim()) {
		chips.push({
			id: 'search',
			phrase: `search matches “${filters.search.trim()}”`,
			clear: { search: undefined }
		});
	}

	for (const tier of filters.costTiers ?? []) {
		const next = filters.costTiers?.filter((value) => value !== tier);
		chips.push({
			id: `cost:${tier}`,
			phrase: `cost is ${tier}`,
			clear: { costTiers: next?.length ? next : undefined }
		});
	}

	for (const value of filters.dofollow ?? []) {
		const next = filters.dofollow?.filter((item) => item !== value);
		chips.push({
			id: `dofollow:${value}`,
			phrase: `link type is ${formatEnumLabel(value)}`,
			clear: { dofollow: next?.length ? next : undefined }
		});
	}

	for (const value of filters.effort ?? []) {
		const next = filters.effort?.filter((item) => item !== value);
		chips.push({
			id: `effort:${value}`,
			phrase: `effort is ${formatEnumLabel(value)}`,
			clear: { effort: next?.length ? next : undefined }
		});
	}

	for (const value of filters.approvalMode ?? []) {
		const next = filters.approvalMode?.filter((item) => item !== value);
		chips.push({
			id: `approval:${value}`,
			phrase: `approval is ${formatEnumLabel(value)}`,
			clear: { approvalMode: next?.length ? next : undefined }
		});
	}

	for (const slug of filters.opportunityTypeSlugs ?? []) {
		const virtual = BUILD_BACKLINKS_VIRTUAL_TAGS.find((tag) =>
			tag.toPublishedQuery().opportunityTypeSlugs?.includes(slug)
		);
		const label = virtual?.name ?? formatOpportunityTypeSlug(slug);
		const next = filters.opportunityTypeSlugs?.filter((item) => item !== slug);
		chips.push({
			id: `oppType:${slug}`,
			phrase: `opportunity is ${label}`,
			clear: { opportunityTypeSlugs: next?.length ? next : undefined }
		});
	}

	return chips;
}
