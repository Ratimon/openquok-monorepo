import type { MetaTagsProps } from 'svelte-meta-tags';

import { listHumanizeChannelsForHub } from '$lib/ai-humanize';
import { publicToolsPagePresenter } from '$lib/area-public';
import { getRootPathPublicDocs } from '$lib/area-public/constants/getRootPathPublicDocs';
import {
	getRootPathPublicBestTimeToPost,
	getRootPathPublicHumanizer,
	getRootPathPublicPhotoEditor,
	getRootPathPublicSkillBuilder,
	getRootPathPublicTools
} from '$lib/area-public/constants/getRootPathPublicTools';
import { listBestTimeChannelsForHub } from '$lib/best-time-to-post';
import { CONFIG_SCHEMA_COMPANY } from '$lib/config/constants/config';
import { listCanvasChannelsForHub } from '$lib/canvas';
import { listSkillBuilderChannelsForHub } from '$lib/skill-builder/constants/publicSkillBuilderChannelConfig';
import { createMetaData } from '$lib/seo/createMetaData';
import { buildCanonicalUrl, withCanonicalMetaTags } from '$lib/seo/buildCanonicalUrl';
import { createJsonLdGraph } from '$lib/seo/jsonLdSchema';
import { route, url } from '$lib/utils/path';

export const ssr = true;

export async function load({ url: requestUrl, cookies, parent }) {
	const isLoggedIn = !!cookies.get('access_token');
	const { companyInformationPm, marketingInformationPm } = await parent();
	const companyName = companyInformationPm?.config?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default;

	const { metaTitle, metaDescription } = publicToolsPagePresenter.getToolsIndexVm();

	const metaTags = (await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle: `${metaTitle} | ${companyName}`,
		customDescription: metaDescription,
		customSlug: getRootPathPublicTools(),
		requestUrl
	})) satisfies MetaTagsProps;

	const tools = [
		{
			id: 'skill-builder',
			title: 'Skill Builder',
			description:
				'Drag CLI commands and MCP tools into a workflow and export SKILL.md for your agent.',
			href: url(route(getRootPathPublicSkillBuilder())),
			badge: 'Markdown editor'
		},
		{
			id: 'photo-editor',
			title: 'Photo Editor',
			description:
				'Design and resize visuals for social channels in your browser. Download PNG free, or save to your cloud when signed in.',
			href: url(route(getRootPathPublicPhotoEditor())),
			badge: 'Design editor'
		},
		{
			id: 'humanizer',
			title: 'Humanizer',
			description:
				'Rewrite a social post so it reads less machine-written. Human and Roughen run on-device in Chrome. Copy stays free; scheduling needs an account.',
			href: url(route(getRootPathPublicHumanizer())),
			badge: 'On-device rewrite'
		},
		{
			id: 'best-time-to-post',
			title: 'Best Time to Post',
			description:
				'Build a timing test plan from platform benchmark slots, preview them on a week calendar, and schedule controlled experiments in OpenQuok.',
			href: url(route(getRootPathPublicBestTimeToPost())),
			badge: 'Timing calculator'
		},
		{
			id: 'apis-integrations',
			title: 'Integrations APIs',
			description:
				'Programmatic endpoints for connecting social channels and invoking provider-specific tools with a workspace programmatic token.',
			href: url(route(`${getRootPathPublicDocs()}/apis-integrations`)),
			badge: 'API reference'
		}
	];

	const canonical = buildCanonicalUrl(requestUrl);
	const schemaData = createJsonLdGraph([
		{
			'@type': 'CollectionPage',
			'@id': `${canonical}#webpage`,
			name: metaTitle,
			description: metaDescription,
			url: canonical,
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: requestUrl.origin
			}
		}
	]);

	return {
		pageMetaTags: withCanonicalMetaTags(metaTags, canonical),
		isLoggedIn,
		metaTitle,
		metaDescription,
		toolsVm: tools,
		skillBuilderChannelsVm: listSkillBuilderChannelsForHub(),
		photoEditorChannelsVm: listCanvasChannelsForHub(),
		humanizerChannelsVm: listHumanizeChannelsForHub(),
		bestTimeToPostChannelsVm: listBestTimeChannelsForHub(),
		schemaData
	};
}
