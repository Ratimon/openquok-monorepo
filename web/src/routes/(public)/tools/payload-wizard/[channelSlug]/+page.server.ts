import type { MetaTagsProps } from 'svelte-meta-tags';

import type { SoftwareApplication } from 'schema-dts';

import { error } from '@sveltejs/kit';

import { publicPayloadWizardPagePresenter } from '$lib/area-public';
import {
	getRootPathPublicPayloadWizard,
	getRootPathPublicPayloadWizardChannel
} from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildToolsLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createPublicFaqSEOSchema } from '$lib/content/utils/createPublicFaqSEOSchema';
import { buildPayloadWizardFaqSection } from '$lib/posts/constants/publicPayloadWizardFaqConfig';
import {
	getPayloadWizardChannelBySlug,
	listPayloadWizardChannelsForHub
} from '$lib/posts/constants/publicPayloadWizardChannelConfig';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createPublicLandingBreadcrumbListSchema } from '$lib/seo/buildPublicLandingBreadcrumbJsonLd';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes } from '$lib/seo/jsonLdSchema';

export const ssr = true;

export async function load({ url, params, cookies, parent }) {
	const channelSlug = params.channelSlug?.trim().toLowerCase() ?? '';
	const channelConfig = getPayloadWizardChannelBySlug(channelSlug);

	if (!channelConfig) {
		throw error(404, 'Payload Wizard channel page not found');
	}

	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const toolVm = publicPayloadWizardPagePresenter.loadPayloadWizardVm({ channelSlug });
	const faqSection = buildPayloadWizardFaqSection(toolVm.channelSlug, toolVm.channelLabel);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${toolVm.metaTitle} | ${companyName}`,
		customDescription: toolVm.metaDescription,
		customSlug: getRootPathPublicPayloadWizardChannel(channelSlug),
		customTags: [...channelConfig.keywords],
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
				applicationCategory: 'DeveloperApplication',
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
			}),
			createPublicLandingBreadcrumbListSchema(
				buildToolsLandingBreadcrumbItems({
					toolLabel: 'Payload Wizard',
					toolRootPath: getRootPathPublicPayloadWizard(),
					channelLabel: toolVm.channelLabel,
					channelRootPath: getRootPathPublicPayloadWizardChannel(channelSlug)
				}),
				url.origin
			)
		])
	);

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		payloadWizardChannelsVm: listPayloadWizardChannelsForHub(),
		...toolVm
	};
}
