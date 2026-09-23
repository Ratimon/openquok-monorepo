/**
 * Estimate reading time from markdown-ish or HTML text (code fences and tags stripped).
 */
export function calculateReadingTimeMinutes(content: string): number {
	let stripped = content.replace(/```[\s\S]*?```/g, '');
	stripped = stripped.replace(/`[^`]*`/g, '');
	stripped = stripped.replace(/<[^>]*>/g, '');
	const words = stripped.split(/\s+/).filter((word) => word.length > 0);
	return Math.max(1, Math.ceil(words.length / 200));
}

/**
 * Estimate reading time from markdown-ish text (code and HTML stripped).
 */
export function calculateReadingTime(content: string): string {
	return `${calculateReadingTimeMinutes(content)} min read`;
}
