import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicPayloadWizardPagePresenter } from '$lib/area-public';
import {
	getRootPathPublicPayloadWizard,
	getRootPathPublicPayloadWizardChannel
} from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildToolsLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { buildPayloadWizardFaqSection } from '$lib/content/constants/channels/tools/payload-wizard/faq';
import {
	getPayloadWizardChannelBySlug,
	listPayloadWizardChannelsForHub
} from '$lib/content/constants/channels/tools/payload-wizard/general';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { buildPublicToolPageJsonLdGraph } from '$lib/seo/tools/buildPublicToolPageJsonLdGraph';
import { createPayloadWizardHowToSchema } from '$lib/seo/tools/howTo/publicToolHowToSchemas';
import { PUBLIC_TOOL_FEATURE_LISTS } from '$lib/seo/tools/publicToolFeatureLists';

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
	const schemaData = buildPublicToolPageJsonLdGraph({
		siteOrigin: url.origin,
		webApp: {
			canonicalUrl: canonical,
			name: toolVm.heroTitle,
			description: toolVm.metaDescription,
			applicationCategory: 'DeveloperApplication',
			siteOrigin: url.origin,
			companyName,
			featureList: PUBLIC_TOOL_FEATURE_LISTS.payloadWizard,
			aboutChannelLabel: toolVm.channelLabel
		},
		breadcrumbItems: buildToolsLandingBreadcrumbItems({
			toolLabel: 'Payload Wizard',
			toolRootPath: getRootPathPublicPayloadWizard(),
			channelLabel: toolVm.channelLabel,
			channelRootPath: getRootPathPublicPayloadWizardChannel(channelSlug)
		}),
		faqSection,
		additionalNodes: [
			createPayloadWizardHowToSchema({
				canonicalUrl: canonical,
				channelLabel: toolVm.channelLabel
			})
		]
	});

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		payloadWizardChannelsVm: listPayloadWizardChannelsForHub(),
		...toolVm
	};
}
