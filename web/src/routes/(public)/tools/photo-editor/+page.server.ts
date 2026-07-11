import type { MetaTagsProps } from 'svelte-meta-tags';

import type { SoftwareApplication } from 'schema-dts';

import { publicPhotoEditorPagePresenter } from '$lib/area-public';
import { getRootPathPublicPhotoEditor } from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import {
	getCanvasChannelBySlug,
	listCanvasChannelsForHub,
	PUBLIC_CANVAS_GENERIC_CONFIG
} from '$lib/canvas';
import { createMetaData } from '$lib/utils/createMetaData';
import { createJsonLdGraph } from '$lib/utils/jsonLdSchema';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const editorVm = publicPhotoEditorPagePresenter.loadPhotoEditorVm({});

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${editorVm.metaTitle} | ${companyName}`,
		customDescription: editorVm.metaDescription,
		customSlug: getRootPathPublicPhotoEditor(),
		customTags: [...PUBLIC_CANVAS_GENERIC_CONFIG.keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = new URL(url.pathname, url.origin).href;
	const schemaData = createJsonLdGraph([
		{
			'@type': 'WebApplication',
			'@id': `${canonical}#webapp`,
			name: editorVm.metaTitle,
			description: editorVm.metaDescription,
			applicationCategory: 'DesignApplication',
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
		pageMetaTags: metaTags,
		isLoggedIn,
		schemaData,
		photoEditorChannelsVm: listCanvasChannelsForHub(),
		...editorVm
	};
}
