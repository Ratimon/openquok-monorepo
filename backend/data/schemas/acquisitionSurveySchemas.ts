import { z } from "zod";
import type { RequestHandler } from "express";
import { validateRequest } from "../../middlewares/validateRequest";

export const ACQUISITION_SURVEY_SOURCE_SLUGS = [
    "search_engine",
    "reddit",
    "x",
    "chatgpt",
    "youtube",
    "launch_platform",
    "openquok_blog",
    "recommendation",
    "tiktok",
    "email_outreach",
    "ads",
    "newsletter",
    "podcast",
    "linkedin",
    "other",
] as const;

export type AcquisitionSurveySourceSlug = (typeof ACQUISITION_SURVEY_SOURCE_SLUGS)[number];

export const acquisitionSurveySourceSchema = z.enum(ACQUISITION_SURVEY_SOURCE_SLUGS);

export const submitAcquisitionSurveyBodySchema = z
    .object({
        source: acquisitionSurveySourceSchema.optional(),
        skipped: z.boolean().optional(),
        otherDetail: z.string().trim().max(200, "otherDetail must be at most 200 characters").optional(),
        organizationId: z.string().uuid("organizationId must be a valid UUID").optional(),
        utm: z.string().trim().max(2048).optional(),
        landingUrl: z.string().trim().max(2048).optional(),
        referrer: z.string().trim().max(2048).optional(),
    })
    .superRefine((data, ctx) => {
        const skipped = data.skipped === true;
        if (skipped) return;
        if (!data.source) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "source is required when skipped is not true",
                path: ["source"],
            });
        }
        if (data.source === "other" && !data.otherDetail?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "otherDetail is required when source is other",
                path: ["otherDetail"],
            });
        }
    });

export type SubmitAcquisitionSurveyBody = z.infer<typeof submitAcquisitionSurveyBodySchema>;

export const validateSubmitAcquisitionSurveyRequest: RequestHandler = validateRequest({
    body: submitAcquisitionSurveyBodySchema,
});

export type ValidateSubmitAcquisitionSurveyRequestHandler = typeof validateSubmitAcquisitionSurveyRequest;
