import { PAID_SUBSCRIPTION_TIERS } from "openquok-common";
import { z } from "zod";

const optionalOrganizationId = z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().uuid("organizationId must be a valid UUID").optional()
);

const purchasableBillingTierSchema = z.enum(PAID_SUBSCRIPTION_TIERS);

export const billingSubscribeBodySchema = z.object({
    organizationId: optionalOrganizationId,
    period: z.enum(["MONTHLY", "YEARLY"]),
    billing: purchasableBillingTierSchema,
    stripePriceId: z
        .string()
        .trim()
        .regex(/^price_/, "stripePriceId must be a Stripe Price id (price_…)"),
});

export const billingOrganizationQuerySchema = z.object({
    organizationId: z.string().uuid("organizationId must be a valid UUID").optional(),
});

export const billingPlanChangeBodySchema = z.object({
    organizationId: z.string().uuid("organizationId must be a valid UUID").optional(),
    period: z.enum(["MONTHLY", "YEARLY"]),
    billing: purchasableBillingTierSchema,
});

export const billingCancelBodySchema = z.object({
    organizationId: z.string().uuid("organizationId must be a valid UUID").optional(),
    feedback: z.string().trim().max(5000).optional(),
});

export const billingAdminAddSubscriptionBodySchema = z.object({
    organizationId: z.string().uuid("organizationId must be a valid UUID").optional(),
    subscription: purchasableBillingTierSchema,
});

export const billingRefundChargesBodySchema = z.object({
    organizationId: z.string().uuid("organizationId must be a valid UUID").optional(),
    chargeIds: z.array(z.string().trim().min(1)).min(1, "chargeIds must include at least one id"),
});

export function validateBillingSubscribeBody(
    req: { body?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void
): void {
    const parsed = billingSubscribeBodySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            success: false,
            message: parsed.error.issues.map((i) => i.message).join(" "),
        });
        return;
    }
    (req as { body: z.infer<typeof billingSubscribeBodySchema> }).body = parsed.data;
    next();
}

export function validateBillingOrganizationQuery(
    req: { query?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void
): void {
    const parsed = billingOrganizationQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({
            success: false,
            message: parsed.error.issues.map((i) => i.message).join(" "),
        });
        return;
    }
    next();
}

function validateBody<T extends z.ZodTypeAny>(
    schema: T,
    req: { body?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void
): void {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            success: false,
            message: parsed.error.issues.map((i) => i.message).join(" "),
        });
        return;
    }
    (req as { body: z.infer<T> }).body = parsed.data;
    next();
}

export const validateBillingPlanChangeBody = (
    req: { body?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void
): void => validateBody(billingPlanChangeBodySchema, req, res, next);

export const validateBillingCancelBody = (
    req: { body?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void
): void => validateBody(billingCancelBodySchema, req, res, next);

export const validateBillingAdminAddSubscriptionBody = (
    req: { body?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void
): void => validateBody(billingAdminAddSubscriptionBodySchema, req, res, next);

export const validateBillingRefundChargesBody = (
    req: { body?: unknown },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: (err?: unknown) => void
): void => validateBody(billingRefundChargesBodySchema, req, res, next);
