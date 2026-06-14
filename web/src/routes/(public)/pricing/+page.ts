import { browser } from '$app/environment';
import type { MetaTagsProps } from 'svelte-meta-tags';

import type { PublicFaqItem } from '$lib/content/constants/publicFaqConfig';
import type { PublicPricingPageViewModel } from '$lib/billing';
import type { SubscriptionPeriod } from 'openquok-common';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, data }) => {
	const parentData = await parent();
	const { isLoggedIn: accurateIsLoggedIn, currentUser } = parentData;

	const roles = currentUser && 'roles' in currentUser ? currentUser.roles : [];
	const isPlatformAdmin = currentUser?.isPlatformAdmin || false;
	const isAdmin = roles?.includes('admin') || false;
	const isEditor = roles?.includes('editor') || false;

	if (browser && data) {
		const serverData = data as {
			pageMetaTags: MetaTagsProps;
			isLoggedIn: boolean;
			pageVmMonthly: PublicPricingPageViewModel;
			pageVmYearly: PublicPricingPageViewModel;
			defaultPeriod: SubscriptionPeriod;
			publicFaqConfigPm: Record<string, string>;
			publicFaqItemsVm: PublicFaqItem[];
			schemaData: unknown;
		};

		return {
			pageMetaTags: serverData.pageMetaTags,
			isLoggedIn: accurateIsLoggedIn,
			currentUser,
			isPlatformAdmin,
			isAdmin,
			isEditor,
			pageVmMonthly: serverData.pageVmMonthly,
			pageVmYearly: serverData.pageVmYearly,
			defaultPeriod: serverData.defaultPeriod,
			publicFaqConfigPm: serverData.publicFaqConfigPm,
			publicFaqItemsVm: serverData.publicFaqItemsVm,
			schemaData: serverData.schemaData
		};
	}

	return {
		...data,
		isLoggedIn: accurateIsLoggedIn,
		currentUser,
		isPlatformAdmin,
		isAdmin,
		isEditor
	};
};
