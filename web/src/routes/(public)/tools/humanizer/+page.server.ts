import type { MetaTagsProps } from 'svelte-meta-tags';

import {
	listHumanizeChannelsForHub,
	PUBLIC_HUMANIZE_GENERIC_CONFIG
} from '$lib/content/constants/channels/tools/humanizer/general';
import { buildHumanizeFaqSection } from '$lib/content/constants/channels/tools/humanizer/faq';
import { publicHumanizePagePresenter } from '$lib/area-public';
import { getRootPathPublicHumanizer } from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildToolsLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { buildPublicToolPageJsonLdGraph } from '$lib/seo/tools/buildPublicToolPageJsonLdGraph';
import { createHumanizerHowToSchema } from '$lib/seo/tools/howTo/publicToolHowToSchemas';
import { PUBLIC_TOOL_FEATURE_LISTS } from '$lib/seo/tools/publicToolFeatureLists';

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
	const schemaData = buildPublicToolPageJsonLdGraph({
		siteOrigin: url.origin,
		webApp: {
			canonicalUrl: canonical,
			name: toolVm.heroTitle,
			description: toolVm.metaDescription,
			applicationCategory: 'UtilitiesApplication',
			siteOrigin: url.origin,
			companyName,
			featureList: PUBLIC_TOOL_FEATURE_LISTS.humanizer
		},
		breadcrumbItems: buildToolsLandingBreadcrumbItems({
			toolLabel: 'Humanizer',
			toolRootPath: getRootPathPublicHumanizer()
		}),
		faqSection,
		additionalNodes: [createHumanizerHowToSchema({ canonicalUrl: canonical })]
	});

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		humanizerChannelsVm: listHumanizeChannelsForHub(),
		...toolVm
	};
}
