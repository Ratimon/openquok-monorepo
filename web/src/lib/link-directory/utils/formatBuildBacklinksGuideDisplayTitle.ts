/** English ordinal suffix for UI labels (1 → 1st, 2 → 2nd, 11 → 11th). */
export function formatEnglishOrdinal(n: number): string {
	const value = Math.trunc(n);
	if (!Number.isFinite(value) || value < 1) {
		return String(n);
	}
	const mod100 = value % 100;
	if (mod100 >= 11 && mod100 <= 13) {
		return `${value}th`;
	}
	switch (value % 10) {
		case 1:
			return `${value}st`;
		case 2:
			return `${value}nd`;
		case 3:
			return `${value}rd`;
		default:
			return `${value}th`;
	}
}

/** UI-only opportunity heading (schema titles stay the CMS opportunity name). */
export function formatOpportunityIndexTitle(index: number): string {
	return `${formatEnglishOrdinal(index)} Backlink Opportunity`;
}

/** UI-only sub-step heading (schema step titles stay unnumbered). */
export function formatSubStepTitle(order: number): string {
	return `${formatEnglishOrdinal(order)} Step`;
}
