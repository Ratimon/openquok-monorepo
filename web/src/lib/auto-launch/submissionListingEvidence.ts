export function parseSubmissionListingEvidence(
	evidence: Record<string, unknown> | null | undefined
): { listingDofollow: boolean; authEmail: string | null } {
	const raw = evidence ?? {};
	return {
		listingDofollow: raw.listingDofollow === true,
		authEmail:
			typeof raw.authEmail === 'string' && raw.authEmail.trim()
				? raw.authEmail.trim()
				: null
	};
}
