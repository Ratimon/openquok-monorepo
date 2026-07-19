import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import type { SoftwareApplication } from 'schema-dts';

import { publicSkillBuilderPagePresenter } from '$lib/area-public';
import {
	getRootPathPublicSkillBuilderChannel
} from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import {
	getSkillBuilderChannelBySlug,
	listSkillBuilderChannelsForHub
} from '$lib/skill-builder/constants/publicSkillBuilderChannelConfig';
import { getBuildingBlockSlugsQueryParam } from '$lib/skill-builder/utils/parseBuilderQuery';
import { createMetaData } from '$lib/utils/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/utils/buildCanonicalUrl';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';

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
	const schemaData = createJsonLdGraph([
		{
			'@type': 'WebApplication',
			'@id': `${canonical}#webapp`,
			name: builderVm.metaTitle,
			description: builderVm.metaDescription,
			applicationCategory: 'DeveloperApplication',
			url: canonical,
			offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: url.origin
			}
		} satisfies SoftwareApplication
	]);

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		skillBuilderChannelsVm: listSkillBuilderChannelsForHub(),
		...builderVm
	};
}
