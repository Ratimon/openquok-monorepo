import { z } from 'zod';

import type {
	LinkDirectoryApprovalMode,
	LinkDirectoryCostTier,
	LinkDirectoryCtaKind,
	LinkDirectoryDofollow,
	LinkDirectoryEffort
} from '$lib/link-directory/link-directory.types';

export type LinkDirectoryTagGroupDto = {
	id: string;
	name: string;
	sortOrder: number;
};

export type LinkDirectorySubmissionDto = {
	id: string;
	status: string;
	email: string;
	userId: string | null;
	siteUrl: string;
	proposedTitle: string | null;
	notes: string | null;
	payload: Record<string, unknown>;
	reviewedBy: string | null;
	reviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type LinkDirectoryUpsertResult = { ok: boolean; id?: string; error?: string };

export type AdminLinkDirectorySiteCommentVm = {
	id: string;
	content: string;
	isApproved: boolean;
	createdAt: string;
	updatedAt: string | null;
	parentId: string | null;
	userId: string;
	siteId: string;
	author: {
		id: string;
		fullName: string | null;
		avatarUrl: string | null;
	} | null;
	site: { id: string; title: string; slug: string } | null;
};

export const linkDirectoryCategoryFormSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(1, 'Name is required.').trim(),
	slug: z.string().max(200).optional(),
	headline: z.string().max(500).optional().nullable(),
	description: z.string().max(5000).optional().nullable(),
	sort_order: z.number().int().optional(),
	openquok_channels_hub_path: z.string().optional()
});

export type LinkDirectoryCategoryFormValues = z.infer<typeof linkDirectoryCategoryFormSchema>;

export const linkDirectoryTagGroupFormSchema = z.object({
	name: z.string().min(1, 'Name is required.').trim(),
	sort_order: z.number().int().optional()
});

export type LinkDirectoryTagGroupFormValues = z.infer<typeof linkDirectoryTagGroupFormSchema>;

export const linkDirectoryTagFormSchema = z.object({
	id: z.string().uuid().optional(),
	name: z.string().min(1, 'Name is required.').trim(),
	slug: z.string().max(200).optional(),
	headline: z.string().max(500).optional().nullable(),
	description: z.string().max(5000).optional().nullable(),
	tagGroupIds: z.array(z.string().uuid()).optional()
});

export type LinkDirectoryTagFormValues = z.infer<typeof linkDirectoryTagFormSchema>;

export const linkDirectorySiteFormSchema = z.object({
	id: z.string().uuid().optional(),
	slug: z.string().min(1, 'Slug is required.').max(200).trim(),
	title: z.string().min(1, 'Title is required.').trim(),
	site_url: z.string().url('Enter a valid site URL.').trim(),
	logo_url: z.string().url().optional().nullable().or(z.literal('')),
	short_description: z.string().max(2000).optional().nullable(),
	long_description: z.string().max(50000).optional().nullable(),
	domain_authority: z.number().int().min(0).max(100).optional().nullable(),
	domain_rating: z.number().int().min(0).max(100).optional().nullable(),
	monthly_visits: z.number().int().min(0).optional().nullable(),
	metrics_source: z.string().max(500).optional().nullable(),
	metrics_updated_at: z.string().datetime().optional(),
	category_id: z.string().uuid().optional().nullable().or(z.literal('')),
	is_openquok_auth_supported: z.boolean().optional(),
	openquok_channel_slug: z.string().max(200).optional().nullable(),
	is_admin_published: z.boolean().optional(),
	sort_order: z.number().int().optional(),
	tagIds: z.array(z.string().uuid()).optional()
});

export type LinkDirectorySiteFormValues = z.infer<typeof linkDirectorySiteFormSchema>;

const opportunityStepSchema = z.object({
	order: z.number().int().min(1),
	title: z.string().min(1),
	body: z.string().min(1)
});

const linkDirectoryOpportunityFormObjectSchema = z.object({
	id: z.string().uuid().optional(),
	slug: z.string().min(1, 'Slug is required.').max(200).trim(),
	title: z.string().min(1, 'Title is required.').trim(),
	opportunity_type_id: z.string().uuid('Select an opportunity type.'),
	effort: z.enum(['easy', 'medium', 'hard']).optional(),
	approval_mode: z.enum(['instant', 'manual_review']).optional(),
	approval_time_hint: z.string().max(500).optional().nullable(),
	dofollow: z.enum(['dofollow', 'nofollow', 'unknown']).optional(),
	cost_tier: z.enum(['free', 'freemium', 'paid']).optional(),
	cost_note: z.string().max(2000).optional().nullable(),
	description: z.string().max(10000).optional().nullable(),
	steps: z.array(opportunityStepSchema).optional(),
	openquok_cta_kind: z
		.enum(['none', 'connect_channel', 'schedule_post', 'use_plug', 'external_doc'])
		.optional(),
	openquok_channel_slug: z.string().max(200).optional().nullable(),
	openquok_plug_name: z.string().max(200).optional().nullable(),
	cta_href: z.string().max(2000).optional().nullable(),
	cta_label: z.string().max(200).optional().nullable(),
	sort_order: z.number().int().optional(),
	is_admin_published: z.boolean().optional()
});

export const linkDirectoryOpportunityFormSchema = linkDirectoryOpportunityFormObjectSchema.superRefine(
	(data, ctx) => {
		const kind = data.openquok_cta_kind ?? 'none';
		if (kind === 'connect_channel' || kind === 'schedule_post') {
			if (!data.openquok_channel_slug?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Select an OpenQuok channel for this CTA.',
					path: ['openquok_channel_slug']
				});
			}
		}
		if (kind === 'use_plug' && !data.openquok_plug_name?.trim()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Plug name is required for the use plug CTA.',
				path: ['openquok_plug_name']
			});
		}
		if (kind === 'external_doc') {
			if (!data.cta_href?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Setup guide URL is required for external doc CTA.',
					path: ['cta_href']
				});
			} else {
				const hrefResult = z.string().url().safeParse(data.cta_href.trim());
				if (!hrefResult.success) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Enter a valid setup guide URL.',
						path: ['cta_href']
					});
				}
			}
		}
	}
);

export type LinkDirectoryOpportunityFormValues = z.infer<typeof linkDirectoryOpportunityFormSchema>;

export type LinkDirectoryOpportunityApiPayload = {
	slug: string;
	title: string;
	opportunity_type_id: string;
	effort?: LinkDirectoryEffort;
	approval_mode?: LinkDirectoryApprovalMode;
	approval_time_hint?: string | null;
	dofollow?: LinkDirectoryDofollow;
	cost_tier?: LinkDirectoryCostTier;
	cost_note?: string | null;
	description?: string | null;
	steps?: Array<{ order: number; title: string; body: string }>;
	openquok_cta_kind?: LinkDirectoryCtaKind;
	openquok_channel_slug?: string | null;
	openquok_plug_name?: string | null;
	cta_href?: string | null;
	cta_label?: string | null;
	sort_order?: number;
	is_admin_published?: boolean;
	id?: string;
};
