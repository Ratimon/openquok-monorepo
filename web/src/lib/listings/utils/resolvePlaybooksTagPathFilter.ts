import type { ExtensionsTagFilterViewModel } from '$lib/listings/listing.types';
import type { TagViewModel } from '$lib/listings/GetListing.presenter.svelte';

import { formatPlaybooksFilterHeroTitle } from '$lib/listings/utils/formatPlaybooksFilterHeroTitle';

export type PlaybooksTagPathFilterResolution =
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

export function resolvePlaybooksTagPathFilter(params: {
	pathSlug: string;
	tagsCatalog: TagViewModel[];
	tagFilterVm: ExtensionsTagFilterViewModel;
}): PlaybooksTagPathFilterResolution {
	const { pathSlug, tagsCatalog, tagFilterVm } = params;

	const currentTag = tagsCatalog.find((tag) => tag.slug === pathSlug);
	if (currentTag) {
		const label = currentTag.name;
		return {
			kind: 'tag',
			subjectLabel: label,
			fixedTagSlug: pathSlug,
			heroTitle: formatPlaybooksFilterHeroTitle(label),
			heroDescription:
				currentTag.description?.trim() || `Browse agent playbooks tagged with ${label}.`
		};
	}

	const currentGroup = tagFilterVm.groups.find((group) => group.slug === pathSlug);
	if (currentGroup) {
		const label = currentGroup.label;
		return {
			kind: 'group',
			subjectLabel: label,
			fixedTagGroupSlug: pathSlug,
			heroTitle: formatPlaybooksFilterHeroTitle(label),
			heroDescription: `Browse agent playbooks in the ${label} tag group.`
		};
	}

	return {
		kind: 'unknown',
		subjectLabel: pathSlug,
		heroTitle: formatPlaybooksFilterHeroTitle(pathSlug),
		heroDescription: `Browse agent playbooks for ${pathSlug}.`
	};
}
