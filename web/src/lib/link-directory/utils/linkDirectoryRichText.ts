import { prepareBlogRichTextForDisplay } from '$lib/blogs/utils/blogContent';

/** Public build-backlinks rich text (site long copy, opportunity intro, step bodies). */
export function prepareLinkDirectoryRichTextForDisplay(content: string): string {
	return prepareBlogRichTextForDisplay(content);
}

/** Hub cards and JSON-LD: strip tags after the same decode/wrap pass used on the public site. */
export function linkDirectoryRichTextToPlainText(content: string): string {
	const trimmed = content.trim();
	if (!trimmed) return '';
	const html = prepareLinkDirectoryRichTextForDisplay(trimmed);
	return html
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<\/p>/gi, ' ')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}
