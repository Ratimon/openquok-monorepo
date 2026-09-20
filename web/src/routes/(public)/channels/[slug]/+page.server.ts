import type { MetaTagsProps } from 'svelte-meta-tags';

import type { JsonLdGraphNode } from '$lib/seo/jsonLdSchema';

import { error } from '@sveltejs/kit';

import { publicChannelByPagePresenter } from '$lib/area-public';
import {
	CONFIG_SCHEMA_COMPANY,
} from '$lib/config/constants/config';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import {
	createPublicAudienceSectionSEOSchema,
	withSchemaOrgAudience
} from '$lib/content/utils/createPublicAudienceSEOSchema';
import type { AudienceCard } from '$lib/ui/templates/WhoIsFor.svelte';
import { buildChannelsLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';
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
	audienceCards?: readonly AudienceCard[];
	audienceSectionTitle?: string;
	audienceSectionSubtitle?: string;
}): JsonLdGraphNode {
	const {
		canonical,
		origin,
		name,
		description,
		docsPath,
		keywords,
		featureList,
		audienceCards = [],
		audienceSectionTitle,
		audienceSectionSubtitle
	} = params;

	return withSchemaOrgAudience(
		{
			'@type': 'SoftwareApplication',
			'@id': `${canonical}#software`,
			name,
			description,
			url: canonical,
			applicationCategory: 'BusinessApplication',
			operatingSystem: 'Web',
			softwareHelp: {
				'@type': 'CreativeWork',
				url: new URL(docsPath, origin).href
			},
			featureList,
			keywords: keywords.join(', '),
			mainEntityOfPage: {
				'@id': `${canonical}#webpage`
			}
		},
		{
			cards: audienceCards,
			sectionTitle: audienceSectionTitle,
			sectionSubtitle: audienceSectionSubtitle
		},
		canonical
	);
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

	const customTitle = channelVm.available
		? `${channelVm.metaTitle} | ${companyName}`
		: `${channelVm.platformLabel} scheduling — Coming soon | ${companyName}`;
	const customDescription = channelVm.available
		? channelVm.metaDescription
		: `${channelVm.platformLabel} scheduling in OpenQuok is coming soon. ${channelVm.metaDescription}`;
	const featureList = [
		channelVm.heroTitle,
		...channelVm.featureSections.flatMap((section) => [section.subtitle, section.title]),
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

	const canonical = buildCanonicalUrl(url);
	const pageMetaTags = withCanonicalMetaTags(metaTags, canonical, {
		openGraph: {
			title: customTitle,
			description: customDescription
		},
		twitter: {
			title: customTitle,
			description: customDescription
		}
	});

	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			withSchemaOrgAudience(
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
				{
					cards: channelVm.audienceCards,
					sectionTitle: channelVm.audienceTitle,
					sectionSubtitle: channelVm.audienceSubtitle
				},
				canonical
			),
			buildChannelSoftwareApplicationSchema({
				canonical,
				origin: url.origin,
				name: `${channelVm.platformLabel} scheduling in OpenQuok`,
				description: customDescription,
				docsPath: channelVm.docsPath,
				keywords: channelVm.keywords,
				featureList,
				audienceCards: channelVm.audienceCards,
				audienceSectionTitle: channelVm.audienceTitle,
				audienceSectionSubtitle: channelVm.audienceSubtitle
			}),
			createPublicAudienceSectionSEOSchema({
				pageUrl: canonical,
				sectionTitle: channelVm.audienceTitle,
				sectionSubtitle: channelVm.audienceSubtitle,
				cards: channelVm.audienceCards
			}),
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: channelVm.faqTitle,
				description: channelVm.faqDescription,
				items: channelVm.faqItems
			}),
			createBreadcrumbListSchema(
				buildChannelsLandingBreadcrumbItems({
					platformLabel: channelVm.platformLabel
				}),
				url.origin
			)
		])
	);

	return {
		pageMetaTags,
		isLoggedIn,
		channelVm,
		schemaData
	};
}
