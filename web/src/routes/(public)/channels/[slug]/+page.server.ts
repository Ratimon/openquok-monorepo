import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicInformationRepository } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { getAvailablePublicChannelBySlug } from '$lib/content/constants/publicChannelCatalog';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';

export const ssr = true;

export async function load({ url, params, fetch, cookies }) {
	const { slug } = params;

	if (typeof slug !== 'string' || slug.trim().length === 0) {
		throw error(404, 'Channel page not found');
	}

	const channel = getAvailablePublicChannelBySlug(slug);
	if (!channel) {
		throw error(404, 'Channel page not found');
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm, marketingInformation: marketingInformationPm } =
		await publicInformationRepository.getAllInformationCombined(fetch);

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = `${channel.metaTitle} | ${companyName}`;
	const customDescription = channel.metaDescription;

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicChannel(channel.slug),
		customTags: channel.keywords,
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const pageMetaTags = Object.freeze({
		canonical,
		openGraph: {
			title: customTitle,
			description: customDescription
		},
		twitter: {
			title: customTitle,
			description: customDescription
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebPage',
				'@id': `${canonical}#webpage`,
				name: channel.metaTitle,
				description: customDescription,
				url: canonical,
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: channel.faqTitle,
				description: channel.faqDescription,
				items: channel.faqItems
			})
		].filter((node) => Object.keys(node).length > 0)
	};

	return {
		pageMetaTags,
		isLoggedIn,
		channelVm: channel,
		schemaData
	};
}
