import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicCreatorsPagePresenter } from '$lib/area-public';
import { getRootPathPublicCreators } from '$lib/area-public/constants/getRootPathPublicCreators';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, fetch, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const metaTitle = 'Creators';
	const metaDescription =
		'Meet community creators publishing building blocks and playbooks on OpenQuok.';

	const { creators } = await publicCreatorsPagePresenter.loadCreatorsHubStateless({ fetch });

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${metaTitle} | ${companyName}`,
		customDescription: metaDescription,
		customSlug: getRootPathPublicCreators(),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const schemaData = createJsonLdGraph([
		{
			'@type': 'CollectionPage',
			'@id': `${canonical}#webpage`,
			name: metaTitle,
			description: metaDescription,
			url: canonical,
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		}
	]);

	return {
		pageMetaTags: metaTags,
		isLoggedIn,
		creators,
		metaTitle,
		metaDescription,
		schemaData
	};
}
