/**
 * Estimate reading time from markdown-ish text (code and HTML stripped).
 */
export function calculateReadingTime(content: string): string {
	let stripped = content.replace(/```[\s\S]*?```/g, '');
	stripped = stripped.replace(/`[^`]*`/g, '');
	stripped = stripped.replace(/<[^>]*>/g, '');
	const words = stripped.split(/\s+/).filter((word) => word.length > 0);
	const minutes = Math.max(1, Math.ceil(words.length / 200));
	return `${minutes} min read`;
}
