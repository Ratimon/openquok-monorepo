import { z } from "zod";

export const billingSubscribeBodySchema = z.object({
    organizationId: z.string().uuid("organizationId must be a valid UUID").optional(),
    period: z.enum(["MONTHLY", "YEARLY"]),
    billing: z.enum(["SOLO", "CREATOR", "TEAM", "ULTIMATE"]),
    stripePriceId: z
        .string()
        .trim()
        .regex(/^price_/, "stripePriceId must be a Stripe Price id (price_…)"),
});

export const billingOrganizationQuerySchema = z.object({
    organizationId: z.string().uuid("organizationId must be a valid UUID").optional(),
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
    (req as { query: z.infer<typeof billingOrganizationQuerySchema> }).query = parsed.data;
    next();
}
