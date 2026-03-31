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

/** View model for admin activities manager UI (presenter + table); not a wire DTO. */
export interface AdminBlogActivityVm {
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
