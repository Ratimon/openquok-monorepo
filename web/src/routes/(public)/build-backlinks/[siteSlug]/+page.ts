import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type {
	ListingsHubBreadcrumbKind,
	ListingsHubBreadcrumbVariant
} from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import type { LinkDirectorySiteDto } from '$lib/link-directory/index';
import type { BuildBacklinksGuideSectionVm } from '$lib/link-directory/utils/buildBuildBacklinksGuideSections';
import type { BuildBacklinksSiteFaqSection } from '$lib/link-directory/utils/buildBuildBacklinksSiteFaqSection';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			siteVm: LinkDirectorySiteDto;
			guideSections: BuildBacklinksGuideSectionVm[];
			siteFaqSection: BuildBacklinksSiteFaqSection;
			schemaData: unknown;
			heroTitle: string;
			metaTitle: string;
			metaDescription: string;
			listingsBreadcrumb: {
				kind: ListingsHubBreadcrumbKind;
				variant: ListingsHubBreadcrumbVariant;
				siteLabel?: string | null;
			};
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			siteVm: serverData.siteVm,
			guideSections: serverData.guideSections,
			siteFaqSection: serverData.siteFaqSection,
			schemaData: serverData.schemaData,
			heroTitle: serverData.heroTitle,
			metaTitle: serverData.metaTitle,
			metaDescription: serverData.metaDescription,
			listingsBreadcrumb: serverData.listingsBreadcrumb
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser
	};
};
