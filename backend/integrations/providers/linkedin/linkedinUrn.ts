/** Normalize post ids returned by `/rest/posts` for socialActions + reshare APIs. */
export function normalizeLinkedInPostUrnForSocialAction(postUrn: string): string {
    const trimmed = postUrn.trim();
    if (/^urn:li:(share|ugcPost):/.test(trimmed)) return trimmed;

    const activityMatch = trimmed.match(/^urn:li:activity:(\d+)$/);
    if (activityMatch?.[1]) return `urn:li:share:${activityMatch[1]}`;

    return trimmed;
}

/** LinkedIn REST comment bodies expect an activity URN in `object`. */
export function linkedInActivityUrnFromPostUrn(postUrn: string): string {
    const normalized = normalizeLinkedInPostUrnForSocialAction(postUrn);
    const match = normalized.match(/^urn:li:(?:share|ugcPost|activity):(\d+)$/);
    if (match?.[1]) return `urn:li:activity:${match[1]}`;
    return normalized;
}

export function encodeLinkedInUrnForRestPath(urn: string): string {
    return encodeURIComponent(urn.trim());
}

/** Alternate parent ids to try when LinkedIn rejects a reshare parent URN. */
export function linkedInReshareParentCandidates(postUrn: string): string[] {
    const normalized = normalizeLinkedInPostUrnForSocialAction(postUrn);
    const match = normalized.match(/^urn:li:(?:share|ugcPost):(\d+)$/);
    if (!match?.[1]) return [normalized];

    const id = match[1];
    const share = `urn:li:share:${id}`;
    const ugcPost = `urn:li:ugcPost:${id}`;
    if (normalized === share) return [share, ugcPost];
    if (normalized === ugcPost) return [ugcPost, share];
    return [normalized];
}

export function linkedInRestSocialActionCommentsUrl(postUrn: string): string {
    const pathUrn = normalizeLinkedInPostUrnForSocialAction(postUrn);
    return `https://api.linkedin.com/rest/socialActions/${encodeLinkedInUrnForRestPath(pathUrn)}/comments`;
}
