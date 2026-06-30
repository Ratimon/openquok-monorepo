import { z } from "zod";

const extensionTypeSchema = z.enum(["skills", "mcp", "both"], {
    message: "Extension type is required.",
});
const listingKindSchema = z.enum(["extension", "stack"]);
const listingSchemaTypeSchema = z.enum(
    ["SoftwareApplication", "CreativeWork", "Organization", "Person", "Thing"],
    { message: "Schema type is required." }
);

const clickUrlFieldSchema = z
    .string()
    .optional()
    .nullable()
    .refine(
        (value) => {
            if (value === "" || value == null) return true;
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
        { message: "Click URL must be a valid URL" }
    );

const faqItemSchema = z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
});

const mcpToolSchema = z.object({
    name: z.string().min(1),
    description: z.string(),
});

const mcpTransportSchema = z.enum(["stdio", "sse", "http"]);

const listingIdFieldSchema = z
    .union([z.string().uuid("Invalid listing id"), z.literal("")])
    .optional();

const listingCategoryIdFieldSchema = z.string().superRefine((value, ctx) => {
    if (!value.trim()) {
        ctx.addIssue({ code: "custom", message: "Category is missing." });
        return;
    }
    if (!z.string().uuid().safeParse(value).success) {
        ctx.addIssue({ code: "custom", message: "Invalid category id" });
    }
});

const listingFields = {
    id: listingIdFieldSchema,
    title: z.string().min(2, "Title must be at least 2 characters"),
    excerpt: z.string().max(160, "Excerpt must be at most 160 characters").optional().nullable(),
    click_url: clickUrlFieldSchema,
    click_url_skills: clickUrlFieldSchema,
    click_url_mcp: clickUrlFieldSchema,
    description: z.string().max(10000).optional().nullable(),
    description_skills: z.string().max(10000).optional().nullable(),
    description_mcp: z.string().max(10000).optional().nullable(),
    content: z.string().optional().nullable(),
    content_skills: z.string().optional().nullable(),
    content_mcp: z.string().optional().nullable(),
    listing_kind: listingKindSchema.default("extension"),
    extension_type: extensionTypeSchema.optional().nullable(),
    install_command_skills: z.string().optional().nullable(),
    install_command_mcp: z.string().optional().nullable(),
    is_official: z.boolean().default(false),
    source_repo_url: z.string().url().optional().nullable().or(z.literal("")),
    skill_source_url: z.string().url().optional().nullable().or(z.literal("")),
    skill_name: z.string().optional().nullable(),
    skill_metadata: z.record(z.unknown()).optional().nullable(),
    source_synced_at: z.string().datetime().optional().nullable(),
    source_content_hash: z.string().optional().nullable(),
    license: z.string().optional().nullable(),
    version: z.string().optional().nullable(),
    mcp_tools: z.array(mcpToolSchema).optional().nullable(),
    mcp_transport: mcpTransportSchema.optional().nullable(),
    mcp_server_config: z.record(z.unknown()).optional().nullable(),
    listing_category_id: listingCategoryIdFieldSchema,
    listing_image_urls: z.array(z.string()).optional().nullable(),
    default_image_url: z.string().optional().nullable(),
    logo_image_url: z.string().optional().nullable(),
    is_user_published: z.boolean().default(false),
    is_admin_published: z.boolean().optional().nullable(),
    schema_type: listingSchemaTypeSchema,
    schema_json: z.record(z.unknown()).optional().nullable(),
    faq: z.array(faqItemSchema).default([]),
    owner_id: z.string().uuid("Invalid owner id").optional(),
};

export const listingTagRefSchema = z.object({
    id: z.string().uuid(),
    slug: z.string(),
});
export type ListingTagRefSchemaType = z.infer<typeof listingTagRefSchema>;

export const listingCreateSchema = z.object(listingFields).superRefine((data, ctx) => {
    if (data.listing_kind === "extension" && !data.extension_type) {
        ctx.addIssue({
            code: "custom",
            message: "Extension type is required.",
            path: ["extension_type"],
        });
    }
});
export type ListingCreateSchemaType = z.infer<typeof listingCreateSchema>;

export const listingUpdateSchema = z
    .object({
        ...listingFields,
        id: z.string().uuid("Invalid listing id"),
    })
    .superRefine((data, ctx) => {
        if (data.listing_kind === "extension" && !data.extension_type) {
            ctx.addIssue({
                code: "custom",
                message: "Extension type is required.",
                path: ["extension_type"],
            });
        }
    });
export type ListingUpdateSchemaType = z.infer<typeof listingUpdateSchema>;

const stackMemberRoleSchema = z.enum(["skills", "mcp"]);

export const stackMemberRefSchema = z.object({
    member_listing_id: z.string().uuid("Invalid member listing id"),
    member_role: stackMemberRoleSchema,
    sort_order: z.number().int().min(0).default(0),
});
export type StackMemberRefSchemaType = z.infer<typeof stackMemberRefSchema>;

export const listingCreateBodySchema = z.object({
    listingData: listingCreateSchema,
    listingTagsData: z.array(listingTagRefSchema).default([]),
    stackMembersData: z.array(stackMemberRefSchema).optional().default([]),
});
export type ListingCreateBodySchemaType = z.infer<typeof listingCreateBodySchema>;

export const listingUpdateBodySchema = z.object({
    listingData: listingUpdateSchema,
    listingTagsData: z.array(listingTagRefSchema).default([]),
    stackMembersData: z.array(stackMemberRefSchema).optional().default([]),
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

export const listingCommentIdParamSchema = z.object({
    id: z.string().uuid("Invalid comment id"),
});

export const listingGithubImportBodySchema = z.object({
    githubUrl: z.string().url("A valid GitHub URL is required"),
    extensionType: extensionTypeSchema.optional().nullable(),
});

export type ListingGithubImportBodySchemaType = z.infer<typeof listingGithubImportBodySchema>;

const listingCommentContent = z
    .string()
    .min(1, "Comment is required")
    .max(1000, "Comment must be at most 1000 characters");

export const listingCommentCreateSchema = z.object({
    listing_id: z.string().uuid("Invalid listing id"),
    parent_id: z.string().uuid("Invalid parent comment id").optional().nullable(),
    content: listingCommentContent,
});
export type ListingCommentCreateSchemaType = z.infer<typeof listingCommentCreateSchema>;

export const listingCommentsParamSchema = z.object({
    listingId: z.string().uuid("Invalid listing id"),
});

export const listingRatingBodySchema = z.object({
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
});
export type ListingRatingBodySchemaType = z.infer<typeof listingRatingBodySchema>;
