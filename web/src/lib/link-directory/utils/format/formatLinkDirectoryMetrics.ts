/** Compact monthly visits for cards (e.g. 1_700_000_000 → "1.7B/mo"). */
export function formatMonthlyVisitsLabel(visits: number | null | undefined): string | null {
	if (visits == null || !Number.isFinite(visits) || visits <= 0) return null;

	const units = [
		{ threshold: 1_000_000_000, suffix: 'B' },
		{ threshold: 1_000_000, suffix: 'M' },
		{ threshold: 1_000, suffix: 'K' }
	];

	for (const unit of units) {
		if (visits >= unit.threshold) {
			const value = visits / unit.threshold;
			const formatted = value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '');
			return `${formatted}${unit.suffix}/mo`;
		}
	}

	return `${Math.round(visits)}/mo`;
}

export function formatMetricsUpdatedLabel(iso: string | null | undefined): string | null {
	if (!iso?.trim()) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
