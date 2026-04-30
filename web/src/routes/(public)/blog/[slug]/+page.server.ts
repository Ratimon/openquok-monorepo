import type { MetaTagsProps } from 'svelte-meta-tags';
import type { BlogPostCommentProgrammerModel } from '$lib/blogs/index';

import { error } from '@sveltejs/kit';

import { buildBlogInlineImageSrc, createBlogPostSEOSchema, guessImageMimeFromFilename } from '$lib/blogs/utils';
import { publicBlogBySlugPagePresenter, publicInformationRepository } from '$lib/area-public/index';
import { getRootPathPublicBlog, getRootPathPublicBlogPost } from '$lib/area-public/constants/getRootPathPublicBlog';
import { CONFIG_SCHEMA_MARKETING } from '$lib/config/constants/config';
import { createMetaData } from '$lib/utils/createMetaData';

export const ssr = true;

export async function load({ url, params, fetch, cookies }) {
	const { slug } = params;

	// Guard against Next.js-like edge case: user hitting `/blog/<file>.jpg`.
	if (typeof slug !== 'string' || slug.trim().length === 0) throw error(404, 'Blog post not found');
	if (/\.(jpg|jpeg|png|gif|webp)$/i.test(slug)) throw error(404, 'Blog post not found');

	const accessToken = cookies.get('access_token');
	const isLoggedIn = !!accessToken;

	const { companyInformation: companyInformationPm, marketingInformation: marketingInformationPm } =
		await publicInformationRepository.getAllInformationCombined();

	const rootBlog = getRootPathPublicBlog();

	// Configurable related posts count (kept here for easy tuning per route).
	const relatedPostsLimit = 2;

	const { currentPostVm, otherPostsVm } = await publicBlogBySlugPagePresenter.loadDataForBlogPostBySlugStateless({
		slug,
		fetch,
		relatedLimit: relatedPostsLimit
	});

	if (!currentPostVm) {
		throw error(404, 'Blog post not found');
	}

	const comments: BlogPostCommentProgrammerModel[] =
		await publicBlogBySlugPagePresenter.loadPostComments({ postId: currentPostVm.id, fetch });

	const { CONFIG_SCHEMA_COMPANY } = await import('$lib/config/constants/config');
	const companyConfig = companyInformationPm?.config as Record<string, string> | undefined;
	const companyName = String(companyConfig?.NAME ?? CONFIG_SCHEMA_COMPANY.NAME.default);
	const companySiteUrl = companyConfig?.URL?.trim() || null;
	const companyLogoUrl =
		companyConfig?.LOGO_URL?.trim() || companyConfig?.LOGO?.trim() || null;

	const authorName =
		currentPostVm.author?.fullName ?? currentPostVm.author?.username ?? 'Anonymous';
	const topicName = currentPostVm.topic?.name ?? 'Blog';

	const publishedAt = currentPostVm.publishedAt ?? currentPostVm.createdAt;
	const updatedAt = currentPostVm.updatedAt ?? currentPostVm.createdAt;

	const minutes = currentPostVm.readingTimeMinutes ?? 0;
	const minutesLabel = minutes ? `${minutes} minutes` : `5 minutes`;

	const description =
		currentPostVm.description ??
		`Read ${currentPostVm.title} by ${authorName}. ${
			minutes ? `${minutes} minute read.` : ''
		}`.trim();

	const keywords = ['blog', topicName, ...(currentPostVm.title?.split(' ') ?? []), authorName].filter(Boolean);

	let ogImageUrl = '';
	if (currentPostVm.heroImageFilename) {
		ogImageUrl = buildBlogInlineImageSrc(currentPostVm.heroImageFilename);
	}

	const customImages = ogImageUrl
		? [
				{
					url: ogImageUrl,
					alt: `Featured image for ${currentPostVm.title}`,
					type: guessImageMimeFromFilename(currentPostVm.heroImageFilename ?? ''),
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
		customTitle: currentPostVm.title || `${slug} Blog Post`,
		customDescription: description || `${slug} Blog Post`,
		customTags: keywords,
		customImages,
		customSlug: getRootPathPublicBlogPost(slug),
		customMetaTags: [
			{ property: 'article:published_time', content: publishedAt },
			{ property: 'article:modified_time', content: updatedAt },
			{ property: 'article:author', content: authorName },
			{ property: 'article:section', content: topicName },
			{ name: 'twitter:label1', content: 'Written by' },
			{ name: 'twitter:data1', content: authorName },
			{ name: 'twitter:label2', content: 'Reading time' },
			{ name: 'twitter:data2', content: minutesLabel },
			...twitterExtras
		],
		requestUrl: url
	}) satisfies MetaTagsProps;

	const pageMetaTags = Object.freeze({
		canonical: new URL(url.pathname, url.origin).href,
		openGraph: {
			title: String(CONFIG_SCHEMA_MARKETING.META_TITLE.default),
			description: String(CONFIG_SCHEMA_MARKETING.META_DESCRIPTION.default),
		},
		...metaTags
	}) satisfies MetaTagsProps;

	const canonicalHref =
		typeof pageMetaTags.canonical === 'string'
			? pageMetaTags.canonical
			: new URL(url.pathname, url.origin).href;

	const schemaData = createBlogPostSEOSchema({
		post: currentPostVm,
		comments,
		canonicalUrl: canonicalHref,
		companyName,
		companySiteUrl,
		companyLogoUrl,
		requestUrl: url
	});

	return {
		pageMetaTags,
		isLoggedIn,
		companyInformationPm,
		marketingInformationPm,
		rootBlog,
		slug,
		currentPostVm,
		otherPostsVm,
		comments,
		schemaData
	};
}
