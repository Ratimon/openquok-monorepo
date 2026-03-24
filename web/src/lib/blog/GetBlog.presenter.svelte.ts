import type { AdminBlogCommentVm, AdminBlogActivityVm } from '$lib/blog/blog.types';
import type {
	AdminBlogActivityProgrammerModel,
	AdminBlogCommentProgrammerModel,
	ActiveBlogTopicProgrammerModel,
	BlogPostProgrammerModel,
	BlogRepository,
	BlogTopicProgrammerModel,
	PublishedBlogAuthorProgrammerModel
} from '$lib/blog/Blog.repository.svelte';

/** View model for admin blog posts list (e.g. blog manager posts page). */
export interface BlogPostViewModel {
	id: string;
	title: string;
	description: string | null;
	slug: string;
	topicName: string | null;
	isSponsored: boolean;
	isFeatured: boolean;
	isAdminApproved: boolean;
	isUserPublished: boolean;
	heroImageFilename: string | null;
	/** Used for storage cleanup when deleting a post from the manager (inline images in body). */
	content: string | null;
	createdAt: string;
}

/** View model for admin blog editor post detail. */
export type BlogPostEditorViewModel = BlogPostProgrammerModel;

/** View model for blog topic options in editor. */
export type BlogTopicViewModel = BlogTopicProgrammerModel;

/** Public blog post view model (used by public blog overview UI). */
export interface BlogPostPublicViewModel {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	heroImageFilename: string | null;
	readingTimeMinutes: number | null;
	createdAt: string;
	isSponsored: boolean;
	isFeatured: boolean;
}

/** Public blog post detail view model (used by the public blog slug page). */
export interface BlogPostBySlugPublicViewModel {
	id: string;
	title: string;
	slug: string;
	description: string | null;
	heroImageFilename: string | null;
	readingTimeMinutes: number | null;
	createdAt: string;
	publishedAt: string | null;
	updatedAt: string | null;
	content: string | null;
	isSponsored: boolean;
	isFeatured: boolean;
	topic: { id: string; name: string; slug: string } | null;
	author: {
		id: string;
		fullName: string | null;
		username: string | null;
		avatarUrl: string | null;
		website: string | null;
		tagLine: string | null;
	} | null;
	likeCount: number | null;
}

/** Public blog topic view model (used by topic navigation UI). */
export interface BlogTopicPublicViewModel {
	id: string;
	name: string;
}

/** Public blog author (authors list + author page header). */
export interface BlogAuthorPublicViewModel {
	id: string;
	fullName: string | null;
	username: string | null;
	avatarUrl: string | null;
	website: string | null;
	tagLine: string | null;
	postCount: number;
}

/** Public topic card on the blog topics overview page (active topics + post counts). */
export interface BlogTopicOverviewPublicViewModel {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	postCount: number;
}

/** View model for the public blog overview page (list + topics). */
export interface PublicBlogOverviewVm {
	posts: BlogPostPublicViewModel[];
	count: number;
	topics: BlogTopicPublicViewModel[];
}

export class GetBlogPresenter {
	constructor(private readonly blogRepository: BlogRepository) {}

	public async loadAdminPosts(fetch?: typeof globalThis.fetch): Promise<BlogPostViewModel[]> {
		const postsPm = await this.blogRepository.getAdminBlogPosts(fetch);
		return postsPm.map((post: BlogPostProgrammerModel): BlogPostViewModel => this.toBlogPostVm(post));
	}

	/** Admin comments manager list (editor+). */
	public async loadAdminCommentsVm(
		params?: { limit?: number; searchTerm?: string | null },
		fetch?: typeof globalThis.fetch
	): Promise<AdminBlogCommentVm[]> {
		const listPm = await this.blogRepository.getAdminBlogComments(
			{ limit: params?.limit ?? 100, searchTerm: params?.searchTerm },
			fetch
		);
		return listPm.map((pm: AdminBlogCommentProgrammerModel): AdminBlogCommentVm => this.toAdminBlogCommentVm(pm));
	}

	/** Admin activities manager list (editor+). */
	public async loadAdminActivitiesVm(
		params?: { limit?: number },
		fetch?: typeof globalThis.fetch
	): Promise<AdminBlogActivityVm[]> {
		const listPm = await this.blogRepository.getAdminBlogActivities({ limit: params?.limit ?? 100 }, fetch);
		return listPm.map((pm: AdminBlogActivityProgrammerModel): AdminBlogActivityVm => this.toAdminBlogActivityVm(pm));
	}

	/**
	 * Public blog overview.
	 * This presenter intentionally has no `$state` and always returns `*Vm` types.
	 */
	public async loadPublishedBlogOverviewVm({
		fetch,
		limit,
		skip,
		topicId,
		authorId
	}: {
		fetch?: typeof globalThis.fetch;
		limit: number;
		skip: number;
		topicId: string | null;
		authorId?: string | null;
	}): Promise<PublicBlogOverviewVm> {
		const [postsResult, topics] = await Promise.all([
			this.blogRepository.getPublishedBlogPosts({ limit, skip, topicId, authorId: authorId ?? null, fetch }),
			this.blogRepository.getBlogTopicsPublic(fetch)
		]);

		return {
			posts: postsResult.posts.map((post: BlogPostProgrammerModel): BlogPostPublicViewModel => this.toBlogPostPublicVm(post)),
			count: postsResult.count,
			topics: topics.map((topic: BlogTopicProgrammerModel): BlogTopicPublicViewModel => this.toBlogTopicPublicVm(topic))
		};
	}

	/** Published authors with at least one public post (public authors index). */
	public async loadPublishedBlogAuthorsVm({
		fetch
	}: {
		fetch?: typeof globalThis.fetch;
	}): Promise<{ authors: BlogAuthorPublicViewModel[] }> {
		const authorsPm = await this.blogRepository.getPublishedBlogAuthors(fetch);
		return {
			authors: authorsPm.map((a: PublishedBlogAuthorProgrammerModel): BlogAuthorPublicViewModel =>
				this.toBlogAuthorPublicVm(a)
			)
		};
	}

	/** Active topics with post counts for the public topics overview route. */
	public async loadActiveBlogTopicsOverviewVm({
		fetch
	}: {
		fetch?: typeof globalThis.fetch;
	}): Promise<{ topics: BlogTopicOverviewPublicViewModel[] }> {
		const topicsPm = await this.blogRepository.getActiveBlogTopicsPublic(fetch);
		return {
			topics: topicsPm.map((topic: ActiveBlogTopicProgrammerModel): BlogTopicOverviewPublicViewModel =>
				this.toBlogTopicOverviewPublicVm(topic)
			)
		};
	}

	/**
	 * Public blog post by slug/identifier (no auth required).
	 * Returns a view model ready for UI.
	 */
	public async loadPublishedBlogPostBySlug(
		slug: string,
		fetch?: typeof globalThis.fetch
	): Promise<BlogPostBySlugPublicViewModel | null> {
		const pm = await this.blogRepository.getPublishedBlogPostBySlug(slug, fetch);
		if (!pm) return null;
		return this.toBlogPostBySlugPublicVm(pm);
	}

	/**
	 * Small related-posts helper for blog pages.
	 * Excludes `skipId` (usually the current post's id).
	 */
	public async loadPublishedRelatedBlogPosts({
		limit,
		skipId,
		fetch
	}: {
		limit: number;
		skipId: string;
		fetch?: typeof globalThis.fetch;
	}): Promise<BlogPostPublicViewModel[]> {
		const { posts } = await this.blogRepository.getPublishedBlogPosts({
			limit,
			skip: 0,
			topicId: null,
			skipId,
			fetch
		});

		return posts.map((p: BlogPostProgrammerModel): BlogPostPublicViewModel => this.toBlogPostPublicVm(p));
	}

	private toBlogPostBySlugPublicVm(post: BlogPostProgrammerModel): BlogPostBySlugPublicViewModel {
		return {
			id: post.id,
			title: post.title,
			slug: post.slug,
			description: post.description,
			heroImageFilename: post.heroImageFilename,
			readingTimeMinutes: post.readingTimeMinutes,
			createdAt: post.createdAt,
			publishedAt: post.publishedAt,
			updatedAt: post.updatedAt,
			content: post.content,
			isSponsored: post.isSponsored,
			isFeatured: post.isFeatured,
			topic: post.topic ? { id: post.topic.id, name: post.topic.name, slug: post.topic.slug } : null,
			author: post.author
				? {
						id: post.author.id,
						fullName: post.author.fullName,
						username: post.author.username,
						avatarUrl: post.author.avatarUrl,
						website: post.author.website,
						tagLine: post.author.tagLine
					}
				: null,
			likeCount: post.likeCount ?? null
		};
	}

	private toBlogPostPublicVm(post: BlogPostProgrammerModel): BlogPostPublicViewModel {
		return {
			id: post.id,
			title: post.title,
			slug: post.slug,
			description: post.description,
			heroImageFilename: post.heroImageFilename,
			readingTimeMinutes: post.readingTimeMinutes,
			createdAt: post.createdAt,
			isSponsored: post.isSponsored,
			isFeatured: post.isFeatured
		};
	}

	private toBlogTopicPublicVm(topic: BlogTopicProgrammerModel): BlogTopicPublicViewModel {
		return {
			id: topic.id,
			name: topic.name
		};
	}

	private toBlogAuthorPublicVm(author: PublishedBlogAuthorProgrammerModel): BlogAuthorPublicViewModel {
		return {
			id: author.id,
			fullName: author.fullName,
			username: author.username,
			avatarUrl: author.avatarUrl,
			website: author.website,
			tagLine: author.tagLine,
			postCount: author.postCount
		};
	}

	private toBlogTopicOverviewPublicVm(topic: ActiveBlogTopicProgrammerModel): BlogTopicOverviewPublicViewModel {
		return {
			id: topic.id,
			name: topic.name,
			slug: topic.slug,
			description: topic.description,
			postCount: topic.postCount
		};
	}

	private toAdminBlogCommentVm(pm: AdminBlogCommentProgrammerModel): AdminBlogCommentVm {
		return {
			id: pm.id,
			content: pm.content,
			isApproved: pm.isApproved,
			createdAt: pm.createdAt,
			updatedAt: pm.updatedAt,
			parentId: pm.parentId,
			userId: pm.userId,
			postId: pm.postId,
			author: pm.author ? { ...pm.author } : null,
			blogPost: pm.blogPost ? { ...pm.blogPost } : null
		};
	}

	private toAdminBlogActivityVm(pm: AdminBlogActivityProgrammerModel): AdminBlogActivityVm {
		return {
			id: pm.id,
			activityType: pm.activityType,
			createdAt: pm.createdAt,
			userId: pm.userId,
			postId: pm.postId,
			author: pm.author ? { ...pm.author } : null,
			blogPost: pm.blogPost ? { ...pm.blogPost } : null
		};
	}

	private toBlogPostVm(post: BlogPostProgrammerModel): BlogPostViewModel {
		return {
			id: post.id,
			title: post.title,
			description: post.description,
			slug: post.slug,
			topicName: post.topic?.name ?? null,
			isSponsored: post.isSponsored,
			isFeatured: post.isFeatured,
			isAdminApproved: post.isAdminApproved,
			isUserPublished: post.isUserPublished,
			heroImageFilename: post.heroImageFilename,
			content: post.content,
			createdAt: post.createdAt
		};
	}
}
