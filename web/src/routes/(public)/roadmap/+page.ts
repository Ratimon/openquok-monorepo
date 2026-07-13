import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	RoadmapCategoryOptionViewModel,
	RoadmapColumnOptionViewModel,
	RoadmapItemViewModel
} from '$lib/roadmap/roadmap.types';

export async function load({ parent, data }) {
	const { isLoggedIn: accurateIsLoggedIn } = await parent();

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			schemaData: unknown;
			isLoggedIn: boolean;
			roadmapItems: readonly RoadmapItemViewModel[];
			roadmapColumnOptionsVm: readonly RoadmapColumnOptionViewModel[];
			roadmapCategories: readonly RoadmapCategoryOptionViewModel[];
			metaTitle: string;
			metaDescription: string;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			schemaData: serverData.schemaData,
			isLoggedIn: accurateIsLoggedIn,
			roadmapItems: serverData.roadmapItems,
			roadmapColumnOptionsVm: serverData.roadmapColumnOptionsVm,
			roadmapCategories: serverData.roadmapCategories,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn
	};
}
