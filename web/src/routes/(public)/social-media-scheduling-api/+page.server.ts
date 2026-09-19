import { loadPublicApiMarketingHubPage } from '$lib/area-public/utils/publicApiMarketingPageLoad';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	return loadPublicApiMarketingHubPage({
		url,
		cookies,
		parent,
		capability: 'scheduling'
	});
}
