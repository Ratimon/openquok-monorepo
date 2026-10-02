import type {
	BuildBacklinksHubFilters,
	LinkDirectoryCategoryDto,
	LinkDirectorySiteDto,
	LinkDirectoryTagDto
} from '$lib/link-directory/link-directory.types';
import type { BuildBacklinksHubStatsViewModel } from '$lib/link-directory/utils/buildBuildBacklinksHubStats';

export type BuildBacklinksHubPageContentData = {
	sitesVm: LinkDirectorySiteDto[];
	categoriesVm: LinkDirectoryCategoryDto[];
	tagsVm: LinkDirectoryTagDto[];
	filtersVm: BuildBacklinksHubFilters;
	filteredCount: number;
	page: number;
	itemsPerPage: number;
	totalPages: number;
	schemaData: unknown;
	heroTitle: string;
	heroDescription: string;
	heroSubtitle: string;
	showHubFaq: boolean;
	isLoggedIn: boolean;
	statsVm?: BuildBacklinksHubStatsViewModel | null;
};
