import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicChannelsPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { getRootPathPublicChannels } from '$lib/area-public/constants/getRootPathPublicChannels';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;
	const channelsVm = publicChannelsPagePresenter.loadChannelsHubStateless();

	const customTitle = 'Social media scheduler channels';
	const customDescription =
		'Connect Facebook, Threads, Instagram, YouTube, TikTok, and more to OpenQuok — the social media scheduler that lets you schedule social media posts from one workspace while you approve what goes live.';

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${customTitle} | ${companyName}`,
		customDescription,
		customSlug: getRootPathPublicChannels(),
		customTags: [
			'social media scheduler',
			'social media scheduling tool',
			'schedule social media posts',
			'social media posting tool',
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
