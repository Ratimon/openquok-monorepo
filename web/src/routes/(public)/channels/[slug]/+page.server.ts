import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicChannelByPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
	CONFIG_SCHEMA_MARKETING
} from '$lib/config/constants/config';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/utils/createMetaData';
import { getRootPathPublicChannel } from '$lib/area-public/constants/getRootPathPublicChannels';

export const ssr = true;

function buildChannelSoftwareApplicationSchema(params: {
	canonical: string;
	origin: string;
	name: string;
	description: string;
	docsPath: string;
	keywords: string[];
	featureList: string[];
}) {
	const { canonical, origin, name, description, docsPath, keywords, featureList } = params;

	return {
		'@type': 'SoftwareApplication',
		'@id': `${canonical}#software`,
		name,
		description,
		url: canonical,
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		softwareHelp: new URL(docsPath, origin).href,
		featureList,
		keywords: keywords.join(', '),
		mainEntityOfPage: {
			'@id': `${canonical}#webpage`
		}
	};
}

export async function load({ url, params, cookies, parent }) {
	const { slug } = params;

	if (typeof slug !== 'string' || slug.trim().length === 0) {
		throw error(404, 'Channel page not found');
	}

	const channelVm = publicChannelByPagePresenter.loadChannelBySlugStateless(slug);
	if (!channelVm) {
		throw error(404, 'Channel page not found');
	}

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformationPm, marketingInformationPm } = await parent();

	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const customTitle = `${channelVm.metaTitle} | ${companyName}`;
	const customDescription = channelVm.metaDescription;
	const featureList = [
		channelVm.heroTitle,
		...channelVm.featureSections.flatMap((section) => [section.subtitle, section.title]),
		...channelVm.audienceCards.flatMap((card) => [card.title, card.description]),
		...channelVm.faqItems.map((item) => item.title)
	].filter((value, index, values) => value.trim().length > 0 && values.indexOf(value) === index);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customSlug: getRootPathPublicChannel(channelVm.slug),
		customTags: channelVm.keywords,
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
				name: channelVm.metaTitle,
				description: customDescription,
				url: canonical,
				mainEntity: {
					'@id': `${canonical}#software`
				},
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			},
			buildChannelSoftwareApplicationSchema({
				canonical,
				origin: url.origin,
				name: `${channelVm.platformLabel} scheduling in OpenQuok`,
				description: customDescription,
				docsPath: channelVm.docsPath,
				keywords: channelVm.keywords,
				featureList
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: channelVm.faqTitle,
				description: channelVm.faqDescription,
				items: channelVm.faqItems
			})
		].filter((node) => Object.keys(node).length > 0)
	};

	return {
		pageMetaTags,
		isLoggedIn,
		channelVm,
		schemaData
	};
}
