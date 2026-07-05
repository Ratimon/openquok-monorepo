import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicSkillBuilderPagePresenter } from '$lib/area-public';
import {
	getRootPathPublicSkillBuilderChannel
} from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { getSkillBuilderChannelBySlug } from '$lib/skill-builder/constants/publicSkillBuilderChannelConfig';
import { getBuildingBlockSlugsQueryParam } from '$lib/skill-builder/utils/parseBuilderQuery';
import { createMetaData } from '$lib/utils/createMetaData';

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

	const canonical = new URL(url.pathname, url.origin).href;
	const schemaData = {
		'@context': 'https://schema.org',
		'@graph': [
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
			}
		]
	};

	return {
		pageMetaTags: metaTags,
		isLoggedIn,
		schemaData,
		...builderVm
	};
}
