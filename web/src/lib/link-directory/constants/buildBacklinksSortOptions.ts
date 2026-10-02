import type { BuildBacklinksSort } from '$lib/link-directory/link-directory.types';

export type BuildBacklinksSortOption = {
	id: BuildBacklinksSort;
	label: string;
	shortLabel: string;
};

export const BUILD_BACKLINKS_SORT_OPTIONS: readonly BuildBacklinksSortOption[] = [
	{ id: 'dr_desc', label: 'Domain rating (high first)', shortLabel: 'DR' },
	{ id: 'dr_asc', label: 'Domain rating (low first)', shortLabel: 'DR ↑' },
	{ id: 'visits_desc', label: 'Monthly traffic (high first)', shortLabel: 'Traffic' },
	{ id: 'visits_asc', label: 'Monthly traffic (low first)', shortLabel: 'Traffic ↑' },
	{ id: 'title_asc', label: 'Title (A–Z)', shortLabel: 'A–Z' },
	{ id: 'title_desc', label: 'Title (Z–A)', shortLabel: 'Z–A' }
];

export const DEFAULT_BUILD_BACKLINKS_SORT: BuildBacklinksSort = 'dr_desc';
