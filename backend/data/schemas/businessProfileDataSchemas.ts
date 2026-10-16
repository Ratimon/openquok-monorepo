import {
    BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS,
    BUSINESS_PROFILE_MAX_GALLERY_URLS,
    BUSINESS_PROFILE_MAX_TAGS,
    BUSINESS_PROFILE_PRICING_TYPES,
    BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH,
    type BusinessProfileData,
} from "openquok-common";
import { z } from "zod";

const nullableTrimmedString = (max: number) =>
    z
        .union([z.string().max(max).trim(), z.null()])
        .optional()
        .transform((value) => {
            if (value === undefined) return undefined;
            if (value === null) return null;
            const trimmed = value.trim();
            return trimmed.length === 0 ? null : trimmed;
        });

const optionalHttpUrl = z
    .union([z.string().max(2000).trim(), z.null()])
    .optional()
    .transform((value) => {
        if (value === undefined) return undefined;
        if (value === null) return null;
        const trimmed = value.trim();
        if (trimmed.length === 0) return null;
        return trimmed;
    })
    .pipe(
        z.union([
            z.undefined(),
            z.null(),
            z.string().url("Must be a valid URL"),
        ])
    );

const optionalUsdAmount = z
    .union([z.number().nonnegative().finite(), z.null()])
    .optional();

const slugField = nullableTrimmedString(120).pipe(
    z.union([
        z.undefined(),
        z.null(),
        z
            .string()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug"),
    ])
);

export const businessProfileDataSchema = z
    .object({
        slug: slugField,
        category: nullableTrimmedString(200),
        pricing_type: z.enum(BUSINESS_PROFILE_PRICING_TYPES).nullable().optional(),
        tags: z
            .array(z.string().trim().min(1).max(80))
            .max(BUSINESS_PROFILE_MAX_TAGS)
            .nullable()
            .optional(),
        is_open_source: z.boolean().nullable().optional(),
        repository_url: optionalHttpUrl,
        launch_video_url: optionalHttpUrl,
        gallery_urls: z
            .array(z.string().max(2000).trim().min(1))
            .max(BUSINESS_PROFILE_MAX_GALLERY_URLS)
            .nullable()
            .optional(),
        social_x: optionalHttpUrl,
        social_github: optionalHttpUrl,
        social_instagram: optionalHttpUrl,
        social_linkedin: optionalHttpUrl,
        social_tiktok: optionalHttpUrl,
        social_facebook: optionalHttpUrl,
        social_youtube: optionalHttpUrl,
        social_bluesky: optionalHttpUrl,
        acquisition_listed: z.boolean().nullable().optional(),
        asking_price_usd: optionalUsdAmount,
        ttm_revenue_usd: optionalUsdAmount,
        monthly_revenue_usd: optionalUsdAmount,
        ttm_profit_usd: optionalUsdAmount,
        monthly_profit_usd: optionalUsdAmount,
        selling_reason: nullableTrimmedString(10_000),
        included_assets: z
            .array(z.enum(BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS))
            .nullable()
            .optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
        const reason = data.selling_reason?.trim() ?? "";
        const listed = Boolean(data.acquisition_listed);
        if (reason.length > 0 && reason.length < BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Selling reason must be at least ${BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH} characters`,
                path: ["selling_reason"],
            });
        }
        if (listed && reason.length < BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Selling reason is required (${BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH}+ characters) when listed for acquisition`,
                path: ["selling_reason"],
            });
        }
    });

export type ParsedBusinessProfileData = z.infer<typeof businessProfileDataSchema>;

export function parseBusinessProfileDataInput(
    value: Record<string, unknown> | undefined
): BusinessProfileData {
    const parsed = businessProfileDataSchema.parse(value ?? {});
    return parsed as BusinessProfileData;
}

export function parseBusinessProfileDataPatch(
    value: Record<string, unknown>
): BusinessProfileData {
    const parsed = businessProfileDataSchema.parse(value);
    return parsed as BusinessProfileData;
}
