type ListingSummarySource = {
	excerpt?: string | null;
	description?: string | null;
};

/** Shared header / SEO summary for extension and stack listings. */
export function resolveListingHeaderSummary(listing: ListingSummarySource): string | null {
	const excerpt = listing.excerpt?.trim();
	if (excerpt) return excerpt;

	const description = listing.description?.trim();
	if (description) return description;

	return null;
}
