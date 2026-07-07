import type { MetaTagsProps } from 'svelte-meta-tags';

import { error } from '@sveltejs/kit';

import { publicPhotoEditorPagePresenter } from '$lib/area-public';
import { getRootPathPublicPhotoEditorChannel } from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import {
	getPhotoEditorChannelBySlug,
	listPhotoEditorChannelsForHub
} from '$lib/photo-editor/constants/publicPhotoEditorChannelConfig';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, params, cookies, parent }) {
	const channelSlug = params.channelSlug?.trim().toLowerCase() ?? '';
	const channelConfig = getPhotoEditorChannelBySlug(channelSlug);

	if (!channelConfig) {
		throw error(404, 'Photo Editor channel page not found');
	}

	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const editorVm = publicPhotoEditorPagePresenter.loadPhotoEditorVm({ channelSlug });

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${editorVm.metaTitle} | ${companyName}`,
		customDescription: editorVm.metaDescription,
		customSlug: getRootPathPublicPhotoEditorChannel(channelSlug),
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
			}
		]
	};

	return {
		pageMetaTags: metaTags,
		isLoggedIn,
		schemaData,
		photoEditorChannelsVm: listPhotoEditorChannelsForHub(),
		...editorVm
	};
}
