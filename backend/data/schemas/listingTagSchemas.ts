import { z } from "zod";

const tagFields = {
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
};

export const listingTagCreateSchema = z.object(tagFields);
export type ListingTagCreateSchemaType = z.infer<typeof listingTagCreateSchema>;

export const listingTagUpdateSchema = z.object({
    ...tagFields,
    id: z.string().uuid(),
});
export type ListingTagUpdateSchemaType = z.infer<typeof listingTagUpdateSchema>;

export const listingTagIdParamSchema = z.object({
    tagId: z.string().uuid(),
});

export const listingTagGroupCreateSchema = z.object({
    name: z.string().min(1),
});
export type ListingTagGroupCreateSchemaType = z.infer<typeof listingTagGroupCreateSchema>;

export const listingTagGroupUpdateSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
});
export type ListingTagGroupUpdateSchemaType = z.infer<typeof listingTagGroupUpdateSchema>;

export const listingTagGroupIdParamSchema = z.object({
    tagGroupId: z.string().uuid(),
});

export const listingTagGroupIdsSchema = z.array(z.string().uuid()).default([]);
