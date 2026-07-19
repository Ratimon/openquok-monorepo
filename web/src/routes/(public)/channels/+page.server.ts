import type { MetaTagsProps } from 'svelte-meta-tags';

import type { ItemList } from 'schema-dts';

import { publicChannelsPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';
import {
	getRootPathPublicChannel,
	getRootPathPublicChannels
} from '$lib/area-public/constants/getRootPathPublicChannels';

export const ssr = true;

function buildChannelsItemListSchema(params: {
	canonical: string;
	origin: string;
	channels: Array<{ slug: string; platformLabel: string; description: string }>;
}): ItemList {
	const { canonical, origin, channels } = params;

	return {
		'@type': 'ItemList',
		'@id': `${canonical}#channels-list`,
		name: 'Social media scheduler channels',
		description:
			'Available social media channels and integrations you can connect and schedule from one workspace.',
		url: canonical,
		numberOfItems: channels.length,
		itemListElement: channels.map((channel, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: channel.platformLabel,
			description: channel.description,
			url: new URL(getRootPathPublicChannel(channel.slug), origin).href
		}))
	};
}

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

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default)
		}
	});

	const schemaData = createJsonLdGraph([
		{
			'@type': 'CollectionPage',
			'@id': `${canonical}#webpage`,
			name: customTitle,
			description: customDescription,
			url: canonical,
			mainEntity: {
				'@id': `${canonical}#channels-list`
			},
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		},
		buildChannelsItemListSchema({
			canonical,
			origin: url.origin,
			channels: channelsVm.map((channel) => ({
				slug: channel.slug,
				platformLabel: channel.platformLabel,
				description: channel.hubDescription ?? channel.metaDescription
			}))
		})
	]);

	return {
		pageMetaTags,
		isLoggedIn,
		channelsVm,
		schemaData
	};
}
