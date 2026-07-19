import { base } from '$app/paths';

import type { Blog, BreadcrumbList, CollectionPage, ItemList, Person, ProfilePage } from 'schema-dts';

import {
	getRootPathPublicBlog,
	getRootPathPublicBlogAuthor,
	getRootPathPublicBlogPost
} from '$lib/area-public/constants/getRootPathPublicBlog';
import type {
	BlogAuthorPublicViewModel,
	BlogPostPublicViewModel,
	BlogTopicOverviewPublicViewModel
} from '$lib/blogs/GetBlog.presenter.svelte';
import { createJsonLdGraph, type JsonLdGraphSchema } from '$lib/utils/jsonLdSchema';

function absoluteAppUrl(origin: string, pathname: string): string {
	const b = base === '/' ? '' : base.replace(/\/$/, '');
	const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
	return `${origin}${b}${p}`;
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
