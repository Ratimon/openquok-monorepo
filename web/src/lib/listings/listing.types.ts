import { z } from 'zod';

const extensionTypeSchema = z.enum(['skills', 'mcp', 'both']);
const faqItemSchema = z.object({
	question: z.string(),
	answer: z.string()
});

const listingSharedFields = {
	id: z.string().uuid('Invalid listing id').optional(),
	title: z.string().min(2, 'Title must be at least 2 characters'),
	excerpt: z.string().max(160, 'Excerpt must be at most 160 characters').optional().nullable(),
	description: z.string().max(10000).optional().nullable(),
	content: z.string().optional().nullable(),
	install_command_skills: z.string().optional().nullable(),
	install_command_mcp: z.string().optional().nullable(),
	is_official: z.boolean().default(false),
	source_repo_url: z.string().url().optional().nullable().or(z.literal('')),
	listing_category_id: z.string().uuid('Invalid category id').optional().nullable(),
	tag_ids: z.array(z.string().uuid('Invalid tag id')).default([]),
	listing_image_urls: z.array(z.string()).optional().nullable(),
	default_image_url: z.string().optional().nullable(),
	logo_image_url: z.string().optional().nullable(),
	is_user_published: z.boolean().default(false),
	is_admin_published: z.boolean().optional().nullable(),
	schema_type: z.string().optional().nullable(),
	schema_json: z.record(z.unknown()).optional().nullable(),
	faq: z.array(faqItemSchema).optional().nullable()
};

/** Form schema for create/update extension listings (aligned with backend listingCreateSchema). */
export const listingExtensionFormSchema = z.object({
	...listingSharedFields,
	listing_kind: z.literal('extension').default('extension'),
	extension_type: extensionTypeSchema.optional().nullable()
});

export type ListingExtensionFormSchemaType = z.infer<typeof listingExtensionFormSchema>;

/** Form schema for create/update stack listings (no extension_type). */
export const listingStackFormSchema = z.object({
	...listingSharedFields,
	listing_kind: z.literal('stack').default('stack')
});

export type ListingStackFormSchemaType = z.infer<typeof listingStackFormSchema>;

/** Unified listing form schema (extension or stack). */
export const listingFormSchema = z.union([listingExtensionFormSchema, listingStackFormSchema]);

export type ListingFormSchemaType = z.infer<typeof listingFormSchema>;

/** Form schema for create/update listing categories (aligned with backend listingCategoryCreateSchema). */
export const listingCategoryFormSchema = z.object({
	id: z.string().uuid('Invalid category id').optional(),
	name: z.string().min(1, 'Name is required'),
	slug: z.string().optional(),
	headline: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	image_url_hero: z.string().optional().nullable(),
	image_url_small: z.string().optional().nullable(),
	href: z.string().optional().nullable(),
	color: z.string().optional().nullable(),
	emoji: z.string().optional().nullable(),
	parent_id: z.string().uuid('Invalid parent category id').optional().nullable(),
	parent_path: z.string().default('/')
});

export type ListingCategoryFormSchemaType = z.infer<typeof listingCategoryFormSchema>;

/** Form schema for create/update listing tags (aligned with backend listingTagCreateSchema). */
export const listingTagFormSchema = z.object({
	id: z.string().uuid('Invalid tag id').optional(),
	name: z.string().min(1, 'Name is required'),
	slug: z.string().optional(),
	headline: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	image_url_hero: z.string().optional().nullable(),
	image_url_small: z.string().optional().nullable(),
	href: z.string().optional().nullable(),
	color: z.string().optional().nullable(),
	emoji: z.string().optional().nullable()
});

export type ListingTagFormSchemaType = z.infer<typeof listingTagFormSchema>;

/** Choice for category select: value + label (with hierarchy path). */
export interface CategoryChoice {
	value: string;
	label: string;
}

/** Choice for tags multi-select. */
export interface TagChoice {
	value: string;
	label: string;
	slug: string;
}

/** Client-side filters for the public extensions hub. */
export type ExtensionTypeFilter = 'all' | 'skills' | 'mcp' | 'both' | 'official';

export type ExtensionSort = 'newest' | 'oldest' | 'popular' | 'views';

export interface ExtensionsHubFilters {
	type: ExtensionTypeFilter;
	sort: ExtensionSort;
	search?: string;
	category?: string;
}

/** View model for admin comments manager UI (presenter + table); not a wire DTO. */
export interface AdminListingCommentVm {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	listingId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	listing: { id: string; title: string; slug: string } | null;
}

/** View model for admin activities manager UI (presenter + table); not a wire DTO. */
export interface AdminListingActivityVm {
	id: string;
	activityType: string;
	createdAt: string;
	userId: string | null;
	listingId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	listing: { id: string; title: string; slug: string } | null;
}
