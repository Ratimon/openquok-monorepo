import { z } from "zod";

const profileDataSchema = z.record(z.string(), z.unknown()).optional().default({});

const providerSlugSchema = z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid provider slug");

const launchStepFieldSchema = z.object({
    key: z.string().min(1).max(120),
    label: z.string().min(1).max(200),
    profilePath: z.string().min(1).max(200),
    selectorHint: z.string().max(500).optional(),
});

const launchStepSchema = z.object({
    id: z.string().min(1).max(120),
    label: z.string().min(1).max(200),
    fields: z.array(launchStepFieldSchema).optional(),
});

export const autoLaunchExtensionConfigSchema = z.object({
    version: z.number().int().min(1).optional(),
    startUrlPatterns: z.array(z.string().min(1).max(500)).optional(),
    readyUrlHint: z.string().max(200).optional(),
    steps: z.array(launchStepSchema).optional(),
    proof: z.record(z.string(), z.unknown()).optional(),
});

export const autoLaunchDestinationIdParamSchema = z.object({
    id: z.string().uuid("Invalid destination id"),
});

export const autoLaunchProviderSlugParamSchema = z.object({
    providerSlug: providerSlugSchema,
});

export const createAdminAutoLaunchDestinationBodySchema = z.object({
    providerSlug: providerSlugSchema,
    linkDirectoryOpportunityId: z.string().uuid().nullable().optional(),
    name: z.string().min(1).max(200).trim(),
    shortDescription: z.string().max(2000).trim().nullable().optional(),
    submissionPath: z.enum(["extension", "auto"]).optional().default("extension"),
    startUrl: z.string().url().max(2000),
    extensionConfig: autoLaunchExtensionConfigSchema.optional().default({}),
    isPublished: z.boolean().optional().default(false),
    sortOrder: z.number().int().optional().default(0),
    pickerGroupKey: z
        .string()
        .max(120)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid picker group key")
        .nullable()
        .optional(),
    pickerGroupTitle: z.string().max(200).trim().nullable().optional(),
});

export const updateAdminAutoLaunchDestinationBodySchema = z
    .object({
        providerSlug: providerSlugSchema.optional(),
        linkDirectoryOpportunityId: z.string().uuid().nullable().optional(),
        name: z.string().min(1).max(200).trim().optional(),
        shortDescription: z.string().max(2000).trim().nullable().optional(),
        submissionPath: z.enum(["extension", "auto"]).optional(),
        startUrl: z.string().url().max(2000).optional(),
        extensionConfig: autoLaunchExtensionConfigSchema.optional(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
        pickerGroupKey: z
            .string()
            .max(120)
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid picker group key")
            .nullable()
            .optional(),
        pickerGroupTitle: z.string().max(200).trim().nullable().optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: "At least one field is required" });

export const autoLaunchProfileIdParamSchema = z.object({
    id: z.string().uuid("Invalid product profile id"),
});

export const listAutoLaunchProfilesQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    integrationCustomerId: z.string().uuid("Invalid channel group id").optional(),
});

export const listBusinessProfilesQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
});

export const createAutoLaunchProfileBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    integrationCustomerId: z.string().uuid("Invalid channel group id").nullable().optional(),
    name: z.string().min(1, "Name is required").max(200, "Name is too long").trim(),
    tagline: z.string().max(500, "Tagline is too long").trim().nullable().optional(),
    description: z.string().max(50_000, "Description is too large").nullable().optional(),
    websiteUrl: z.string().url("Invalid website URL").max(2000).nullable().optional(),
    logoUrl: z.string().url("Invalid logo URL").max(2000).nullable().optional(),
    profileData: profileDataSchema,
});

export const updateAutoLaunchProfileBodySchema = z
    .object({
        name: z.string().min(1).max(200).trim().optional(),
        tagline: z.string().max(500).trim().nullable().optional(),
        description: z.string().max(50_000).nullable().optional(),
        websiteUrl: z.string().url().max(2000).nullable().optional(),
        logoUrl: z.string().url().max(2000).nullable().optional(),
        integrationCustomerId: z.string().uuid().nullable().optional(),
        profileData: profileDataSchema.optional(),
    })
    .refine((body) => Object.keys(body).length > 0, { message: "At least one field is required" });

export const listAutoLaunchSubmissionsQuerySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    productProfileId: z.string().uuid().optional(),
    destinationId: z.string().uuid().optional(),
});

export const createSubmissionIntentBodySchema = z
    .object({
        organizationId: z.string().uuid("Invalid organization id"),
        productProfileId: z.string().uuid("Invalid product profile id"),
        destinationId: z.string().uuid("Invalid destination id").optional(),
        providerSlug: z
            .string()
            .min(1)
            .max(120)
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid provider slug")
            .optional(),
    })
    .refine((body) => Boolean(body.destinationId ?? body.providerSlug), {
        message: "destinationId or providerSlug is required",
    });

export const completeSubmissionBodySchema = z.object({
    launchToken: z.string().min(1, "launchToken is required"),
    listingUrl: z.string().url().max(2000).optional(),
    evidence: z.record(z.string(), z.unknown()).optional().default({}),
});

export const recordManualSubmissionCompleteBodySchema = z.object({
    organizationId: z.string().uuid("Invalid organization id"),
    productProfileId: z.string().uuid("Invalid product profile id"),
    destinationId: z.string().uuid("Invalid destination id"),
    listingUrl: z.string().url().max(2000).optional(),
});

export type ListAutoLaunchProfilesQuery = z.infer<typeof listAutoLaunchProfilesQuerySchema>;
export type ListBusinessProfilesQuery = z.infer<typeof listBusinessProfilesQuerySchema>;
export type CreateAutoLaunchProfileBody = z.infer<typeof createAutoLaunchProfileBodySchema>;
export type UpdateAutoLaunchProfileBody = z.infer<typeof updateAutoLaunchProfileBodySchema>;
export type ListAutoLaunchSubmissionsQuery = z.infer<typeof listAutoLaunchSubmissionsQuerySchema>;
export type CreateSubmissionIntentBody = z.infer<typeof createSubmissionIntentBodySchema>;
export type CompleteSubmissionBody = z.infer<typeof completeSubmissionBodySchema>;
export type RecordManualSubmissionCompleteBody = z.infer<typeof recordManualSubmissionCompleteBodySchema>;
export type CreateAdminAutoLaunchDestinationBody = z.infer<typeof createAdminAutoLaunchDestinationBodySchema>;
export type UpdateAdminAutoLaunchDestinationBody = z.infer<typeof updateAdminAutoLaunchDestinationBodySchema>;
