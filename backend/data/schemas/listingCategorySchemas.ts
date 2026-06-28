import { z } from "zod";

const categoryFields = {
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Name is required"),
    slug: z.string().optional(),
    headline: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    image_url_hero: z.string().optional().nullable(),
    image_url_small: z.string().optional().nullable(),
    href: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
    emoji: z.string().optional().nullable(),
    parent_id: z.string().uuid().optional().nullable(),
    parent_path: z.string().default("/"),
};

export const listingCategoryCreateSchema = z.object(categoryFields);
export type ListingCategoryCreateSchemaType = z.infer<typeof listingCategoryCreateSchema>;

export const listingCategoryUpdateSchema = z.object({
    ...categoryFields,
    id: z.string().uuid(),
});
export type ListingCategoryUpdateSchemaType = z.infer<typeof listingCategoryUpdateSchema>;

export const listingCategoryIdParamSchema = z.object({
    categoryId: z.string().uuid(),
});

export const listingCategoryGroupCreateSchema = z.object({
    name: z.string().min(1),
});
export type ListingCategoryGroupCreateSchemaType = z.infer<typeof listingCategoryGroupCreateSchema>;

export const listingCategoryGroupUpdateSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
});
export type ListingCategoryGroupUpdateSchemaType = z.infer<typeof listingCategoryGroupUpdateSchema>;

export const listingCategoryGroupIdParamSchema = z.object({
    categoryGroupId: z.string().uuid(),
});

export const listingCategoryGroupIdsSchema = z.array(z.string().uuid()).default([]);
