import type { PageServerLoad } from './$types';

import { loadPublicCmsLandingPage } from '$lib/seo/loadPublicCmsLandingPage.server';
import { applyPublicCmsPageCacheHeaders } from '$lib/seo/publicCmsPageCache';

export const ssr = true;

export const load: PageServerLoad = async ({ parent, url, fetch, cookies, setHeaders }) => {
	if (!cookies.get('access_token')) {
		applyPublicCmsPageCacheHeaders(setHeaders);
	}

	const { baseMetaTags, companyInformationPm, marketingInformationPm, footerNavigationLinks } =
		await parent();

	return loadPublicCmsLandingPage({
		url,
		fetch,
		baseMetaTags,
		companyInformationPm,
		marketingInformationPm,
		footerNavigationLinks,
		includeWebSiteSchema: true
	});
};
