import type { ExtensionCardViewModel } from '$lib/listings/GetListing.presenter.svelte';
import type { ListingTagProgrammerModel } from '$lib/listings/Listing.repository.svelte';
import type {
	ExtensionTagFilterChip,
	ExtensionTagGroupFilterChip,
	ExtensionsTagFilterViewModel
} from '$lib/listings/listing.types';

import { stringToSlug } from '$lib/ui/helpers/common';

function countExtensionsWithTag(extensions: ExtensionCardViewModel[], tagSlug: string): number {
	return extensions.filter((row) => row.tags.some((tag) => tag.slug === tagSlug)).length;
}

function countExtensionsWithAnyTag(
	extensions: ExtensionCardViewModel[],
	tagSlugs: readonly string[]
): number {
	if (tagSlugs.length === 0) return 0;
	const slugSet = new Set(tagSlugs);
	return extensions.filter((row) => row.tags.some((tag) => slugSet.has(tag.slug))).length;
}

export function buildExtensionsTagFilterVm(params: {
	tagsCatalog: ListingTagProgrammerModel[];
	extensions: ExtensionCardViewModel[];
}): ExtensionsTagFilterViewModel {
	const { tagsCatalog, extensions } = params;

	const groupMap = new Map<string, ExtensionTagGroupFilterChip>();

	for (const tag of tagsCatalog) {
		for (const group of tag.tagGroups) {
			const slug = stringToSlug(group.name);
			const existing = groupMap.get(slug);
			if (existing) {
				if (!existing.tagSlugs.includes(tag.slug)) {
					existing.tagSlugs.push(tag.slug);
				}
				continue;
			}
			groupMap.set(slug, {
				slug,
				label: group.name,
				count: 0,
				tagSlugs: [tag.slug]
			});
		}
	}

	const groups = [...groupMap.values()]
		.map((group) => ({
			...group,
			count: countExtensionsWithAnyTag(extensions, group.tagSlugs),
			tagSlugs: [...group.tagSlugs].sort((a, b) => a.localeCompare(b))
		}))
		.sort((a, b) => a.label.localeCompare(b.label));

	const tags: ExtensionTagFilterChip[] = tagsCatalog
		.map((tag) => ({
			slug: tag.slug,
			label: tag.name,
			count: countExtensionsWithTag(extensions, tag.slug),
			color: tag.color,
			groupSlugs: tag.tagGroups.map((group) => stringToSlug(group.name))
		}))
		.sort((a, b) => a.label.localeCompare(b.label));

	return {
		groups,
		tags,
		totalCount: extensions.length
	};
}

export function getTagSlugsForGroup(
	tagFilterVm: ExtensionsTagFilterViewModel,
	groupSlug: string | undefined
): string[] {
	if (!groupSlug) return [];
	const group = tagFilterVm.groups.find((row) => row.slug === groupSlug);
	return group?.tagSlugs ?? [];
}
