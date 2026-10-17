export type SubmissionListingEvidence = {
    listingDofollow: boolean;
    authEmail: string | null;
};

export function parseSubmissionListingEvidence(
    evidence: Record<string, unknown> | null | undefined
): SubmissionListingEvidence {
    const raw = evidence ?? {};
    const listingDofollow = raw.listingDofollow === true;
    const authEmail =
        typeof raw.authEmail === "string" && raw.authEmail.trim()
            ? raw.authEmail.trim()
            : null;
    return { listingDofollow, authEmail };
}

export function buildManualListingEvidence(input: {
    listingDofollow?: boolean;
    authEmail?: string | null;
    source?: string;
}): Record<string, unknown> {
    const authEmail =
        typeof input.authEmail === "string" && input.authEmail.trim()
            ? input.authEmail.trim()
            : null;
    return {
        source: input.source ?? "manual_web",
        listingDofollow: input.listingDofollow === true,
        ...(authEmail ? { authEmail } : {}),
    };
}

export function mergeSubmissionListingEvidence(
    existing: Record<string, unknown> | null | undefined,
    input: { listingDofollow?: boolean; authEmail?: string | null }
): Record<string, unknown> {
    const base = { ...(existing ?? {}) };
    if (input.listingDofollow !== undefined) {
        base.listingDofollow = input.listingDofollow === true;
    } else if (base.listingDofollow === undefined) {
        base.listingDofollow = false;
    }
    if (input.authEmail !== undefined) {
        const trimmed =
            typeof input.authEmail === "string" && input.authEmail.trim()
                ? input.authEmail.trim()
                : null;
        if (trimmed) {
            base.authEmail = trimmed;
        } else {
            delete base.authEmail;
        }
    }
    return base;
}
