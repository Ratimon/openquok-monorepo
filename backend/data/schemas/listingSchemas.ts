import { z } from "zod";

const extensionTypeSchema = z.enum(["skills", "mcp", "both"]);
const listingKindSchema = z.enum(["extension", "stack"]);

const faqItemSchema = z.object({
    question: z.string(),
    answer: z.string(),
});

const listingFields = {
    id: z.string().uuid("Invalid listing id").optional(),
    title: z.string().min(2, "Title must be at least 2 characters"),
    excerpt: z.string().max(160, "Excerpt must be at most 160 characters").optional().nullable(),
    description: z.string().max(10000).optional().nullable(),
    content: z.string().optional().nullable(),
    listing_kind: listingKindSchema.default("extension"),
    extension_type: extensionTypeSchema.optional().nullable(),
    install_command_skills: z.string().optional().nullable(),
    install_command_mcp: z.string().optional().nullable(),
    is_official: z.boolean().default(false),
    source_repo_url: z.string().url().optional().nullable().or(z.literal("")),
    listing_category_id: z.string().uuid("Invalid category id").optional().nullable(),
    listing_image_urls: z.array(z.string()).optional().nullable(),
    default_image_url: z.string().optional().nullable(),
    logo_image_url: z.string().optional().nullable(),
    is_user_published: z.boolean().default(false),
    is_admin_published: z.boolean().optional().nullable(),
    schema_type: z.string().optional().nullable(),
    schema_json: z.record(z.unknown()).optional().nullable(),
    faq: z.array(faqItemSchema).optional().nullable(),
    owner_id: z.string().uuid("Invalid owner id").optional(),
};

export const listingTagRefSchema = z.object({
    id: z.string().uuid(),
    slug: z.string(),
});
export type ListingTagRefSchemaType = z.infer<typeof listingTagRefSchema>;

export const listingCreateSchema = z.object(listingFields);
export type ListingCreateSchemaType = z.infer<typeof listingCreateSchema>;

export const listingUpdateSchema = z.object({
    ...listingFields,
    id: z.string().uuid("Invalid listing id"),
});
export type ListingUpdateSchemaType = z.infer<typeof listingUpdateSchema>;

export const listingCreateBodySchema = z.object({
    listingData: listingCreateSchema,
    listingTagsData: z.array(listingTagRefSchema).default([]),
});
export type ListingCreateBodySchemaType = z.infer<typeof listingCreateBodySchema>;

export const listingUpdateBodySchema = z.object({
    listingData: listingUpdateSchema,
    listingTagsData: z.array(listingTagRefSchema).default([]),
});
export type ListingUpdateBodySchemaType = z.infer<typeof listingUpdateBodySchema>;

export const listingIdParamSchema = z.object({
    id: z.string().uuid("Invalid listing id"),
});

export const listingSlugParamSchema = z.object({
    slug: z.string().min(1, "Slug is required"),
});

export const listingStatParamSchema = z.object({
    listingId: z.string().uuid("Invalid listing id"),
});

export const listingCreatorUsernameParamSchema = z.object({
    username: z.string().min(1, "Username is required"),
});
