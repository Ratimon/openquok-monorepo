import type { MetaTagsProps } from 'svelte-meta-tags';

import type { SoftwareApplication } from 'schema-dts';

import {
	listHumanizeChannelsForHub,
	PUBLIC_HUMANIZE_GENERIC_CONFIG
} from '$lib/ai-humanize/constants/publicHumanizeChannelConfig';
import { buildHumanizeFaqSection } from '$lib/ai-humanize/constants/publicHumanizeFaqConfig';
import { publicHumanizePagePresenter } from '$lib/area-public';
import { getRootPathPublicHumanizer } from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const toolVm = publicHumanizePagePresenter.loadHumanizeVm();
	const faqSection = buildHumanizeFaqSection(toolVm.channelSlug, toolVm.channelLabel);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${toolVm.metaTitle} | ${companyName}`,
		customDescription: toolVm.metaDescription,
		customSlug: getRootPathPublicHumanizer(),
		customTags: [...PUBLIC_HUMANIZE_GENERIC_CONFIG.keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const schemaData = createJsonLdGraph(
		filterNonEmptyJsonLdNodes([
			{
				'@type': 'WebApplication',
				'@id': `${canonical}#webapp`,
				name: toolVm.heroTitle,
				description: toolVm.metaDescription,
				applicationCategory: 'UtilitiesApplication',
				url: canonical,
				offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
				isPartOf: {
					'@type': 'WebSite',
					name: companyName,
					url: url.origin
				}
			} satisfies SoftwareApplication,
			createPublicFaqSEOSchema({
				pageUrl: `${canonical}#faq`,
				name: faqSection.faqTitle,
				description: faqSection.faqDescription,
				items: faqSection.faqItems
			})
		])
	);

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		humanizerChannelsVm: listHumanizeChannelsForHub(),
		...toolVm
	};
}
