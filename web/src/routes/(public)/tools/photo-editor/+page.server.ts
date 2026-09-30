import type { MetaTagsProps } from 'svelte-meta-tags';

import { publicPhotoEditorPagePresenter } from '$lib/area-public';
import { getRootPathPublicPhotoEditor } from '$lib/area-public/constants/getRootPathPublicTools';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import {
	listCanvasChannelsForHub,
	PUBLIC_CANVAS_GENERIC_CONFIG
} from '$lib/canvas';
import { buildPhotoEditorFaqSection } from '$lib/content/constants/channels/tools/photo-editor/faq';
import { buildToolsLandingBreadcrumbItems } from '$lib/content/utils/buildPublicLandingBreadcrumbItems';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { buildPublicToolPageJsonLdGraph } from '$lib/seo/tools/buildPublicToolPageJsonLdGraph';
import { createPhotoEditorHowToSchema } from '$lib/seo/tools/howTo/publicToolHowToSchemas';
import { PUBLIC_TOOL_FEATURE_LISTS } from '$lib/seo/tools/publicToolFeatureLists';

export const ssr = true;

export async function load({ url, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const editorVm = publicPhotoEditorPagePresenter.loadPhotoEditorVm({});
	const faqSection = buildPhotoEditorFaqSection();

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${editorVm.metaTitle} | ${companyName}`,
		customDescription: editorVm.metaDescription,
		customSlug: getRootPathPublicPhotoEditor(),
		customTags: [...PUBLIC_CANVAS_GENERIC_CONFIG.keywords],
		requestUrl: url
	})) satisfies MetaTagsProps;

	const canonical = buildCanonicalUrl(url);
	const schemaData = buildPublicToolPageJsonLdGraph({
		siteOrigin: url.origin,
		webApp: {
			canonicalUrl: canonical,
			name: editorVm.metaTitle,
			description: editorVm.metaDescription,
			applicationCategory: 'DesignApplication',
			siteOrigin: url.origin,
			companyName,
			featureList: PUBLIC_TOOL_FEATURE_LISTS.photoEditor
		},
		breadcrumbItems: buildToolsLandingBreadcrumbItems({
			toolLabel: 'Photo Editor',
			toolRootPath: getRootPathPublicPhotoEditor()
		}),
		faqSection,
		additionalNodes: [createPhotoEditorHowToSchema({ canonicalUrl: canonical })]
	});

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		schemaData,
		photoEditorChannelsVm: listCanvasChannelsForHub(),
		...editorVm
	};
}
