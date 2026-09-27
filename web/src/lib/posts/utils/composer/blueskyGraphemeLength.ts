/** AT Protocol post text limits (grapheme count and UTF-8 byte length). */
export const BLUESKY_MAX_GRAPHEMES = 300;
export const BLUESKY_MAX_UTF8_BYTES = 3000;

export function blueskyGraphemeLength(text: string): number {
	const input = typeof text === 'string' ? text : '';
	if (input.length === 0) return 0;
	if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
		const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
		let count = 0;
		for (const _ of segmenter.segment(input)) {
			count += 1;
		}
		return count;
	}
	return [...input].length;
}

export function blueskyUtf8ByteLength(text: string): number {
	return new TextEncoder().encode(typeof text === 'string' ? text : '').length;
}

/** Returns a short error fragment (no channel label) when text is over limit. */
export function validateBlueskyCaptionLength(text: string): string | null {
	const graphemes = blueskyGraphemeLength(text);
	if (graphemes > BLUESKY_MAX_GRAPHEMES) {
		return `exceeds the ${BLUESKY_MAX_GRAPHEMES} grapheme limit (${graphemes}/${BLUESKY_MAX_GRAPHEMES}).`;
	}
	const bytes = blueskyUtf8ByteLength(text);
	if (bytes > BLUESKY_MAX_UTF8_BYTES) {
		return `exceeds the ${BLUESKY_MAX_UTF8_BYTES} UTF-8 byte limit (${bytes}/${BLUESKY_MAX_UTF8_BYTES}).`;
	}
	return null;
}
