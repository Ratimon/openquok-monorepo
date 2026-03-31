import { HttpGateway, HttpMethod } from '$lib/core/HttpGateway';
import type {
	BlogPostFormSchemaType,
	BlogTopicFormSchemaType,
} from '$lib/blog/blog.types';
import { CONFIG_SCHEMA_BLOG } from '$lib/blog/constants/config';

/** API response shape for a single blog post (camelCase from backend BlogDTOMapper). */
export interface BlogPostDto {
	id: string;
	userId: string;
	title: string;
	description: string | null;
	slug: string;
	isSponsored: boolean;
	isFeatured: boolean;
	isAdminApproved: boolean;
	isUserPublished: boolean;
	heroImageFilename: string | null;
	readingTimeMinutes: number | null;
	createdAt: string;
	publishedAt: string | null;
	topicId: string;
	content: string | null;
	viewCount: number | null;
	likeCount: number | null;
	updatedAt: string | null;
	topic: { id: string; name: string; slug: string } | null;
	author: {
		id: string;
		fullName: string | null;
		username: string | null;
		avatarUrl: string | null;
		website: string | null;
		tagLine: string | null;
	} | null;
}

/** API response shape for a blog topic (from GET /topics). */
export interface BlogTopicDto {
	id: string;
	name: string;
	slug: string;
	description?: string | null;
	parent_id?: string | null;
	parent?: { id: string; name: string; slug: string } | null;
}

/** Published authors list item (GET /authors; camelCase). */
export interface PublishedBlogAuthorDto {
	id: string;
	fullName: string | null;
	username: string | null;
	avatarUrl: string | null;
	website: string | null;
	tagLine: string | null;
	postCount: number;
}

/** Active topics with post counts (from GET /topics/active; camelCase). */
export interface ActiveBlogTopicDto {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	parentId: string | null;
	postCount: number;
}

/**
 * Wire/API shape for GET /posts/:postId/comments (BlogCommentDTO).
 * Map to `BlogPostCommentProgrammerModel` in `BlogRepository` — do not use in UI layers.
 */
export interface BlogPostCommentDto {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
}

/** Admin blog comment row (GET /admin/comments); aligned with backend AdminBlogCommentDTO. */
export interface AdminBlogCommentDto {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	postId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	blogPost: { id: string; title: string; slug: string } | null;
}

/** Allowed activity types for blog_activities (aligned with backend). */
export type BlogActivityTypeDto = 'view' | 'like' | 'share' | 'comment';

/** Admin blog activity row — API wire shape (GET /admin/activities); aligned with backend AdminBlogActivityDTO. */
export interface AdminBlogActivityDto {
	id: string;
	activityType: BlogActivityTypeDto | string;
	createdAt: string;
	userId: string | null;
	postId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	blogPost: { id: string; title: string; slug: string } | null;
}

export interface BlogConfig {
	endpoints: {
		getPostById: (id: string) => string;
		getAdminPosts: string;
		getAdminComments: string;
		getAdminActivities: string;
		getTopics: string;
		getActiveTopics: string;
		getPublishedAuthors: string;
		getPublishedPosts: string;
		getBlogInformation: string;
		createPost: string;
		updatePost: (id: string) => string;
		deletePost: (id: string) => string;
		createTopic: string;
		updateTopic: (id: string) => string;
		deleteTopic: (id: string) => string;
		approveComment: (id: string) => string;
		deleteComment: (id: string) => string;
		getPostComments: (postId: string) => string;
		trackActivity: (postId: string) => string;
		createComment: string;
	};
}

export interface GetBlogPostResponseDto {
	success: boolean;
	data: BlogPostDto;
	message: string;
}

export interface GetBlogTopicsResponseDto {
	success: boolean;
	data: BlogTopicDto[];
	message: string;
}

export interface GetActiveBlogTopicsResponseDto {
	success: boolean;
	data: ActiveBlogTopicDto[];
	message: string;
}

export interface GetAdminBlogPostsResponseDto {
	success: boolean;
	data: {
		postsResult: BlogPostDto[];
		countResult: number;
	};
	message: string;
}

export interface GetAdminBlogCommentsResponseDto {
	success: boolean;
	data: {
		commentsResult: AdminBlogCommentDto[];
		countResult: number;
	};
	message: string;
}

export interface GetAdminBlogActivitiesResponseDto {
	success: boolean;
	data: {
		activitiesResult: AdminBlogActivityDto[];
		countResult: number;
	};
	message: string;
}

export interface ApproveBlogCommentResponseDto {
	success: boolean;
	data?: { id: string };
	message: string;
}

export interface DeleteBlogCommentResponseDto {
	success: boolean;
	message: string;
}

export interface GetPublishedBlogPostsResponseDto {
	success: boolean;
	data: {
		postsResult: BlogPostDto[];
		countResult: number;
	};
	message: string;
}

export interface GetPublishedBlogAuthorsResponseDto {
	success: boolean;
	data: PublishedBlogAuthorDto[];
	message: string;
}

export interface GetPostCommentsResponseDto {
	success: boolean;
	data: BlogPostCommentDto[];
	message: string;
}

export interface TrackBlogActivityResponseDto {
	success: boolean;
	data?: { success: boolean };
	message: string;
}

export interface CreateBlogCommentResponseDto {
	success: boolean;
	data?: { id: string };
	message: string;
}

export interface UpsertBlogPostResponseDto {
	success: boolean;
	data: { id: string };
	message: string;
}

export interface UpsertBlogTopicResponseDto {
	success: boolean;
	data: { id: string };
	message: string;
}

export interface DeleteBlogTopicResponseDto {
	success: boolean;
	message: string;
}

export interface DeleteBlogPostResponseDto {
	success: boolean;
	message: string;
}

export interface BlogUpsertProgrammerModel {
	success: boolean;
	message: string;
	id?: string;
}

export interface BlogInformationProgrammerModel {
	[key: string]: string;
}

export interface GetBlogInformationResponseDto {
	success: boolean;
	data: BlogInformationProgrammerModel;
	message: string;
}

export interface BlogTopicProgrammerModel {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	parentId: string | null;
	parent: { id: string; name: string; slug: string } | null;
}

/** Published blog author row; from GET /authors. */
export interface PublishedBlogAuthorProgrammerModel {
	id: string;
	fullName: string | null;
	username: string | null;
	avatarUrl: string | null;
	website: string | null;
	tagLine: string | null;
	postCount: number;
}

/** Active topics (≥1 published post) with counts; from GET /topics/active. */
export interface ActiveBlogTopicProgrammerModel {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	parentId: string | null;
	postCount: number;
}

export interface BlogPostProgrammerModel {
	id: string;
	userId: string;
	title: string;
	description: string | null;
	slug: string;
	isSponsored: boolean;
	isFeatured: boolean;
	isAdminApproved: boolean;
	isUserPublished: boolean;
	heroImageFilename: string | null;
	readingTimeMinutes: number | null;
	createdAt: string;
	publishedAt: string | null;
	topicId: string;
	content: string | null;
	viewCount: number | null;
	likeCount: number | null;
	updatedAt: string | null;
	topic: { id: string; name: string; slug: string } | null;
	author: {
		id: string;
		fullName: string | null;
		username: string | null;
		avatarUrl: string | null;
		website: string | null;
		tagLine: string | null;
	} | null;
}

/** Public post comment (approved list); mapped from API BlogCommentDTO in the repository. */
export interface BlogPostCommentProgrammerModel {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
}

/** Admin comment list row; mapped from `AdminBlogCommentDto` inside the repository. */
export interface AdminBlogCommentProgrammerModel {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	postId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	blogPost: { id: string; title: string; slug: string } | null;
}

/** Admin activity list row; mapped from `AdminBlogActivityDto` inside the repository. */
export interface AdminBlogActivityProgrammerModel {
	id: string;
	activityType: string;
	createdAt: string;
	userId: string | null;
	postId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	blogPost: { id: string; title: string; slug: string } | null;
}

export class BlogRepository {
	constructor(
		private readonly httpGateway: HttpGateway,
		private readonly config: BlogConfig
	) {}

	async getAdminBlogPosts(fetch?: typeof globalThis.fetch): Promise<BlogPostProgrammerModel[]> {
		const { data: dto, ok } = await this.httpGateway.get<GetAdminBlogPostsResponseDto>(
			this.config.endpoints.getAdminPosts,
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && dto?.success && Array.isArray(dto.data?.postsResult)) {
			return dto.data.postsResult.map((postDto) => this.toBlogPostPm(postDto));
		}
		return [];
	}

	/**
	 * Admin list of all comments (editor+). Server caps `limit` (e.g. max 100); optional `searchTerm` filters content server-side.
	 */
	async getAdminBlogComments(
		params?: { limit?: number; searchTerm?: string | null },
		fetch?: typeof globalThis.fetch
	): Promise<AdminBlogCommentProgrammerModel[]> {
		const query: Record<string, string | number> = {
			limit: params?.limit ?? 100
		};
		const term = params?.searchTerm?.trim();
		if (term) query.searchTerm = term;

		const { data: dto, ok } = await this.httpGateway.get<GetAdminBlogCommentsResponseDto>(
			this.config.endpoints.getAdminComments,
			query,
			{ withCredentials: true, fetch }
		);
		if (ok && dto?.success && Array.isArray(dto.data?.commentsResult)) {
			return dto.data.commentsResult.map((row) => this.toAdminBlogCommentPm(row));
		}
		return [];
	}

	/**
	 * Admin list of all activities (editor+). Server caps `limit` (e.g. max 100).
	 */
	async getAdminBlogActivities(
		params?: { limit?: number },
		fetch?: typeof globalThis.fetch
	): Promise<AdminBlogActivityProgrammerModel[]> {
		const query: Record<string, string | number> = {
			limit: params?.limit ?? 100
		};

		const { data: dto, ok } = await this.httpGateway.get<GetAdminBlogActivitiesResponseDto>(
			this.config.endpoints.getAdminActivities,
			query,
			{ withCredentials: true, fetch }
		);
		if (ok && dto?.success && Array.isArray(dto.data?.activitiesResult)) {
			return dto.data.activitiesResult.map((row) => this.toAdminBlogActivityPm(row));
		}
		return [];
	}

	async approveBlogComment(commentId: string, fetch?: typeof globalThis.fetch): Promise<BlogUpsertProgrammerModel> {
		try {
			const { data: dto, ok } = await this.httpGateway.request<ApproveBlogCommentResponseDto>({
				method: HttpMethod.PATCH,
				url: this.config.endpoints.approveComment(commentId),
				withCredentials: true,
				fetch
			});
			if (ok && dto?.success) {
				return { success: true, message: dto.message ?? 'Comment approved.', id: dto.data?.id ?? commentId };
			}
			return { success: false, message: dto?.message ?? 'Failed to approve comment.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	async deleteBlogComment(commentId: string, fetch?: typeof globalThis.fetch): Promise<BlogUpsertProgrammerModel> {
		try {
			const { data: dto, ok } = await this.httpGateway.delete<DeleteBlogCommentResponseDto>(
				this.config.endpoints.deleteComment(commentId),
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success) {
				return { success: true, message: dto.message ?? 'Comment deleted.' };
			}
			return { success: false, message: dto?.message ?? 'Failed to delete comment.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	async getBlogPostById(
		id: string,
		fetch?: typeof globalThis.fetch
	): Promise<BlogPostProgrammerModel | null> {
		const { data: dto, ok } = await this.httpGateway.get<GetBlogPostResponseDto>(
			this.config.endpoints.getPostById(id),
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && dto?.success && dto.data) return this.toBlogPostPm(dto.data);
		return null;
	}

	/**
	 * Public blog post by slug/identifier (no auth required).
	 * Backend route supports identifier being either UUID or slug; this method forces unauthenticated access.
	 */
	async getPublishedBlogPostBySlug(
		identifier: string,
		fetch?: typeof globalThis.fetch
	): Promise<BlogPostProgrammerModel | null> {
		const { data: dto, ok } = await this.httpGateway.get<GetBlogPostResponseDto>(
			this.config.endpoints.getPostById(identifier),
			undefined,
			{ withCredentials: false, fetch }
		);
		if (ok && dto?.success && dto.data) return this.toBlogPostPm(dto.data);
		return null;
	}

	async getBlogTopics(fetch?: typeof globalThis.fetch): Promise<BlogTopicProgrammerModel[]> {
		const { data: dto, ok } = await this.httpGateway.get<GetBlogTopicsResponseDto>(
			this.config.endpoints.getTopics,
			undefined,
			{ withCredentials: true, fetch }
		);
		if (ok && dto?.success && Array.isArray(dto.data)) {
			return dto.data.map((topicDto) => this.toBlogTopicPm(topicDto));
		}
		return [];
	}

	/**
	 * Create or update a blog topic.
	 * If `payload.id` is present, performs PUT /topics/:id, otherwise performs POST /topics.
	 */
	async upsertBlogTopic(
		payload: BlogTopicFormSchemaType,
		fetch?: typeof globalThis.fetch
	): Promise<BlogUpsertProgrammerModel> {
		const id = payload.id?.trim();
		const isUpdate = Boolean(id);
		try {
			if (isUpdate && id) {
				const { data: dto, ok } = await this.httpGateway.put<UpsertBlogTopicResponseDto>(
					this.config.endpoints.updateTopic(id),
					payload,
					{ withCredentials: true, fetch }
				);
				if (ok && dto?.success) {
					return {
						success: true,
						message: dto.message ?? 'Blog topic updated.',
						id: dto.data?.id ?? id
					};
				}
				return { success: false, message: dto?.message ?? 'Failed to update blog topic.' };
			}

			const { data: dto, ok } = await this.httpGateway.post<UpsertBlogTopicResponseDto>(
				this.config.endpoints.createTopic,
				payload,
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success && dto.data?.id) {
				return { success: true, message: dto.message ?? 'Blog topic created.', id: dto.data.id };
			}
			return { success: false, message: dto?.message ?? 'Failed to create blog topic.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	async deleteBlogTopic(topicId: string, fetch?: typeof globalThis.fetch): Promise<BlogUpsertProgrammerModel> {
		try {
			const { data: dto, ok } = await this.httpGateway.delete<DeleteBlogTopicResponseDto>(
				this.config.endpoints.deleteTopic(topicId),
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success) {
				return { success: true, message: dto.message ?? 'Blog topic deleted.' };
			}
			return { success: false, message: dto?.message ?? 'Failed to delete blog topic.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	async deleteBlogPost(postId: string, fetch?: typeof globalThis.fetch): Promise<BlogUpsertProgrammerModel> {
		try {
			const { data: dto, ok } = await this.httpGateway.delete<DeleteBlogPostResponseDto>(
				this.config.endpoints.deletePost(postId),
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success) {
				return { success: true, message: dto.message ?? 'Blog post deleted.' };
			}
			return { success: false, message: dto?.message ?? 'Failed to delete blog post.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	/** Public blog listing (no auth). */
	async getPublishedBlogPosts(
		{
			limit,
			skip,
			topicId,
			skipId,
			authorId,
			fetch: customFetch
		}: {
			limit: number;
			skip: number;
			topicId?: string | null;
			skipId?: string | null;
			authorId?: string | null;
			fetch?: typeof globalThis.fetch;
		}
	): Promise<{ posts: BlogPostProgrammerModel[]; count: number }> {
		const params: Record<string, string | number> = { limit, skip };
		if (topicId && topicId !== 'all') {
			params.topicId = topicId;
		}
		if (skipId) {
			params.skipId = skipId;
		}
		if (authorId?.trim()) {
			params.authorId = authorId.trim();
		}
		const { data: dto, ok } = await this.httpGateway.get<GetPublishedBlogPostsResponseDto>(
			this.config.endpoints.getPublishedPosts,
			params,
			{ withCredentials: false, fetch: customFetch }
		);
		if (ok && dto?.success && dto.data && Array.isArray(dto.data.postsResult)) {
			return {
				posts: dto.data.postsResult.map((p) => this.toBlogPostPm(p)),
				count: dto.data.countResult ?? 0
			};
		}
		return { posts: [], count: 0 };
	}

	/** Public topic list for filters (no auth). */
	async getBlogTopicsPublic(fetch?: typeof globalThis.fetch): Promise<BlogTopicProgrammerModel[]> {
		const { data: dto, ok } = await this.httpGateway.get<GetBlogTopicsResponseDto>(
			this.config.endpoints.getTopics,
			undefined,
			{ withCredentials: false, fetch }
		);
		if (ok && dto?.success && Array.isArray(dto.data)) {
			return dto.data.map((topicDto) => this.toBlogTopicPm(topicDto));
		}
		return [];
	}

	/** Public list of authors with at least one published post (no auth). */
	async getPublishedBlogAuthors(fetch?: typeof globalThis.fetch): Promise<PublishedBlogAuthorProgrammerModel[]> {
		const { data: dto, ok } = await this.httpGateway.get<GetPublishedBlogAuthorsResponseDto>(
			this.config.endpoints.getPublishedAuthors,
			undefined,
			{ withCredentials: false, fetch }
		);
		if (ok && dto?.success && Array.isArray(dto.data)) {
			return dto.data.map((row) => this.toPublishedBlogAuthorPm(row));
		}
		return [];
	}

	/** Public active topics with post counts (no auth). */
	async getActiveBlogTopicsPublic(fetch?: typeof globalThis.fetch): Promise<ActiveBlogTopicProgrammerModel[]> {
		const { data: dto, ok } = await this.httpGateway.get<GetActiveBlogTopicsResponseDto>(
			this.config.endpoints.getActiveTopics,
			undefined,
			{ withCredentials: false, fetch }
		);
		if (ok && dto?.success && Array.isArray(dto.data)) {
			return dto.data.map((row) => this.toActiveBlogTopicPm(row));
		}
		return [];
	}

	async getBlogInformation(fetch?: typeof globalThis.fetch): Promise<BlogInformationProgrammerModel> {
		const fallback: BlogInformationProgrammerModel = {
			BLOG_POST_SEO_META_TITLE: String(CONFIG_SCHEMA_BLOG.BLOG_POST_SEO_META_TITLE.default ?? 'Blog'),
			BLOG_POST_SEO_META_DESCRIPTION: String(
				CONFIG_SCHEMA_BLOG.BLOG_POST_SEO_META_DESCRIPTION.default ?? 'Here you can find all published blog posts.'
			),
			BLOG_POST_SEO_META_TAGS: String(
				CONFIG_SCHEMA_BLOG.BLOG_POST_SEO_META_TAGS.default ?? 'blog, articles, news, content'
			)
		};

		try {
			const { data: dto, ok } = await this.httpGateway.get<GetBlogInformationResponseDto>(
				this.config.endpoints.getBlogInformation,
				undefined,
				{ withCredentials: false, fetch }
			);

			if (ok && dto?.success && dto.data) return dto.data;
			return fallback;
		} catch {
			return fallback;
		}
	}

	/** Public: approved comments for a post (no auth). */
	async getPostComments(
		postId: string,
		fetch?: typeof globalThis.fetch
	): Promise<BlogPostCommentProgrammerModel[]> {
		const { data: dto, ok } = await this.httpGateway.get<GetPostCommentsResponseDto>(
			this.config.endpoints.getPostComments(postId),
			undefined,
			{ withCredentials: false, fetch }
		);
		if (ok && dto?.success && Array.isArray(dto.data)) {
			return dto.data.map((row) => this.toBlogPostCommentPm(row));
		}
		return [];
	}

	/**
	 * Record view / like / share / comment activity. Auth optional; include credentials when logged in.
	 */
	async trackBlogActivity(
		postId: string,
		activityType: 'view' | 'like' | 'share' | 'comment',
		fetch?: typeof globalThis.fetch
	): Promise<BlogUpsertProgrammerModel> {
		try {
			const { data: dto, ok } = await this.httpGateway.put<TrackBlogActivityResponseDto>(
				this.config.endpoints.trackActivity(postId),
				{ activity_type: activityType },
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success) {
				return { success: true, message: dto.message ?? 'Activity recorded.' };
			}
			return { success: false, message: dto?.message ?? 'Failed to record activity.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	/** Create a comment (requires auth). */
	async createBlogComment(
		params: { postId: string; content: string; parentId?: string | null },
		fetch?: typeof globalThis.fetch
	): Promise<BlogUpsertProgrammerModel> {
		try {
			const body: Record<string, string> = {
				post_id: params.postId,
				content: params.content
			};
			const parent = params.parentId?.trim();
			if (parent) body.parent_id = parent;

			const { data: dto, ok } = await this.httpGateway.post<CreateBlogCommentResponseDto>(
				this.config.endpoints.createComment,
				body,
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success && dto.data?.id) {
				return { success: true, message: dto.message ?? 'Comment submitted.', id: dto.data.id };
			}
			return { success: false, message: dto?.message ?? 'Failed to submit comment.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	async createBlogPost(
		payload: BlogPostFormSchemaType,
		fetch?: typeof globalThis.fetch
	): Promise<BlogUpsertProgrammerModel> {
		try {
			const { data: dto, ok } = await this.httpGateway.post<UpsertBlogPostResponseDto>(
				this.config.endpoints.createPost,
				payload,
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success && dto.data?.id) {
				return { success: true, message: dto.message ?? 'Blog post created.', id: dto.data.id };
			}
			return { success: false, message: dto?.message ?? 'Failed to create blog post.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	async updateBlogPost(
		id: string,
		payload: BlogPostFormSchemaType,
		fetch?: typeof globalThis.fetch
	): Promise<BlogUpsertProgrammerModel> {
		try {
			const { data: dto, ok } = await this.httpGateway.put<UpsertBlogPostResponseDto>(
				this.config.endpoints.updatePost(id),
				payload,
				{ withCredentials: true, fetch }
			);
			if (ok && dto?.success) {
				return { success: true, message: dto.message ?? 'Blog post updated.', id: dto.data?.id ?? id };
			}
			return { success: false, message: dto?.message ?? 'Failed to update blog post.' };
		} catch (err) {
			const message = this.extractMessage(err);
			return { success: false, message };
		}
	}

	private extractMessage(err: unknown): string {
		if (err && typeof err === 'object' && 'data' in err) {
			const data = (err as { data?: unknown }).data;
			if (data && typeof data === 'object' && 'message' in data && typeof (data as { message?: string }).message === 'string') {
				return (data as { message: string }).message;
			}
		}
		if (err instanceof Error) return err.message;
		return 'An error occurred. Please try again.';
	}

	private toBlogPostCommentPm(row: BlogPostCommentDto): BlogPostCommentProgrammerModel {
		return {
			id: row.id,
			content: row.content,
			isApproved: row.isApproved,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			parentId: row.parentId,
			userId: row.userId,
			author: row.author
				? {
						id: row.author.id,
						fullName: row.author.fullName ?? null,
						avatarUrl: row.author.avatarUrl ?? null
					}
				: null
		};
	}

	private toAdminBlogCommentPm(row: AdminBlogCommentDto): AdminBlogCommentProgrammerModel {
		return {
			id: row.id,
			content: row.content,
			isApproved: row.isApproved,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			parentId: row.parentId,
			userId: row.userId,
			postId: row.postId,
			author: row.author
				? {
						id: row.author.id,
						fullName: row.author.fullName ?? null,
						avatarUrl: row.author.avatarUrl ?? null
					}
				: null,
			blogPost: row.blogPost ? { ...row.blogPost } : null
		};
	}

	private toAdminBlogActivityPm(row: AdminBlogActivityDto): AdminBlogActivityProgrammerModel {
		return {
			id: row.id,
			activityType: row.activityType,
			createdAt: row.createdAt,
			userId: row.userId,
			postId: row.postId,
			author: row.author
				? {
						id: row.author.id,
						fullName: row.author.fullName ?? null,
						avatarUrl: row.author.avatarUrl ?? null
					}
				: null,
			blogPost: row.blogPost ? { ...row.blogPost } : null
		};
	}

	private toBlogTopicPm(topicDto: BlogTopicDto): BlogTopicProgrammerModel {
		return {
			id: topicDto.id,
			name: topicDto.name,
			slug: topicDto.slug,
			description: topicDto.description ?? null,
			parentId: topicDto.parent_id ?? null,
			parent: topicDto.parent ? { ...topicDto.parent } : null
		};
	}

	private toPublishedBlogAuthorPm(dto: PublishedBlogAuthorDto): PublishedBlogAuthorProgrammerModel {
		return {
			id: dto.id,
			fullName: dto.fullName ?? null,
			username: dto.username ?? null,
			avatarUrl: dto.avatarUrl ?? null,
			website: dto.website ?? null,
			tagLine: dto.tagLine ?? null,
			postCount: dto.postCount ?? 0
		};
	}

	private toActiveBlogTopicPm(dto: ActiveBlogTopicDto): ActiveBlogTopicProgrammerModel {
		return {
			id: dto.id,
			name: dto.name,
			slug: dto.slug,
			description: dto.description ?? null,
			parentId: dto.parentId ?? null,
			postCount: dto.postCount ?? 0
		};
	}

	private toBlogPostPm(postDto: BlogPostDto): BlogPostProgrammerModel {
		return {
			id: postDto.id,
			userId: postDto.userId,
			title: postDto.title,
			description: postDto.description ?? null,
			slug: postDto.slug,
			isSponsored: postDto.isSponsored,
			isFeatured: postDto.isFeatured,
			isAdminApproved: postDto.isAdminApproved,
			isUserPublished: postDto.isUserPublished,
			heroImageFilename: postDto.heroImageFilename ?? null,
			readingTimeMinutes: postDto.readingTimeMinutes ?? null,
			createdAt: postDto.createdAt,
			publishedAt: postDto.publishedAt ?? null,
			topicId: postDto.topicId,
			content: postDto.content ?? null,
			viewCount: postDto.viewCount ?? null,
			likeCount: postDto.likeCount ?? null,
			updatedAt: postDto.updatedAt ?? null,
			topic: postDto.topic ? { ...postDto.topic } : null,
			author: postDto.author
				? {
						id: postDto.author.id,
						fullName: postDto.author.fullName ?? null,
						username: postDto.author.username ?? null,
						avatarUrl: postDto.author.avatarUrl ?? null,
						website: postDto.author.website ?? null,
						tagLine: postDto.author.tagLine ?? null
					}
				: null
		};
	}
}

// to do : refacto this

/**
 * Creates a path string for a topic, showing its position in the hierarchy.
 * Example: "Parent > Child > Grandchild"
 */
function createTopicPath(
	topic: BlogTopicDto | BlogTopicProgrammerModel,
	allTopics: (BlogTopicDto | BlogTopicProgrammerModel)[]
): string {
	const path: string[] = [topic.name];
	let current: BlogTopicDto | BlogTopicProgrammerModel | undefined = topic;

	const getParentId = (t: BlogTopicDto | BlogTopicProgrammerModel) =>
		'parentId' in t ? t.parentId : t.parent_id ?? null;

	while (current && getParentId(current)) {
		const parentId = getParentId(current);
		const parent = allTopics.find((t) => t.id === parentId);
		if (!parent) break;
		path.unshift(parent.name);
		current = parent;
	}

	return path.join(' > ');
}


/**
 * Creates a sorted list of topic choices for the topic dropdown.
 * Each topic's label includes its full path in the hierarchy.
 */
export function createSortedTopicChoices(
	topics: (BlogTopicDto | BlogTopicProgrammerModel)[]
): { value: string; label: string }[] {
	const choices = topics.map((topic) => ({
		value: topic.id,
		label: createTopicPath(topic, topics)
	}));
	return choices.sort((a, b) => a.label.localeCompare(b.label));
}
