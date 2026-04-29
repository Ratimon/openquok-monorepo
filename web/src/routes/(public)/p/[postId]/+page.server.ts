import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PublicPreviewPostViewModel } from '$lib/posts/index';

import { publicPreviewPostByIdPagePresenter } from '$lib/area-public';
import { postsRepository } from '$lib/posts/index';
import { createMetaData } from '$lib/utils/createMetaData';
import { stripHtmlToPlainText, truncatePlainText } from '$lib/utils/plainTextFromHtml';

export const ssr = true;

export const load: PageServerLoad = async ({ params, fetch, parent, url }) => {
	const postId = params.postId;

	const parentData = await parent();
	const companyInformationPm = (parentData as any)?.companyInformationPm ?? null;
	const marketingInformationPm = (parentData as any)?.marketingInformationPm ?? null;

	const { CONFIG_SCHEMA_COMPANY } = await import('$lib/config/constants/config');
	const companyConfig = companyInformationPm?.config as Record<string, string> | undefined;
	const companyName = String(companyConfig?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default);

	const postPreviewPmResult = await postsRepository.getPostPreview(postId, { fetch });

	let postVm: PublicPreviewPostViewModel | null = null;
	let loadError: string | null = null;

	if (!postPreviewPmResult.ok) {
		loadError = postPreviewPmResult.error;
	} else {
		const previewPostPm = postPreviewPmResult.post;
		postVm = publicPreviewPostByIdPagePresenter.loadPreviewPostStateless(previewPostPm).postVm;
	}

	const postText = postVm ? stripHtmlToPlainText(postVm.content || '') : '';
	const postSnippet = truncatePlainText(postText, 120);

	const platformLabel = postVm ? postVm.socialPlatformLabel?.trim() || '' : '';

	const customTitle = postVm
		? `${postSnippet || 'Post'}${platformLabel ? ` · ${platformLabel}` : ''} Preview – Social Media Scheduler`
		: `Post Preview – Social Media Scheduler`;

	const customDescription = postVm
		? truncatePlainText(
				(postSnippet ? `${postSnippet} ` : '') +
					(platformLabel
						? `Preview this scheduled ${platformLabel} post in ${companyName}, a social media scheduler and content calendar.`
						: `Preview this scheduled post in ${companyName}, a social media scheduler and content calendar.`),
				170
			)
		: `Preview this scheduled post in ${companyName}, a social media scheduler and content calendar.`;

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customTags: [
			...(postVm ? [postSnippet] : []),
			...(platformLabel ? [platformLabel.toLowerCase()] : []),
			'social media scheduler',
			'social media scheduling',
			'content calendar',
			'scheduled post',
			'post preview'
		].filter((t) => typeof t === 'string' && t.trim().length > 0),
		customSlug: `p/${encodeURIComponent(postId)}`,
		requestUrl: url
	}) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		...metaTags
	}) satisfies MetaTagsProps;

	return {
		postVm,
		loadError,
		pageMetaTags
	};
};
