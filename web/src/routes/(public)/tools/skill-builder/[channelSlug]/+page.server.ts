import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicSkillBuilderPagePresenter } from '$lib/area-public';
import {
	getRootPathPublicSkillBuilder,
	getRootPathPublicSkillBuilderChannel
} from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { buildSkillBuilderFaqSection } from '$lib/content/constants/channels/tools/skill-builder/faq';
import {
	getSkillBuilderChannelBySlug,
	listSkillBuilderChannelsForHub
} from '$lib/content/constants/channels/tools/skill-builder/general';
import { getBuildingBlockSlugsQueryParam } from '$lib/skill-builder/utils/parseBuilderQuery';
import { buildToolsLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { buildPublicToolPageJsonLdGraph } from '$lib/seo/tools/buildPublicToolPageJsonLdGraph';
import { createSkillBuilderHowToSchema } from '$lib/seo/tools/howTo/publicToolHowToSchemas';
import { PUBLIC_TOOL_FEATURE_LISTS } from '$lib/seo/tools/publicToolFeatureLists';

export const ssr = true;

export async function load({ url, params, cookies, fetch, parent }) {
	const channelSlug = params.channelSlug?.trim().toLowerCase() ?? '';
	const channelConfig = getSkillBuilderChannelBySlug(channelSlug);

	if (!channelConfig) {
		throw error(404, 'Skill Builder channel page not found');
	}

	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const buildingBlockSlugsParam = getBuildingBlockSlugsQueryParam(url.searchParams);
	const stackSlug = url.searchParams.get('stack');

	const builderVm = await publicSkillBuilderPagePresenter.loadSkillBuilderStateless({
		fetch,
		buildingBlockSlugsParam,
		stackSlug,
		channelSlug
	});

	const faqSection = buildSkillBuilderFaqSection(builderVm.channelSlug, builderVm.channelLabel);

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${builderVm.metaTitle} | ${companyName}`,
		customDescription: builderVm.metaDescription,
		customSlug: getRootPathPublicSkillBuilderChannel(channelSlug),
		customTags: [...channelConfig.keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const schemaData = buildPublicToolPageJsonLdGraph({
		siteOrigin: url.origin,
		webApp: {
			canonicalUrl: canonical,
			name: builderVm.metaTitle,
			description: builderVm.metaDescription,
			applicationCategory: 'DeveloperApplication',
			siteOrigin: url.origin,
			companyName,
			featureList: PUBLIC_TOOL_FEATURE_LISTS.skillBuilder,
			aboutChannelLabel: builderVm.channelLabel
		},
		breadcrumbItems: buildToolsLandingBreadcrumbItems({
			toolLabel: 'Skill Builder',
			toolRootPath: getRootPathPublicSkillBuilder(),
			channelLabel: builderVm.channelLabel,
			channelRootPath: getRootPathPublicSkillBuilderChannel(channelSlug)
		}),
		faqSection,
		additionalNodes: [
			createSkillBuilderHowToSchema({
				canonicalUrl: canonical,
				channelLabel: builderVm.channelLabel
			})
		]
	});

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		skillBuilderChannelsVm: listSkillBuilderChannelsForHub(),
		...builderVm
	};
}
