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

export type CatalogOpportunityDofollow = "dofollow" | "nofollow" | "unknown" | null;

/** Trust catalog dofollow/nofollow on completion; preserve user evidence when link type is unknown. */
export function applyTrustedListingDofollowOnComplete(
    evidence: Record<string, unknown>,
    opportunityDofollow: CatalogOpportunityDofollow
): Record<string, unknown> {
    if (opportunityDofollow === "dofollow") {
        return mergeSubmissionListingEvidence(evidence, { listingDofollow: true });
    }
    if (opportunityDofollow === "nofollow") {
        return mergeSubmissionListingEvidence(evidence, { listingDofollow: false });
    }
    return mergeSubmissionListingEvidence(evidence, {});
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
