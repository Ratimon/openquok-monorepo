import type { ExtensionsTagFilterViewModel } from '$lib/listings/listing.types';
import type { TagViewModel } from '$lib/listings/GetListing.presenter.svelte';

import { formatBuildingBlocksFilterHeroTitle } from '$lib/listings/utils/formatBuildingBlocksFilterHeroTitle';

export type BuildingBlocksTagPathFilterResolution =
	| {
			kind: 'tag';
			subjectLabel: string;
			fixedTagSlug: string;
			heroTitle: string;
			heroDescription: string;
	  }
	| {
			kind: 'group';
			subjectLabel: string;
			fixedTagGroupSlug: string;
			heroTitle: string;
			heroDescription: string;
	  }
	| {
			kind: 'unknown';
			subjectLabel: string;
			heroTitle: string;
			heroDescription: string;
	  };

export function resolveBuildingBlocksTagPathFilter(params: {
	pathSlug: string;
	tagsCatalog: TagViewModel[];
	tagFilterVm: ExtensionsTagFilterViewModel;
}): BuildingBlocksTagPathFilterResolution {
	const { pathSlug, tagsCatalog, tagFilterVm } = params;

	const currentTag = tagsCatalog.find((tag) => tag.slug === pathSlug);
	if (currentTag) {
		const label = currentTag.name;
		return {
			kind: 'tag',
			subjectLabel: label,
			fixedTagSlug: pathSlug,
			heroTitle: formatBuildingBlocksFilterHeroTitle(label),
			heroDescription:
				currentTag.description?.trim() ||
				`Browse skills and MCP building blocks tagged with ${label}.`
		};
	}

	const currentGroup = tagFilterVm.groups.find((group) => group.slug === pathSlug);
	if (currentGroup) {
		const label = currentGroup.label;
		return {
			kind: 'group',
			subjectLabel: label,
			fixedTagGroupSlug: pathSlug,
			heroTitle: formatBuildingBlocksFilterHeroTitle(label),
			heroDescription: `Browse skills and MCP building blocks in the ${label} tag group.`
		};
	}

	return {
		kind: 'unknown',
		subjectLabel: pathSlug,
		heroTitle: formatBuildingBlocksFilterHeroTitle(pathSlug),
		heroDescription: `Browse skills and MCP building blocks for ${pathSlug}.`
	};
}
