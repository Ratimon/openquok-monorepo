import { z } from "zod";

// --- Blog Post SEO structured fields ---

const blogFaqItemSchema = z.object({
    question: z.string().min(1, "Question is required"),
    answer: z.string().min(1, "Answer is required"),
});

const blogHowtoStepSchema = z.object({
    name: z.string().min(1, "Step name is required"),
    text: z.string().min(1, "Step text is required"),
});

const blogProductUrlSchema = z
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
        { message: "Product URL must be a valid URL" }
    );

const blogProductSchema = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Product description is required"),
    brand: z.string().optional().nullable(),
    url: blogProductUrlSchema,
});

// --- Blog Post ---

const blogPostFields = {
    id: z.string().uuid("Invalid post id").optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    content: z.string().min(1, "Content is required"),
    topic_id: z.string().min(1, "Topic is required").uuid("Invalid topic id"),
    hero_image_filename: z.string().optional(),
    is_sponsored: z.boolean().default(false),
    is_featured: z.boolean().default(false),
    is_user_published: z.boolean().default(false),
    is_admin_approved: z.boolean().default(false),
    /** Optional FAQ Q&A pairs; empty array or null clears. */
    faq_items: z.array(blogFaqItemSchema).optional().nullable(),
    /** Optional HowTo steps; empty array or null clears. */
    howto_steps: z.array(blogHowtoStepSchema).optional().nullable(),
    /** Optional product summary; null clears. */
    product: blogProductSchema.optional().nullable(),
};

/** Schema for creating a blog post (POST /posts). Id optional (ignored on create). */
export const blogPostCreateSchema = z.object(blogPostFields);
export type BlogPostCreateSchemaType = z.infer<typeof blogPostCreateSchema>;

/** Schema for updating a blog post (PATCH /posts/:id). Id in body or from URL. */
export const blogPostUpdateSchema = z.object(blogPostFields);
export type BlogPostUpdateSchemaType = z.infer<typeof blogPostUpdateSchema>;

/** Params schema for PATCH /posts/:id */
export const blogPostIdParamSchema = z.object({
    id: z.string().uuid("Invalid post id"),
});

/** Params schema for GET /posts/:identifier (id = UUID for auth flow, or slug for public published post). */
export const blogPostIdentifierParamSchema = z.object({
    identifier: z.string().min(1, "Identifier is required"),
});

/** Form schema (id optional). Same shape as create/update; use for upsert-style flows. */
export const blogPostFormSchema = z.object(blogPostFields);
export type BlogPostFormSchemaType = z.infer<typeof blogPostFormSchema>;

// --- Blog Topic ---

const blogTopicFields = {
    id: z.string().uuid("Invalid topic id").optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    parent_id: z.string().uuid("Invalid parent topic id").optional(),
};

/** Schema for creating a blog topic (POST /topics). Id optional (ignored on create). */
export const blogTopicCreateSchema = z.object(blogTopicFields);
export type BlogTopicCreateSchemaType = z.infer<typeof blogTopicCreateSchema>;

/** Schema for updating a blog topic (PUT /topics/:id). Id in body or from URL. */
export const blogTopicUpdateSchema = z.object(blogTopicFields);
export type BlogTopicUpdateSchemaType = z.infer<typeof blogTopicUpdateSchema>;

/** Params schema for PUT /topics/:id */
export const blogTopicIdParamSchema = z.object({
    id: z.string().uuid("Invalid topic id"),
});

// --- Blog Comment ---

const blogCommentContent = z
    .string()
    .min(1, "Comment content is required")
    .max(1000, "Comment cannot be longer than 1000 characters");

const blogCommentFields = {
    id: z.string().uuid("Invalid comment id").optional(),
    post_id: z.string().min(1, "Post id is required").uuid("Invalid post id").optional(),
    parent_id: z.string().uuid("Invalid parent comment id").optional(),
    content: blogCommentContent,
};

/** Schema for creating a comment (POST /comments). Id optional; post_id required on create. */
export const blogCommentCreateSchema = z
    .object(blogCommentFields)
    .refine((data) => data.post_id != null, { message: "Post id is required", path: ["post_id"] });
export type BlogCommentCreateSchemaType = z.infer<typeof blogCommentCreateSchema>;

/** Schema for updating a comment (PUT /comments/:id). Id in body or from URL. */
export const blogCommentUpdateSchema = z.object(blogCommentFields);
export type BlogCommentUpdateSchemaType = z.infer<typeof blogCommentUpdateSchema>;

/** Params schema for PUT /comments/:id */
export const blogCommentIdParamSchema = z.object({
    id: z.string().uuid("Invalid comment id"),
});

/** Params schema for GET /posts/:postId/comments */
export const blogPostCommentsParamSchema = z.object({
    postId: z.string().uuid("Invalid post id"),
});

/** Params schema for PUT /posts/:postId/activity (track view/like/share/comment) */
export const blogPostActivityParamSchema = z.object({
    postId: z.string().uuid("Invalid post id"),
});

/** Body schema for PUT /posts/:postId/activity. Matches template InputParams: post_id from URL, activity_type in body. */
export const blogTrackActivitySchema = z.object({
    activity_type: z.enum(["view", "like", "share", "comment"], {
        errorMap: () => ({ message: "activity_type must be one of: view, like, share, comment" }),
    }),
});
export type BlogTrackActivitySchemaType = z.infer<typeof blogTrackActivitySchema>;
