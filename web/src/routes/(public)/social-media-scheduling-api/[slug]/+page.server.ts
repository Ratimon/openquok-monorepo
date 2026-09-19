import { loadPublicApiMarketingPlatformPage } from '$lib/area-public/utils/publicApiMarketingPageLoad';

export const ssr = true;

export async function load({ url, params, cookies, parent }) {
	return loadPublicApiMarketingPlatformPage({
		url,
		params,
		cookies,
		parent,
		capability: 'scheduling'
	});
}
