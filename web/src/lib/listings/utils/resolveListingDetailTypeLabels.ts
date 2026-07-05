type ListingDetailTypeSource = {
	listingKind?: string | null;
	extensionType?: string | null;
};

/** Human-readable listing type labels for public detail headers. */
export function resolveListingDetailTypeLabels(source: ListingDetailTypeSource): string[] {
	if (source.listingKind === 'stack') {
		return ['Playbook'];
	}

	switch (source.extensionType) {
		case 'skills':
			return ['Skills'];
		case 'mcp':
			return ['MCP'];
		case 'both':
			return ['Skills + MCP'];
		default:
			return [];
	}
}
