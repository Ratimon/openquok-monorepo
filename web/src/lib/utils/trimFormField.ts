/** Text inputs bind as strings; `type="number"` inputs often bind as numbers — safe trim for forms. */
export function trimFormField(value: unknown): string {
	if (value == null) return '';
	return String(value).trim();
}

export function parseOptionalIntFormField(value: unknown): number | null {
	const trimmed = trimFormField(value);
	if (!trimmed) return null;
	const parsed = Number.parseInt(trimmed, 10);
	return Number.isFinite(parsed) ? parsed : null;
}
