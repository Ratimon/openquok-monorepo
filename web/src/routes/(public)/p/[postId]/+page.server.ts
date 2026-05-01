import type { PageServerLoad } from './$types';
import type { MetaTagsProps } from 'svelte-meta-tags';
import type { PostCommentViewModel, PublicPreviewPostViewModel } from '$lib/posts/index';
import { getScheduledPostsPresenter, toPublicPreviewChannelVm } from '$lib/posts/index';

import { error } from '@sveltejs/kit';
import { publicPreviewPostByIdPagePresenter } from '$lib/area-public';
import { publicUrlForMediaStorageKey } from '$lib/medias/utils/publicMediaObjectUrl';
import { createPostSEOSchema } from '$lib/posts/utils/createPostSEOSchema';
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

	let postVm: PublicPreviewPostViewModel | null = null;
	let commentsVm: PostCommentViewModel[] = [];

	postVm = await publicPreviewPostByIdPagePresenter.loadPreviewPostByIdStateless({ postId, fetch });
	if (!postVm) {
		throw error(404, 'Post not found');
	}

	commentsVm = await publicPreviewPostByIdPagePresenter.loadPublicCommentsStateless(postId, { fetch });

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

	const keywords = [
		...(postVm ? [postSnippet] : []),
		...(platformLabel ? [platformLabel.toLowerCase()] : []),
		'social media scheduler',
		'social media scheduling',
		'scheduled post',
		'post preview'
	].filter((t) => typeof t === 'string' && t.trim().length > 0);

	const firstMediaPath =
		postVm && Array.isArray(postVm.media) && typeof postVm.media[0]?.path === 'string'
			? postVm.media[0].path
			: '';
	const ogImageUrl = firstMediaPath ? publicUrlForMediaStorageKey(firstMediaPath) : '';

	const customImages = ogImageUrl
		? [
				{
					url: ogImageUrl,
					alt: postSnippet ? `Image for: ${postSnippet}` : `Image for scheduled post preview`,
					type: 'image',
					width: 1200,
					height: 630
				}
			]
		: undefined;

	const twitterExtras = ogImageUrl
		? ([{ name: 'twitter:card', content: 'summary_large_image' }] as const)
		: [];

	const metaTags = await createMetaData({
		companyInformation: companyInformationPm,
		marketingInformation: marketingInformationPm,
		customTitle,
		customDescription,
		customTags: keywords,
		customImages,
		customSlug: `p/${encodeURIComponent(postId)}`,
		customMetaTags: [...twitterExtras],
		requestUrl: url
	}) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		...metaTags
	}) satisfies MetaTagsProps;

	const canonicalHref =
		typeof pageMetaTags.canonical === 'string'
			? pageMetaTags.canonical
			: new URL(url.pathname, url.origin).href;

	const companyUrl = String((companyConfig?.URL ?? CONFIG_SCHEMA_COMPANY.URL.default) || '');

	const schemaData = createPostSEOSchema({
		post: postVm,
		comments: commentsVm,
		canonicalUrl: canonicalHref,
		companyName,
		companySiteUrl: companyUrl,
		requestUrl: url
	});

	return {
		postVm,
		previewChannelVm: toPublicPreviewChannelVm(postVm),
		previewMediaUrlsVm: getScheduledPostsPresenter.toPostMediaPreviewUrlsVm(postVm.media ?? []),
		commentsVm,
		pageMetaTags,
		schemaData
	};
};
