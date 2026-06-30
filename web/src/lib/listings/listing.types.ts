import { z } from 'zod';

import { LISTING_SCHEMA_TYPES } from '$lib/listings/constants/listingSchemaTypes';

const extensionTypeSchema = z.enum(['skills', 'mcp', 'both'], {
	message: 'Extension type is required.'
});
const listingSchemaTypeSchema = z.enum(LISTING_SCHEMA_TYPES, {
	message: 'Schema type is required.'
});
const mcpToolSchema = z.object({
	name: z.string().min(1),
	description: z.string()
});
const skillCommandSchema = z.object({
	name: z.string().min(1),
	description: z.string(),
	kind: z.enum(['cli', 'mcp']).optional(),
	command_template: z.string().optional(),
	example_prompt: z.string().optional(),
	example_payload: z.record(z.unknown()).optional()
});
const stackBlueprintWorkflowStepSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('command'),
		listing_slug: z.string().optional(),
		command_name: z.string().optional(),
		prompt: z.string().optional(),
		example_payload: z.record(z.unknown()).optional()
	}),
	z.object({
		type: z.literal('text'),
		content: z.string().optional()
	})
]);
const stackBlueprintReferenceAssetSchema = z.object({
	type: z.enum(['image', 'json']),
	label: z.string().min(1),
	payload: z.string().optional(),
	data_url: z.string().optional()
});
const stackBlueprintSchema = z.object({
	workflow_steps: z.array(stackBlueprintWorkflowStepSchema).default([]),
	reference_assets: z.array(stackBlueprintReferenceAssetSchema).default([]),
	generated_markdown: z.string().optional()
});
export type SkillCommandProgrammerModel = z.infer<typeof skillCommandSchema>;
export type StackBlueprintProgrammerModel = z.infer<typeof stackBlueprintSchema>;
export type StackBlueprintWorkflowStepProgrammerModel =
	StackBlueprintProgrammerModel['workflow_steps'][number];
const mcpTransportSchema = z.enum(['stdio', 'sse', 'http']);
export const listingFaqItemSchema = z.object({
	question: z.string().min(1, 'Question is required'),
	answer: z.string().min(1, 'Answer is required')
});
export type ListingFaqItemProgrammerModel = z.infer<typeof listingFaqItemSchema>;

const clickUrlFieldSchema = z
	.string()
	.optional()
	.nullable()
	.refine(
		(value) => {
			if (value === '' || value == null) return true;
			try {
				new URL(value);
				return true;
			} catch {
				return false;
			}
		},
		{ message: 'Click URL must be a valid URL' }
	);

const listingIdFieldSchema = z
	.union([z.string().uuid('Invalid listing id'), z.literal('')])
	.optional();

const listingCategoryIdFieldSchema = z.string().superRefine((value, ctx) => {
	if (!value.trim()) {
		ctx.addIssue({ code: 'custom', message: 'Category is missing.' });
		return;
	}
	if (!z.string().uuid().safeParse(value).success) {
		ctx.addIssue({ code: 'custom', message: 'Invalid category id' });
	}
});

const listingSharedFields = {
	id: listingIdFieldSchema,
	title: z.string().min(2, 'Title must be at least 2 characters'),
	excerpt: z.string().max(160, 'Excerpt must be at most 160 characters').optional().nullable(),
	click_url: clickUrlFieldSchema,
	click_url_skills: clickUrlFieldSchema,
	click_url_mcp: clickUrlFieldSchema,
	description: z.string().max(10000).optional().nullable(),
	description_skills: z.string().max(10000).optional().nullable(),
	description_mcp: z.string().max(10000).optional().nullable(),
	content: z.string().optional().nullable(),
	content_skills: z.string().optional().nullable(),
	content_mcp: z.string().optional().nullable(),
	install_command_skills: z.string().optional().nullable(),
	install_command_mcp: z.string().optional().nullable(),
	is_official: z.boolean().default(false),
	source_repo_url: z.string().url().optional().nullable().or(z.literal('')),
	skill_source_url: z.string().url().optional().nullable().or(z.literal('')),
	skill_name: z.string().optional().nullable(),
	skill_metadata: z.record(z.unknown()).optional().nullable(),
	source_synced_at: z.string().datetime().optional().nullable(),
	source_content_hash: z.string().optional().nullable(),
	license: z.string().optional().nullable(),
	version: z.string().optional().nullable(),
	mcp_tools: z.array(mcpToolSchema).optional().nullable(),
	skill_commands: z.array(skillCommandSchema).optional().nullable(),
	stack_blueprint: stackBlueprintSchema.optional().nullable(),
	mcp_transport: mcpTransportSchema.optional().nullable(),
	mcp_server_config: z.record(z.unknown()).optional().nullable(),
	listing_category_id: listingCategoryIdFieldSchema,
	tag_ids: z.array(z.string().uuid('Invalid tag id')).default([]),
	listing_image_urls: z.array(z.string()).optional().nullable(),
	default_image_url: z.string().optional().nullable(),
	logo_image_url: z.string().optional().nullable(),
	is_user_published: z.boolean().default(false),
	is_admin_published: z.boolean().optional().nullable(),
	schema_type: listingSchemaTypeSchema,
	schema_json: z.record(z.unknown()).optional().nullable(),
	faq: z.array(listingFaqItemSchema).default([])
};

/** Form schema for create/update extension listings (aligned with backend listingCreateSchema). */
export const listingExtensionFormSchema = z.object({
	...listingSharedFields,
	listing_kind: z.literal('extension').default('extension'),
	extension_type: extensionTypeSchema
});

export type ListingExtensionFormSchemaType = z.infer<typeof listingExtensionFormSchema>;

const stackMemberRoleSchema = z.enum(['skills', 'mcp']);

export const stackMemberFormSchema = z.object({
	member_listing_id: z.string().uuid('Invalid member listing id'),
	member_role: stackMemberRoleSchema,
	sort_order: z.number().int().min(0).default(0)
});

export type StackMemberFormSchemaType = z.infer<typeof stackMemberFormSchema>;

/** Form schema for create/update stack listings (no extension_type). */
export const listingStackFormSchema = z.object({
	...listingSharedFields,
	listing_kind: z.literal('stack').default('stack'),
	stack_members: z.array(stackMemberFormSchema).default([])
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
	slug?: string;
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
	/** Selected listing tag slugs (OR match). */
	tags?: string[];
	/** Active tag-group slug (matches any tag in the group). */
	tagGroup?: string;
}

/** Chip for a single tag on the extensions hub filter bar. */
export interface ExtensionTagFilterChip {
	slug: string;
	label: string;
	count: number;
	color?: string | null;
	groupSlugs: string[];
}

/** Chip for a tag group on the extensions hub filter bar. */
export interface ExtensionTagGroupFilterChip {
	slug: string;
	label: string;
	count: number;
	tagSlugs: string[];
}

/** View model for extensions hub tag / tag-group filters. */
export interface ExtensionsTagFilterViewModel {
	groups: ExtensionTagGroupFilterChip[];
	tags: ExtensionTagFilterChip[];
	totalCount: number;
}

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
