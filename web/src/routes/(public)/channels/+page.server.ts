import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicInformationRepository } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { listPublicChannelsForHub } from '$lib/content/constants/publicChannelCatalog';
import { createMetaData } from '$lib/utils/createMetaData';
import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';

export const ssr = true;

export async function load({ url, fetch, cookies }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm, marketingInformation: marketingInformationPm } =
		await publicInformationRepository.getAllInformationCombined(fetch);

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const channelsVm = listPublicChannelsForHub();

	const customTitle = 'Social channel schedulers';
	const customDescription =
		'Browse OpenQuok channel landing pages — schedule Facebook, Threads, Instagram, and more from one agent-ready workspace.';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getRootPathPublicChannels(),
		customTags: [
			'social media scheduler',
			'social channels',
			'Facebook scheduler',
			'Threads scheduler',
			'Instagram scheduler'
		],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'CollectionPage',
				'@id': `${canonical}#webpage`,
				name: customTitle,
				description: customDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			}
		]
	};

	return {
		pageMetaTags,
		isLoggedIn,
		channelsVm,
		schemaData
	};
}
