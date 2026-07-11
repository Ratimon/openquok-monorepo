import type { MetaTagsProps } from 'svelte-meta-tags';

import type { WebApplication } from 'schema-dts';

import { publicSkillBuilderPagePresenter } from '$lib/area-public';
import { getRootPathPublicSkillBuilder } from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { listSkillBuilderChannelsForHub } from '$lib/skill-builder/constants/publicSkillBuilderChannelConfig';
import { getBuildingBlockSlugsQueryParam } from '$lib/skill-builder/utils/parseBuilderQuery';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdWithContext } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, fetch, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const buildingBlockSlugsParam = getBuildingBlockSlugsQueryParam(url.searchParams);
	const stackSlug = url.searchParams.get('stack');

	const builderVm = await publicSkillBuilderPagePresenter.loadSkillBuilderStateless({
		fetch,
		buildingBlockSlugsParam,
		stackSlug
	});

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${builderVm.metaTitle} | ${companyName}`,
		customDescription: builderVm.metaDescription,
		customSlug: getRootPathPublicSkillBuilder(),
		requestUrl: url
	})) satisfies MetaTagsProps;

	const schemaData = createJsonLdWithContext({
		'@type': 'WebApplication',
		name: builderVm.metaTitle,
		description: builderVm.metaDescription,
		applicationCategory: 'DeveloperApplication',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
	} satisfies WebApplication);

	return {
		pageMetaTags: metaTags,
		isLoggedIn,
		schemaData,
		skillBuilderChannelsVm: listSkillBuilderChannelsForHub(),
		...builderVm
	};
}
