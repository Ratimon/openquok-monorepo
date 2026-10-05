import { z } from "zod";

const effortSchema = z.enum(["easy", "medium", "hard"]);
const approvalModeSchema = z.enum(["instant", "manual_review"]);
const dofollowSchema = z.enum(["dofollow", "nofollow", "unknown"]);
const costTierSchema = z.enum(["free", "freemium", "paid"]);
const ctaKindSchema = z.enum([
    "none",
    "connect_channel",
    "schedule_post",
    "use_plug",
    "external_doc",
]);

const opportunityStepSchema = z.object({
    order: z.number().int().min(1),
    title: z.string().min(1),
    body: z.string().min(1),
});

export const linkDirectorySiteSlugParamSchema = z.object({
    siteSlug: z.string().min(1).max(200),
});

export const linkDirectorySiteIdParamSchema = z.object({
    siteId: z.string().uuid(),
});

export const linkDirectoryOpportunityIdParamSchema = z.object({
    opportunityId: z.string().uuid(),
});

export const linkDirectoryCategoryIdParamSchema = z.object({
    categoryId: z.string().uuid(),
});

export const linkDirectoryTagIdParamSchema = z.object({
    tagId: z.string().uuid(),
});

export const linkDirectoryTagGroupIdParamSchema = z.object({
    tagGroupId: z.string().uuid(),
});

export const linkDirectorySubmissionIdParamSchema = z.object({
    submissionId: z.string().uuid(),
});

const siteFields = {
    slug: z.string().min(1).max(200),
    title: z.string().min(1),
    site_url: z.string().url(),
    logo_url: z.string().url().optional().nullable(),
    short_description: z.string().optional().nullable(),
    long_description: z.string().optional().nullable(),
    domain_authority: z.number().int().min(0).max(100).optional().nullable(),
    domain_rating: z.number().int().min(0).max(100).optional().nullable(),
    monthly_visits: z.number().int().min(0).optional().nullable(),
    metrics_source: z.string().optional().nullable(),
    metrics_updated_at: z.string().datetime().optional().nullable(),
    category_id: z.string().uuid().optional().nullable(),
    is_openquok_auth_supported: z.boolean().optional(),
    openquok_channel_slug: z.string().optional().nullable(),
    is_admin_published: z.boolean().optional(),
    sort_order: z.number().int().optional(),
};

export const linkDirectorySiteCreateSchema = z.object(siteFields);
export type LinkDirectorySiteCreateSchemaType = z.infer<typeof linkDirectorySiteCreateSchema>;

export const linkDirectorySiteUpdateSchema = z.object({
    ...siteFields,
    id: z.string().uuid(),
});
export type LinkDirectorySiteUpdateSchemaType = z.infer<typeof linkDirectorySiteUpdateSchema>;

export const linkDirectorySiteBodySchema = z.object({
    siteData: linkDirectorySiteCreateSchema,
    tagIds: z.array(z.string().uuid()).optional(),
});

export const linkDirectorySiteUpdateBodySchema = z.object({
    siteData: linkDirectorySiteUpdateSchema,
    tagIds: z.array(z.string().uuid()).optional(),
});

const opportunityFields = {
    slug: z.string().min(1).max(200),
    title: z.string().min(1),
    opportunity_type_id: z.string().uuid(),
    effort: effortSchema.optional(),
    approval_mode: approvalModeSchema.optional(),
    approval_time_hint: z.string().optional().nullable(),
    dofollow: dofollowSchema.optional(),
    cost_tier: costTierSchema.optional(),
    cost_note: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    steps: z.array(opportunityStepSchema).optional(),
    openquok_cta_kind: ctaKindSchema.optional(),
    openquok_channel_slug: z.string().optional().nullable(),
    openquok_plug_name: z.string().optional().nullable(),
    cta_href: z.string().optional().nullable(),
    cta_label: z.string().optional().nullable(),
    sort_order: z.number().int().optional(),
    is_admin_published: z.boolean().optional(),
};

export const linkDirectoryOpportunityCreateSchema = z.object(opportunityFields);
export type LinkDirectoryOpportunityCreateSchemaType = z.infer<
    typeof linkDirectoryOpportunityCreateSchema
>;

export const linkDirectoryOpportunityUpdateSchema = z.object({
    ...opportunityFields,
    id: z.string().uuid(),
});
export type LinkDirectoryOpportunityUpdateSchemaType = z.infer<
    typeof linkDirectoryOpportunityUpdateSchema
>;

export const linkDirectoryCategoryCreateSchema = z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    headline: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    sort_order: z.number().int().optional(),
    openquok_channels_hub_path: z.string().optional(),
});
export type LinkDirectoryCategoryCreateSchemaType = z.infer<typeof linkDirectoryCategoryCreateSchema>;

export const linkDirectoryCategoryUpdateSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().optional(),
    headline: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    sort_order: z.number().int().optional(),
    openquok_channels_hub_path: z.string().optional(),
});
export type LinkDirectoryCategoryUpdateSchemaType = z.infer<typeof linkDirectoryCategoryUpdateSchema>;

export const linkDirectoryTagCreateSchema = z.object({
    name: z.string().min(1),
    slug: z.string().optional(),
    headline: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
});
export type LinkDirectoryTagCreateSchemaType = z.infer<typeof linkDirectoryTagCreateSchema>;

export const linkDirectoryTagUpdateSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().optional(),
    headline: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
});
export type LinkDirectoryTagUpdateSchemaType = z.infer<typeof linkDirectoryTagUpdateSchema>;

export const linkDirectoryTagGroupCreateSchema = z.object({
    name: z.string().min(1),
    sort_order: z.number().int().optional(),
});
export type LinkDirectoryTagGroupCreateSchemaType = z.infer<typeof linkDirectoryTagGroupCreateSchema>;

export const linkDirectorySubmissionCreateSchema = z.object({
    email: z.string().email(),
    site_url: z.string().url(),
    proposed_title: z.string().max(500).optional().nullable(),
    notes: z.string().max(5000).optional().nullable(),
    payload: z.record(z.unknown()).optional(),
});
export type LinkDirectorySubmissionCreateSchemaType = z.infer<
    typeof linkDirectorySubmissionCreateSchema
>;

export const linkDirectorySubmissionReviewSchema = z.object({
    status: z.enum(["approved", "rejected"]),
});
export type LinkDirectorySubmissionReviewSchemaType = z.infer<
    typeof linkDirectorySubmissionReviewSchema
>;

/** Upper bound on saved-site shortlist size (PUT replaces the full set in one request). */
const LINK_DIRECTORY_SAVED_SITE_IDS_MAX = 500;

const linkDirectorySavedSiteIdsSchema = z
    .array(z.string().uuid())
    .max(LINK_DIRECTORY_SAVED_SITE_IDS_MAX);

export const linkDirectorySavedSitesPutSchema = z.object({
    siteIds: linkDirectorySavedSiteIdsSchema,
});
export type LinkDirectorySavedSitesPutSchemaType = z.infer<typeof linkDirectorySavedSitesPutSchema>;

export const linkDirectorySavedSitesOrderSchema = z.object({
    siteIds: linkDirectorySavedSiteIdsSchema.min(1),
});
export type LinkDirectorySavedSitesOrderSchemaType = z.infer<
    typeof linkDirectorySavedSitesOrderSchema
>;

export const linkDirectorySavedSiteOutreachCompletionSchema = z.object({
    completed: z.boolean(),
});
export type LinkDirectorySavedSiteOutreachCompletionSchemaType = z.infer<
    typeof linkDirectorySavedSiteOutreachCompletionSchema
>;

const linkDirectorySiteCommentContent = z
    .string()
    .min(1, "Comment is required")
    .max(1000, "Comment must be at most 1000 characters");

export const linkDirectorySiteCommentCreateSchema = z.object({
    content: linkDirectorySiteCommentContent,
    parentId: z.string().uuid("Invalid parent comment id").optional().nullable(),
});
export type LinkDirectorySiteCommentCreateSchemaType = z.infer<
    typeof linkDirectorySiteCommentCreateSchema
>;

export const linkDirectorySiteCommentIdParamSchema = z.object({
    id: z.string().uuid("Invalid comment id"),
});

export const linkDirectorySiteRatingBodySchema = z.object({
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
});
export type LinkDirectorySiteRatingBodySchemaType = z.infer<typeof linkDirectorySiteRatingBodySchema>;
