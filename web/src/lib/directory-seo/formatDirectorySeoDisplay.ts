export function formatDirectorySeoDr(value: number | null | undefined): string {
	if (value == null || !Number.isFinite(value)) return '—';
	return String(Math.round(value));
}

export function formatDirectorySeoDelta(value: number | null | undefined): string {
	if (value == null || !Number.isFinite(value)) return '';
	const sign = value > 0 ? '+' : '';
	return `${sign}${value}`;
}
