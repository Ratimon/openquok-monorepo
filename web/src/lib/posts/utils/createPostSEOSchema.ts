import { base } from '$app/paths';

import type { PublicPreviewPostViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';
import type { PostCommentViewModel } from '$lib/posts/GetScheduledPost.presenter.svelte';
import { stripHtmlToPlainText, truncatePlainText } from '$lib/utils/plainTextFromHtml';

function absoluteAppUrl(origin: string, pathname: string): string {
	const b = base === '/' ? '' : base.replace(/\/$/, '');
	const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return `${origin}${b}${p}`;
}

export type CreatePostSEOSchemaParams = {
	post: PublicPreviewPostViewModel;
	comments?: PostCommentViewModel[];
	/** Full canonical URL of this post page (matches `<link rel="canonical">`). */
	canonicalUrl: string;
	companyName: string;
	/** Primary site URL (e.g. company `URL` config); used for publisher fallbacks. */
	companySiteUrl?: string | null;
	/** Request URL from `load` (used to build URLs with correct origin + base path). */
	requestUrl: URL;
};

/**
 * JSON-LD for a public post preview.
 *
 * Uses Schema.org `SocialMediaPosting` (requested) with a small `BreadcrumbList` graph.
 */
export function createPostSEOSchema(params: CreatePostSEOSchemaParams): Record<string, unknown> {
	const { post, comments = [], canonicalUrl, companyName, companySiteUrl, requestUrl } = params;

	const origin = requestUrl.origin;
	const siteFallback = companySiteUrl?.trim() || origin;

	const postText = stripHtmlToPlainText(post.content || '');
	const snippet = truncatePlainText(postText, 240);
	const headline = truncatePlainText(snippet || postText || 'Social post preview', 110);
	const platformLabel = post.socialPlatformLabel?.trim() || null;

	const publisher: Record<string, unknown> = {
		'@type': 'Organization',
		name: companyName,
		url: siteFallback
	};

	const images = (Array.isArray(post.media) ? post.media : [])
		.map((m) => (typeof m?.path === 'string' ? m.path.trim() : ''))
		.filter(Boolean);

	const socialPosting: Record<string, unknown> = {
		'@type': 'SocialMediaPosting',
		url: canonicalUrl,
		mainEntityOfPage: canonicalUrl,
		headline,
		text: snippet || headline,
		datePublished: post.publishDateIso ? new Date(post.publishDateIso).toISOString() : undefined,
		publisher,
		...(platformLabel ? { isPartOf: { '@type': 'CreativeWorkSeries', name: platformLabel } } : {})
	};

	if (images.length > 0) {
		socialPosting.image = images;
	}

	const commentNodes: Record<string, unknown>[] = [];
	for (const c of comments) {
		if (!c?.id || !c.content) continue;
		commentNodes.push({
			'@type': 'Comment',
			'@id': `${canonicalUrl}#comment-${encodeURIComponent(c.id)}`,
			url: `${canonicalUrl}#comment-${encodeURIComponent(c.id)}`,
			text: c.content,
			dateCreated: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
			dateModified: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
			author: {
				'@type': 'Person',
				name: c.userId ? `User ${String(c.userId).slice(0, 8)}` : 'User'
			}
		});
	}
	if (commentNodes.length > 0) {
		socialPosting.comment = commentNodes.map((n) => ({ '@id': n['@id'] }));
	}

	const breadcrumbList: Record<string, unknown> = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: absoluteAppUrl(origin, '/')
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Post preview',
				item: canonicalUrl
			}
		]
	};

	return {
		'@context': 'https://schema.org',
		'@graph': [socialPosting, breadcrumbList, ...commentNodes]
	};
}
