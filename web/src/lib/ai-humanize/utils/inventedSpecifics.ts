export type HumanizeInventedKind = 'name' | 'date' | 'price';

export type HumanizeInventedSpecific = {
	kind: HumanizeInventedKind;
	value: string;
	note: string;
};

const PRICE_RE =
	/(?:USD|EUR|GBP|\$|€|£)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\b\d+(?:\.\d{2})?\s?(?:dollars|usd|euros)\b/gi;

const MONTHS =
	'January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec';

const DATE_RE = new RegExp(
	`\\b(?:(?:${MONTHS})\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,\\s*\\d{4})?|\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})(?:,?\\s*\\d{4})?|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}/\\d{1,2}/\\d{2,4})\\b`,
	'gi'
);

/** Two-or-more Title Case tokens, e.g. “Jordan Hale”. Skips single sentence-start words. */
const NAME_RE = /\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})+\b/g;

function collect(text: string, pattern: RegExp): string[] {
	const values: string[] = [];
	const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
	let match: RegExpExecArray | null;
	while ((match = re.exec(text)) !== null) {
		const value = match[0].trim();
		if (value) values.push(value);
		if (match[0].length === 0) re.lastIndex += 1;
	}
	return values;
}

function normalizedSet(values: readonly string[]): Set<string> {
	return new Set(values.map((value) => value.toLowerCase().replace(/\s+/g, ' ').trim()));
}

function extras(
	kind: HumanizeInventedKind,
	sourceValues: readonly string[],
	rewriteValues: readonly string[],
	noteFor: (value: string) => string
): HumanizeInventedSpecific[] {
	const known = normalizedSet(sourceValues);
	const seen = new Set<string>();
	const out: HumanizeInventedSpecific[] = [];
	for (const value of rewriteValues) {
		const key = value.toLowerCase().replace(/\s+/g, ' ').trim();
		if (!key || known.has(key) || seen.has(key)) continue;
		seen.add(key);
		out.push({ kind, value, note: noteFor(value) });
	}
	return out;
}

/**
 * Specifics that appear in the rewrite but not the source — names, dates, prices
 * the user may want to swap for real details (especially after Roughen).
 */
export function findInventedSpecifics(
	source: string,
	rewritten: string
): HumanizeInventedSpecific[] {
	const src = source ?? '';
	const next = rewritten ?? '';
	if (!next.trim()) return [];

	return [
		...extras('price', collect(src, PRICE_RE), collect(next, PRICE_RE), (value) =>
			`Possible invented price: ${value}. Review before you post.`
		),
		...extras('date', collect(src, DATE_RE), collect(next, DATE_RE), (value) =>
			`Possible invented date: ${value}. Review before you post.`
		),
		...extras('name', collect(src, NAME_RE), collect(next, NAME_RE), (value) =>
			`Possible invented name: ${value}. Swap in a real detail if this isn’t yours.`
		)
	];
}
