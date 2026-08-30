import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicCreatorsPagePresenter } from '$lib/area-public';
import { getRootPathPublicCreators } from '$lib/area-public/constants/getRootPathPublicCreators';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { PUBLIC_CREATORS_HUB_FAQ } from '$lib/content/constants/publicCreatorsHubFaqConfig';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

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

	const canonical = buildCanonicalUrl(url);
	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
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
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: PUBLIC_CREATORS_HUB_FAQ.faqTitle,
				description: PUBLIC_CREATORS_HUB_FAQ.faqDescription,
				items: PUBLIC_CREATORS_HUB_FAQ.faqItems
			})
		])
	);

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		creators,
		metaTitle,
		metaDescription,
		schemaData
	};
}
