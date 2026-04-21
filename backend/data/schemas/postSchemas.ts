import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { COMPOSER_MEDIA_BUCKET_NAME } from "../../repositories/StorageR2Repository";
import { DATABASE_NAMES } from "../../repositories/StorageSupabaseRepository";

export const postOrganizationQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const validatePostOrganizationQuery: RequestHandler = validateRequest({
    query: postOrganizationQuerySchema,
});

export const listPostsQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    start: z.string().min(1, "Start is required"),
    end: z.string().min(1, "End is required"),
    /**
     * Optional comma-separated integration ids to filter calendar data.
     * When omitted, all integrations (including ungrouped) are returned.
     */
    integrationIds: z.string().optional(),
});

export const validateListPostsQuery: RequestHandler = validateRequest({
    query: listPostsQuerySchema,
});

const repeatIntervalEnum = z.enum([
    "day",
    "two_days",
    "three_days",
    "four_days",
    "five_days",
    "six_days",
    "week",
    "two_weeks",
    "month",
]);

const mediaItemSchema = z.object({
    id: z.string().min(1).max(200),
    path: z.string().min(1).max(2000),
    bucket: z.enum([DATABASE_NAMES.BLOG_IMAGES, COMPOSER_MEDIA_BUCKET_NAME]).optional(),
});

export const createPostBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    body: z.string().max(50000).optional(),
    /**
     * Optional per-channel body overrides (customize mode).
     * Keys are integration IDs; values are the body content to use for that integration.
     */
    bodiesByIntegrationId: z.record(z.string().uuid(), z.string().max(50000)).optional(),
    /** Attached images (storage paths in `blog_images`); persisted as JSON in `posts.image`. */
    media: z.array(mediaItemSchema).max(20).optional(),
    integrationIds: z.array(z.string().uuid()).optional(),
    isGlobal: z.boolean().optional(),
    scheduledAt: z.string().min(1, "Schedule time is required"),
    repeatInterval: z.union([repeatIntervalEnum, z.null()]).optional(),
    tagNames: z.array(z.string().max(120)).max(50).optional(),
    status: z.enum(["draft", "scheduled"]),
});

export const validateCreatePostBody: RequestHandler = validateRequest({
    body: createPostBodySchema,
});

export const createPostTagBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    name: z.string().trim().min(1, "Name is required").max(120),
    color: z
        .string()
        .trim()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a #RRGGBB hex value")
        .optional(),
});

export const validateCreatePostTagBody: RequestHandler = validateRequest({
    body: createPostTagBodySchema,
});

export const deletePostTagParamsSchema = z.object({
    tagId: z.string().uuid("Invalid tag id"),
});

export const validateDeletePostTag: RequestHandler = validateRequest({
    params: deletePostTagParamsSchema,
    query: postOrganizationQuerySchema,
});
