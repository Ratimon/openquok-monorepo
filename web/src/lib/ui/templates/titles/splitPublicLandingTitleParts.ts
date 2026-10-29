/** Split hero `<h1>` lines — newlines only (commas stay in copy). */
export function splitPublicHeroTitleLines(title: string): string[] {
	const trimmed = title.trim();
	if (!trimmed) return [];
	if (!trimmed.includes('\n')) return [trimmed];
	return trimmed
		.split(/\n+/)
		.map((part) => part.trim())
		.filter((part) => part.length > 0);
}

/** Split marketing section titles into stacked clauses (newlines first, then commas). */
export function splitPublicLandingTitleParts(
	title: string,
	commaSeparated?: boolean
): string[] {
	const trimmed = title.trim();
	if (!trimmed) return [];
	if (trimmed.includes('\n')) {
		return trimmed
			.split(/\n+/)
			.map((part) => part.trim())
			.filter((part) => part.length > 0);
	}
	const shouldSplitOnCommas = commaSeparated !== false && trimmed.includes(',');
	if (shouldSplitOnCommas) {
		return trimmed
			.split(',')
			.map((part) => part.trim())
			.filter((part) => part.length > 0);
	}
	return [trimmed];
}

export function landingTitleHasMultipleParts(title: string, commaSeparated?: boolean): boolean {
	return splitPublicLandingTitleParts(title, commaSeparated).length > 1;
}
