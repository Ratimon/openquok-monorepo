import type { MetaTagsProps } from 'svelte-meta-tags';

import type { SoftwareApplication } from 'schema-dts';

import { error } from '@sveltejs/kit';

import { publicBestTimeToPostPagePresenter } from '$lib/area-public';
import { getRootPathPublicBestTimeToPostChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import {
	getBestTimeChannelBySlug,
	listBestTimeChannelsForHub
} from '$lib/best-time-to-post';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, params, cookies, parent }) {
	const channelSlug = params.channelSlug?.trim().toLowerCase() ?? '';
	const channelConfig = getBestTimeChannelBySlug(channelSlug);

	if (!channelConfig) {
		throw error(404, 'Best Time to Post channel page not found');
	}

	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const toolVm = publicBestTimeToPostPagePresenter.loadBestTimeToPostVm({ channelSlug });

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${toolVm.metaTitle} | ${companyName}`,
		customDescription: toolVm.metaDescription,
		customSlug: getRootPathPublicBestTimeToPostChannel(channelSlug),
		customTags: [...channelConfig.keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const schemaData = createJsonLdGraph([
		{
			'@type': 'WebApplication',
			'@id': `${canonical}#webapp`,
			name: toolVm.metaTitle,
			description: toolVm.metaDescription,
			applicationCategory: 'BusinessApplication',
			url: canonical,
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		} satisfies SoftwareApplication
	]);

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		bestTimeToPostChannelsVm: listBestTimeChannelsForHub(),
		...toolVm
	};
}
