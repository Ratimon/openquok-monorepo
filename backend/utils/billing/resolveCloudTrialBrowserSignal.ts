import type { Request } from "express";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export type RequestWithCloudTrialBrowserSignal = Request & {
    cloudTrialBrowserSignalId?: string | null;
};

export function normalizeCloudTrialBrowserSignal(raw?: string | null): string | null {
    if (typeof raw !== "string") return null;
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parsed = uuidSchema.safeParse(trimmed);
    return parsed.success ? parsed.data : null;
}

/** Prefer explicit JSON body field, then value attached by {@link trialBrowserSignalMiddleware}. */
export function resolveCloudTrialBrowserSignalFromRequest(
    req: RequestWithCloudTrialBrowserSignal,
    bodyField?: string | null
): string | null {
    const fromBody = normalizeCloudTrialBrowserSignal(bodyField);
    if (fromBody) return fromBody;
    return normalizeCloudTrialBrowserSignal(req.cloudTrialBrowserSignalId ?? null);
}
