import { z } from 'zod';

/** Form schema for create/update blog post (aligned with backend blogPostCreateSchema / blogPostUpdateSchema). */
export const blogPostFormSchema = z.object({
	id: z.string().uuid().optional(),
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	content: z.string().min(1, 'Content is required'),
	topic_id: z.string().min(1, 'Topic is required').uuid('Invalid topic id'),
	hero_image_filename: z.string().optional(),
	is_sponsored: z.boolean().default(false),
	is_featured: z.boolean().default(false),
	is_user_published: z.boolean().default(false),
	is_admin_approved: z.boolean().default(false)
});

export type BlogPostFormSchemaType = z.infer<typeof blogPostFormSchema>;

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

/** Choice for topic select: value + label (with hierarchy path). */
export interface TopicChoice {
	value: string;
	label: string;
}

/** Form schema for create/update blog topics (aligned with backend blogTopicCreateSchema/blogTopicUpdateSchema). */
export const blogTopicFormSchema = z.object({
	id: z.string().uuid('Invalid topic id').optional(),
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	parent_id: z.string().uuid('Invalid parent topic id').optional()
});

export type BlogTopicFormSchemaType = z.infer<typeof blogTopicFormSchema>;

/** `topic` query on public blog listing (`?topic=<uuid>`); invalid values are ignored server-side. */
export const blogPublicTopicIdParamSchema = z.string().uuid();

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

/** View model for admin comments manager UI (presenter + table); not a wire DTO. */
export interface AdminBlogCommentVm {
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

/** View model for admin activities manager UI (presenter + table); not a wire DTO. */
export interface AdminBlogActivityVm {
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
