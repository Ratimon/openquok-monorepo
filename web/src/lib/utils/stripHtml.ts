/**
 * Produces plain text for previews and length checks. Avoids DOM on the server.
 */
export function stripHtmlToPlainText(input: string): string {
	const s = input.replace(/<[^>]*>/g, ' ');
	return s.replace(/\s+/g, ' ').trim();
}
