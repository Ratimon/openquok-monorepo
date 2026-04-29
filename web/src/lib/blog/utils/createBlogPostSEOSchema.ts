import { base } from '$app/paths';

import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import type { BlogPostBySlugPublicViewModel } from '$lib/blog/GetBlog.presenter.svelte';
import type { BlogPostCommentProgrammerModel } from '$lib/blog/index';
import { buildBlogInlineImageSrc } from '$lib/blog/utils/buildBlogInlineImageSrc';

/** Guess MIME type from a storage filename (used for OG / JSON-LD image). */
export function guessImageMimeFromFilename(filename: string): string {
	const name = filename.split('?')[0].toLowerCase();
	const ext = name.split('.').pop();
	switch (ext) {
		case 'png':
			return 'image/png';
		case 'webp':
			return 'image/webp';
		case 'gif':
			return 'image/gif';
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'svg':
			return 'image/svg+xml';
		default:
			return 'image/jpeg';
	}
}

function absoluteAppUrl(origin: string, pathname: string): string {
	const b = base === '/' ? '' : base.replace(/\/$/, '');
	const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return `${origin}${b}${p}`;
}

export type CreateBlogPostSEOSchemaParams = {
	post: BlogPostBySlugPublicViewModel;
	comments?: BlogPostCommentProgrammerModel[];
	/** Full canonical URL of this post page (matches `<link rel="canonical">`). */
	canonicalUrl: string;
	companyName: string;
	/** Primary site URL (e.g. company `URL` config); used for publisher / author fallbacks. */
	companySiteUrl?: string | null;
	/** Optional logo URL for `publisher.logo`. */
	companyLogoUrl?: string | null;
	/** Request URL from `load` (used to build blog index / topic URLs with correct origin + base path). */
	requestUrl: URL;
};

/**
 * JSON-LD for a public blog post: `BlogPosting` + `BreadcrumbList` in a single `@graph`
 * (ported from `blog-system` `generateBlogPostSEOSchema`, adapted to `BlogPostBySlugPublicViewModel`).
 */
export function createBlogPostSEOSchema(params: CreateBlogPostSEOSchemaParams): Record<string, unknown> {
	const { post, comments = [], canonicalUrl, companyName, companySiteUrl, companyLogoUrl, requestUrl } = params;

	const origin = requestUrl.origin;
	const blogIndexUrl = absoluteAppUrl(origin, `/${getRootPathPublicBlog()}`);

	const authorName = post.author?.fullName ?? post.author?.username ?? 'Anonymous';
	const topicName = post.topic?.name ?? 'Blog';
	const siteFallback = companySiteUrl?.trim() || origin;

	const publishedAt = post.publishedAt ?? post.createdAt;
	const updatedAt = post.updatedAt ?? post.createdAt;
	const minutes = post.readingTimeMinutes ?? 0;

	const description =
		post.description?.trim() ??
		`Read ${post.title} by ${authorName}. ${minutes ? `${minutes} minute read.` : ''}`.trim();

	const heroUrl = post.heroImageFilename ? buildBlogInlineImageSrc(post.heroImageFilename) : '';

	const author: Record<string, unknown> = {
		'@type': 'Person',
		name: authorName,
		url: post.author?.website?.trim() || siteFallback
	};
	if (post.author?.avatarUrl?.trim()) {
		author.image = post.author.avatarUrl.trim();
	}
	if (post.author?.tagLine?.trim()) {
		author.description = post.author.tagLine.trim();
	}

	const publisher: Record<string, unknown> = {
		'@type': 'Organization',
		name: companyName,
		url: siteFallback
	};
	if (companyLogoUrl?.trim()) {
		publisher.logo = {
			'@type': 'ImageObject',
			url: companyLogoUrl.trim()
		};
	}

	let image: Record<string, unknown> | undefined;
	if (heroUrl && post.heroImageFilename) {
		const mime = guessImageMimeFromFilename(post.heroImageFilename);
		image = {
			'@type': 'ImageObject',
			contentUrl: heroUrl,
			url: heroUrl,
			name: `Featured image for blog post: ${post.title}`,
			width: '1200',
			height: '630',
			encodingFormat: mime
		};
		if (publishedAt) {
			image.datePublished = new Date(publishedAt).toISOString();
		}
		if (authorName) {
			image.author = authorName;
		}
	}

	const interactionStatistic: Record<string, unknown>[] = [];
	if (post.likeCount != null && post.likeCount > 0) {
		interactionStatistic.push({
			'@type': 'InteractionCounter',
			interactionType: 'https://schema.org/LikeAction',
			userInteractionCount: post.likeCount
		});
	}

	const wordCount = post.content?.trim()
		? post.content.trim().split(/\s+/).filter(Boolean).length
		: undefined;

	const blogPosting: Record<string, unknown> = {
		'@type': 'BlogPosting',
		headline: post.title,
		description: description || undefined,
		articleSection: topicName,
		author,
		datePublished: publishedAt ? new Date(publishedAt).toISOString() : undefined,
		dateModified: updatedAt ? new Date(updatedAt).toISOString() : undefined,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': canonicalUrl
		},
		keywords: post.topic?.name || undefined,
		articleBody: post.content?.trim() || undefined,
		wordCount,
		publisher,
		isAccessibleForFree: true,
		inLanguage: 'en',
		genre: 'blog',
		timeRequired: `PT${minutes || 5}M`,
		isPartOf: {
			'@type': 'Blog',
			name: `${companyName} Blog`,
			url: blogIndexUrl
		}
	};

	if (image) {
		blogPosting.image = image;
	}
	if (interactionStatistic.length) {
		blogPosting.interactionStatistic = interactionStatistic;
	}

	const commentNodes: Record<string, unknown>[] = [];
	for (const c of comments) {
		if (!c?.id || !c.content) continue;
		const commentId = String(c.id);
		const commentAnchor = `${canonicalUrl}#comment-${encodeURIComponent(commentId)}`;
		const authorNameForComment =
			c.author?.fullName?.trim() || (c.userId ? `User ${String(c.userId).slice(0, 8)}` : 'User');

		commentNodes.push({
			'@type': 'Comment',
			'@id': commentAnchor,
			url: commentAnchor,
			text: c.content,
			dateCreated: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
			dateModified: c.updatedAt ? new Date(c.updatedAt).toISOString() : undefined,
			author: {
				'@type': 'Person',
				name: authorNameForComment
			}
		});
	}
	if (commentNodes.length > 0) {
		blogPosting.comment = commentNodes.map((n) => ({ '@id': n['@id'] }));
	}

	const breadcrumbItems: Record<string, unknown>[] = [
		{
			'@type': 'ListItem',
			position: 1,
			item: {
				'@id': blogIndexUrl,
				name: 'Blog'
			}
		}
	];

	if (post.topic) {
		const topicUrl = absoluteAppUrl(origin, `/${getRootPathPublicBlog()}/topic/${post.topic.slug}`);
		breadcrumbItems.push({
			'@type': 'ListItem',
			position: 2,
			item: {
				'@id': topicUrl,
				name: post.topic.name
			}
		});
	}

	breadcrumbItems.push({
		'@type': 'ListItem',
		position: post.topic ? 3 : 2,
		item: {
			'@id': canonicalUrl,
			name: post.title
		}
	});

	const breadcrumbList: Record<string, unknown> = {
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbItems
	};

	return {
		'@context': 'https://schema.org',
		'@graph': [blogPosting, breadcrumbList, ...commentNodes]
	};
}
