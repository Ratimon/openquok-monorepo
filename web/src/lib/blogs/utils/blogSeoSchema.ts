import { base } from '$app/paths';

import type {
	Blog,
	BreadcrumbList,
	CollectionPage,
	FAQPage,
	HowTo,
	ItemList,
	Offer,
	Person,
	Product,
	ProfilePage,
	Question,
	Thing
} from 'schema-dts';

import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

import {
	getRootPathPublicBlog,
	getRootPathPublicBlogAuthor,
	getRootPathPublicBlogPost
} from '$lib/area-public/constants/getRootPathPublicBlog';
import type {
	BlogAuthorPublicViewModel,
	BlogPostBySlugPublicViewModel,
	BlogPostCommentViewModel,
	BlogPostPublicViewModel,
	BlogTopicOverviewPublicViewModel
} from '$lib/blogs/GetBlog.presenter.svelte';
import type { BlogSeoFaqItem, BlogSeoHowtoStep, BlogSeoProduct } from '$lib/blogs/blog.types';
import {
	isBlogTopicEligibleForHowTo,
	isBlogTopicEligibleForProduct
} from '$lib/blogs/constants/blogSeoSchemaTopics';
import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils/blogContent';
import { buildBlogInlineImageSrc } from '$lib/blogs/utils/blogImages';
import { createHowToSEOSchema } from '$lib/seo/createHowToSEOSchema';
import { createJsonLdGraph, filterNonEmptyJsonLdNodes, type JsonLdGraphSchema } from '$lib/seo/jsonLdSchema';

function absoluteAppUrl(origin: string, pathname: string): string {
	const b = base === '/' ? '' : base.replace(/\/$/, '');
	const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return `${origin}${b}${p}`;
}

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

function collectionPageNode(params: {
	canonicalUrl: string;
	origin: string;
	companyName: string;
	name: string;
	description: string;
	mainEntityId?: string;
}): CollectionPage {
	const { canonicalUrl, origin, companyName, name, description, mainEntityId } = params;

	return {
		'@type': 'CollectionPage',
		'@id': `${canonicalUrl}#webpage`,
		name,
		description,
		url: canonicalUrl,
		...(mainEntityId ? { mainEntity: { '@id': mainEntityId } } : {}),
		isPartOf: {
			'@type': 'WebSite',
			name: companyName,
			url: origin
		}
	};
}

function blogPostItemListNode(params: {
	canonicalUrl: string;
	origin: string;
	listName: string;
	listDescription: string;
	posts: BlogPostPublicViewModel[];
}): ItemList {
	const { canonicalUrl, origin, listName, listDescription, posts } = params;

	return {
		'@type': 'ItemList',
		'@id': `${canonicalUrl}#posts-list`,
		name: listName,
		description: listDescription,
		url: canonicalUrl,
		numberOfItems: posts.length,
		itemListElement: posts.map((post, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: {
				'@type': 'BlogPosting',
				headline: post.title,
				description: post.description?.trim() || undefined,
				url: absoluteAppUrl(origin, `/${getRootPathPublicBlogPost(post.slug)}`),
				datePublished: post.createdAt ? new Date(post.createdAt).toISOString() : undefined
			}
		}))
	};
}

export type CreateBlogIndexSEOSchemaParams = {
	canonicalUrl: string;
	origin: string;
	companyName: string;
	name: string;
	description: string;
	posts: BlogPostPublicViewModel[];
};

/** JSON-LD for `/blog` — `Blog` hub + post `ItemList`. */
export function createBlogIndexSEOSchema(params: CreateBlogIndexSEOSchemaParams): JsonLdGraphSchema {
	const { canonicalUrl, origin, companyName, name, description, posts } = params;
	const blogIndexUrl = absoluteAppUrl(origin, `/${getRootPathPublicBlog()}`);

	const blogNode: Blog = {
		'@type': 'Blog',
		'@id': `${blogIndexUrl}#blog`,
		name: `${companyName} Blog`,
		description,
		url: blogIndexUrl,
		blogPost: posts.map((post) => ({
			'@type': 'BlogPosting',
			headline: post.title,
			url: absoluteAppUrl(origin, `/${getRootPathPublicBlogPost(post.slug)}`)
		}))
	};

	const postsList = blogPostItemListNode({
		canonicalUrl,
		origin,
		listName: name,
		listDescription: description,
		posts
	});

	return createJsonLdGraph([
		collectionPageNode({
			canonicalUrl,
			origin,
			companyName,
			name,
			description,
			mainEntityId: `${canonicalUrl}#posts-list`
		}),
		blogNode,
		postsList
	]);
}

export type CreateBlogTopicsIndexSEOSchemaParams = {
	canonicalUrl: string;
	origin: string;
	companyName: string;
	name: string;
	description: string;
	topics: BlogTopicOverviewPublicViewModel[];
};

/** JSON-LD for `/blog/topic` — topic directory `ItemList`. */
export function createBlogTopicsIndexSEOSchema(
	params: CreateBlogTopicsIndexSEOSchemaParams
): JsonLdGraphSchema {
	const { canonicalUrl, origin, companyName, name, description, topics } = params;

	const topicsList: ItemList = {
		'@type': 'ItemList',
		'@id': `${canonicalUrl}#topics-list`,
		name,
		description,
		url: canonicalUrl,
		numberOfItems: topics.length,
		itemListElement: topics.map((topic, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: topic.name,
			description: topic.description?.trim() || undefined,
			url: absoluteAppUrl(origin, `/${getRootPathPublicBlog()}/topic/${topic.slug}`)
		}))
	};

	return createJsonLdGraph([
		collectionPageNode({
			canonicalUrl,
			origin,
			companyName,
			name,
			description,
			mainEntityId: `${canonicalUrl}#topics-list`
		}),
		topicsList
	]);
}

export type CreateBlogTopicSEOSchemaParams = {
	canonicalUrl: string;
	origin: string;
	companyName: string;
	topic: BlogTopicOverviewPublicViewModel;
	posts: BlogPostPublicViewModel[];
};

/** JSON-LD for `/blog/topic/{slug}` — filtered post list + breadcrumbs. */
export function createBlogTopicSEOSchema(params: CreateBlogTopicSEOSchemaParams): JsonLdGraphSchema {
	const { canonicalUrl, origin, companyName, topic, posts } = params;
	const name = topic.name;
	const description = topic.description?.trim() || `Blog posts about ${topic.name}`;
	const blogIndexUrl = absoluteAppUrl(origin, `/${getRootPathPublicBlog()}`);

	const postsList = blogPostItemListNode({
		canonicalUrl,
		origin,
		listName: `${topic.name} posts`,
		listDescription: description,
		posts
	});

	const breadcrumbList: BreadcrumbList = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				item: {
					'@id': blogIndexUrl,
					name: 'Blog'
				}
			},
			{
				'@type': 'ListItem',
				position: 2,
				item: {
					'@id': canonicalUrl,
					name: topic.name
				}
			}
		]
	};

	return createJsonLdGraph([
		collectionPageNode({
			canonicalUrl,
			origin,
			companyName,
			name,
			description,
			mainEntityId: `${canonicalUrl}#posts-list`
		}),
		postsList,
		breadcrumbList
	]);
}

export type CreateBlogAuthorsIndexSEOSchemaParams = {
	canonicalUrl: string;
	origin: string;
	companyName: string;
	name: string;
	description: string;
	authors: BlogAuthorPublicViewModel[];
};

function authorProfileUrl(origin: string, author: BlogAuthorPublicViewModel): string {
	const identifier = author.username?.trim() || author.id;
	return absoluteAppUrl(origin, `/${getRootPathPublicBlogAuthor(identifier)}`);
}

/** JSON-LD for `/blog/author` — author directory `ItemList`. */
export function createBlogAuthorsIndexSEOSchema(
	params: CreateBlogAuthorsIndexSEOSchemaParams
): JsonLdGraphSchema {
	const { canonicalUrl, origin, companyName, name, description, authors } = params;

	const authorsList: ItemList = {
		'@type': 'ItemList',
		'@id': `${canonicalUrl}#authors-list`,
		name,
		description,
		url: canonicalUrl,
		numberOfItems: authors.length,
		itemListElement: authors.map((author, index) => {
			const displayName = author.fullName?.trim() || author.username?.trim() || 'Anonymous';
			return {
				'@type': 'ListItem',
				position: index + 1,
				item: {
					'@type': 'Person',
					name: displayName,
					description: author.tagLine?.trim() || undefined,
					url: authorProfileUrl(origin, author),
					image: author.avatarUrl?.trim() || undefined
				}
			};
		})
	};

	return createJsonLdGraph([
		collectionPageNode({
			canonicalUrl,
			origin,
			companyName,
			name,
			description,
			mainEntityId: `${canonicalUrl}#authors-list`
		}),
		authorsList
	]);
}

export type CreateBlogAuthorSEOSchemaParams = {
	canonicalUrl: string;
	origin: string;
	companyName: string;
	author: BlogAuthorPublicViewModel;
	identifier: string;
	posts: BlogPostPublicViewModel[];
};

/** JSON-LD for `/blog/author/{identifier}` — `ProfilePage` + `Person` + post list. */
export function createBlogAuthorSEOSchema(params: CreateBlogAuthorSEOSchemaParams): JsonLdGraphSchema {
	const { canonicalUrl, origin, companyName, author, identifier, posts } = params;
	const displayName = author.fullName?.trim() || author.username?.trim() || 'Anonymous';
	const description = author.tagLine?.trim() || `Blog posts by ${displayName}`;
	const blogIndexUrl = absoluteAppUrl(origin, `/${getRootPathPublicBlog()}`);
	const authorUrl = absoluteAppUrl(origin, `/${getRootPathPublicBlogAuthor(identifier)}`);
	const authorImage = author.avatarUrl?.trim() || undefined;
	const authorHandle = author.username?.trim() ? `@${author.username.trim()}` : undefined;

	const postsList = blogPostItemListNode({
		canonicalUrl,
		origin,
		listName: `Posts by ${displayName}`,
		listDescription: description,
		posts
	});

	const breadcrumbList: BreadcrumbList = {
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				item: {
					'@id': blogIndexUrl,
					name: 'Blog'
				}
			},
			{
				'@type': 'ListItem',
				position: 2,
				item: {
					'@id': authorUrl,
					name: displayName
				}
			}
		]
	};

	return createJsonLdGraph([
		{
			'@type': 'ProfilePage',
			'@id': `${canonicalUrl}#webpage`,
			name: displayName,
			description,
			url: canonicalUrl,
			mainEntity: {
				'@id': `${canonicalUrl}#person`
			},
			isPartOf: {
				'@type': 'WebSite',
				name: companyName,
				url: origin
			}
		} satisfies ProfilePage,
		{
			'@type': 'Person',
			'@id': `${canonicalUrl}#person`,
			name: displayName,
			description,
			url: authorUrl,
			image: authorImage,
			alternateName: authorHandle,
			sameAs: author.website?.trim() ? [author.website.trim()] : undefined,
			mainEntityOfPage: {
				'@id': `${canonicalUrl}#webpage`
			}
		} satisfies Person,
		postsList,
		breadcrumbList
	]);
}

function createBlogPostFaqPageNode(params: {
	canonicalUrl: string;
	postTitle: string;
	items: BlogSeoFaqItem[];
}): FAQPage | Record<string, never> {
	const { canonicalUrl, postTitle, items } = params;
	if (items.length === 0) return {};

	return {
		'@type': 'FAQPage',
		'@id': `${canonicalUrl}#faq`,
		name: `${postTitle} FAQ`,
		url: canonicalUrl,
		mainEntity: items.map(
			(item) =>
				({
					'@type': 'Question',
					name: item.question,
					acceptedAnswer: {
						'@type': 'Answer',
						text: stripHtmlToPlainText(prepareBlogRichTextForDisplay(item.answer))
					}
				}) as Question
		)
	};
}

function createBlogPostHowToNode(params: {
	canonicalUrl: string;
	postTitle: string;
	description: string;
	steps: BlogSeoHowtoStep[];
}): HowTo | Record<string, never> {
	const { canonicalUrl, postTitle, description, steps } = params;
	if (steps.length === 0) return {};

	return createHowToSEOSchema({
		canonicalUrl,
		name: postTitle,
		description,
		steps: steps.map((step) => ({
			name: step.name,
			text: stripHtmlToPlainText(prepareBlogRichTextForDisplay(step.text))
		}))
	});
}

function createBlogPostProductNode(params: {
	canonicalUrl: string;
	companyName: string;
	companySiteUrl: string;
	heroImageUrl: string;
	product: BlogSeoProduct;
}): Product | Record<string, never> {
	const { canonicalUrl, companyName, companySiteUrl, heroImageUrl, product } = params;
	if (!product.name?.trim() || !product.description?.trim()) return {};

	const brandName = product.brand?.trim() || companyName;
	const productUrl = product.url?.trim() || companySiteUrl;

	const offers = {
		'@type': 'Offer',
		price: '0',
		priceCurrency: 'USD',
		availability: 'https://schema.org/InStock',
		url: productUrl
	} satisfies Offer;

	return {
		'@type': 'Product',
		'@id': `${canonicalUrl}#product`,
		name: product.name.trim(),
		description: product.description.trim(),
		url: productUrl,
		brand: {
			'@type': 'Brand',
			name: brandName
		},
		offers,
		...(heroImageUrl ? { image: heroImageUrl } : {})
	} satisfies Product;
}

export type CreateBlogPostSEOSchemaParams = {
	post: BlogPostBySlugPublicViewModel;
	comments?: BlogPostCommentViewModel[];
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
 * JSON-LD for a public blog post: `BlogPosting` + `BreadcrumbList` in a single `@graph`.
 */
export function createBlogPostSEOSchema(params: CreateBlogPostSEOSchemaParams): JsonLdGraphSchema {
	const { post, comments = [], canonicalUrl, companyName, companySiteUrl, companyLogoUrl, requestUrl } = params;

	const origin = requestUrl.origin;
	const blogIndexUrl = absoluteAppUrl(origin, `/${getRootPathPublicBlog()}`);

	const authorName = post.author?.fullName ?? post.author?.username ?? 'Anonymous';
	const topicName = post.topic?.name ?? 'Blog';
	const topicSlug = post.topic?.slug ?? null;
	const topicId = post.topic?.id ?? null;
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

	const faqItems = post.faqItems ?? [];
	const howtoSteps = post.howtoSteps ?? [];
	const product = post.product;

	const extraNodes = filterNonEmptyJsonLdNodes([
		faqItems.length > 0
			? createBlogPostFaqPageNode({
					canonicalUrl,
					postTitle: post.title,
					items: faqItems
				})
			: {},
		isBlogTopicEligibleForHowTo(topicSlug, topicId) && howtoSteps.length > 0
			? createBlogPostHowToNode({
					canonicalUrl,
					postTitle: post.title,
					description,
					steps: howtoSteps
				})
			: {},
		isBlogTopicEligibleForProduct(topicSlug, topicId) && product
			? createBlogPostProductNode({
					canonicalUrl,
					companyName,
					companySiteUrl: siteFallback,
					heroImageUrl: heroUrl,
					product
				})
			: {}
	]);

	return createJsonLdGraph([blogPosting, breadcrumbList, ...commentNodes, ...extraNodes] as Thing[]);
}
