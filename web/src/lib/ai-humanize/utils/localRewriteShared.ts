import {
	HUMANIZE_CURLY_DOUBLE_QUOTE_RE,
	HUMANIZE_EMOJI_BULLET_RE,
	HUMANIZE_MARKDOWN_FENCE_RE,
	HUMANIZE_MARKDOWN_HEADING_RE
} from '$lib/ai-humanize/constants/locales/en/tells';

export function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function stripMarkdownResidue(text: string): string {
	let next = text.replace(new RegExp(HUMANIZE_MARKDOWN_FENCE_RE.source, 'g'), '');
	next = next.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
	next = next.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/__([^_]+)__/g, '$1');
	next = next.replace(
		new RegExp(HUMANIZE_MARKDOWN_HEADING_RE.source, HUMANIZE_MARKDOWN_HEADING_RE.flags),
		''
	);
	next = next.replace(/`([^`]+)`/g, '$1');
	return next;
}

export function stripEmojiBullets(text: string): string {
	return text.replace(
		new RegExp(HUMANIZE_EMOJI_BULLET_RE.source, HUMANIZE_EMOJI_BULLET_RE.flags),
		''
	);
}

export function flattenCurlyDoubleQuotes(text: string): string {
	return text.replace(new RegExp(HUMANIZE_CURLY_DOUBLE_QUOTE_RE.source, 'g'), '"');
}

export function splitSentences(text: string): string[] {
	const parts = text.match(/[^.!?]+[.!?]*\s*/g);
	if (!parts) return text.trim() ? [text] : [];
	return parts.map((part) => part.trim()).filter(Boolean);
}

export function dropMatchingLastSentence(text: string, phrases: readonly string[]): string {
	const sentences = splitSentences(text);
	if (sentences.length === 0) return text;
	const last = sentences[sentences.length - 1]!.toLowerCase();
	const matches = phrases.some((phrase) => last.includes(phrase));
	if (!matches) return text.trim();
	return sentences.slice(0, -1).join(' ').trim();
}

export function tidyPunctuation(text: string): string {
	return text
		.replace(/\.\s*,\s*/g, '. ')
		.replace(/!\s*,\s*/g, '! ')
		.replace(/\?\s*,\s*/g, '? ')
		.replace(/^[,\s;:]+/gm, '')
		.replace(/\s+,/g, ',')
		.replace(/,(?:,|\s)*,/g, ',');
}

export function collapseWhitespace(text: string): string {
	return text.replace(/[ 	]+\n/g, '\n').replace(/[ 	]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
