import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicBestTimeToPostPagePresenter } from '$lib/area-public';
import { getRootPathPublicBestTimeToPost } from '$lib/area-public/constants/getRootPathPublicTools';
import {
	buildBestTimeToPostFaqSection,
	listBestTimeChannelsForHub,
	PUBLIC_BEST_TIME_GENERIC_CONFIG
} from '$lib/best-time-to-post';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildToolsLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { buildPublicToolPageJsonLdGraph } from '$lib/seo/tools/buildPublicToolPageJsonLdGraph';
import { createBestTimeToPostHowToSchema } from '$lib/seo/tools/howTo/publicToolHowToSchemas';
import { PUBLIC_TOOL_FEATURE_LISTS } from '$lib/seo/tools/publicToolFeatureLists';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const toolVm = publicBestTimeToPostPagePresenter.loadBestTimeToPostVm({});
	const faqSection = buildBestTimeToPostFaqSection();

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${toolVm.metaTitle} | ${companyName}`,
		customDescription: toolVm.metaDescription,
		customSlug: getRootPathPublicBestTimeToPost(),
		customTags: [...PUBLIC_BEST_TIME_GENERIC_CONFIG.keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const schemaData = buildPublicToolPageJsonLdGraph({
		siteOrigin: url.origin,
		webApp: {
			canonicalUrl: canonical,
			name: toolVm.metaTitle,
			description: toolVm.metaDescription,
			applicationCategory: 'BusinessApplication',
			siteOrigin: url.origin,
			companyName,
			featureList: PUBLIC_TOOL_FEATURE_LISTS.bestTimeToPost
		},
		breadcrumbItems: buildToolsLandingBreadcrumbItems({
			toolLabel: 'Best Time to Post',
			toolRootPath: getRootPathPublicBestTimeToPost()
		}),
		faqSection,
		additionalNodes: [createBestTimeToPostHowToSchema({ canonicalUrl: canonical })]
	});

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		bestTimeToPostChannelsVm: listBestTimeChannelsForHub(),
		...toolVm
	};
}
