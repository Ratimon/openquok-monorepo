import { trimFormField } from '$lib/utils/trimFormField';

const SUFFIX_MULTIPLIERS: Record<string, number> = {
	b: 1_000_000_000,
	bn: 1_000_000_000,
	billion: 1_000_000_000,
	m: 1_000_000,
	mn: 1_000_000,
	million: 1_000_000,
	k: 1_000,
	thousand: 1_000
};

function trimTrailingZeros(value: number, fractionDigits: number): string {
	return value
		.toFixed(fractionDigits)
		.replace(/(\.\d*?)0+$/, '$1')
		.replace(/\.$/, '');
}

/** Human-readable monthly visits for the secret-admin site editor (e.g. 1_210_000_000 → "1.21 billion"). */
export function formatMonthlyVisitsEditorDisplay(visits: number): string {
	if (!Number.isFinite(visits) || visits < 0) return '';

	if (visits >= 1_000_000_000) {
		return `${trimTrailingZeros(visits / 1_000_000_000, 2)} billion`;
	}
	if (visits >= 1_000_000) {
		return `${trimTrailingZeros(visits / 1_000_000, 2)} million`;
	}
	if (visits >= 1_000) {
		return `${trimTrailingZeros(visits / 1_000, 2)} thousand`;
	}

	return visits.toLocaleString('en-US');
}

/**
 * Parse admin monthly visits: `1,210,000,000`, `520000000`, `1.21 billion`, `0.52B`, `520M`.
 * Returns a non-negative integer or null when empty / invalid.
 */
export function parseMonthlyVisitsFormField(value: unknown): number | null {
	const raw = trimFormField(value);
	if (!raw) return null;

	const normalized = raw.toLowerCase().replace(/\s+/g, ' ').trim();
	const suffixed = normalized.match(/^([\d,._]+)\s*(b|bn|billion|m|mn|million|k|thousand)$/);
	if (suffixed) {
		const numeric = Number.parseFloat(suffixed[1].replace(/[,_]/g, ''));
		const multiplier = SUFFIX_MULTIPLIERS[suffixed[2]];
		if (!Number.isFinite(numeric) || numeric < 0) return null;
		return Math.round(numeric * multiplier);
	}

	const digitsOnly = normalized.replace(/[,_\s]/g, '');
	if (!/^\d+$/.test(digitsOnly)) return null;

	const parsed = Number.parseInt(digitsOnly, 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function formatMonthlyVisitsEditorExactHint(visits: number | null): string | null {
	if (visits == null || !Number.isFinite(visits)) return null;
	return `${visits.toLocaleString('en-US')} visits/month`;
}
