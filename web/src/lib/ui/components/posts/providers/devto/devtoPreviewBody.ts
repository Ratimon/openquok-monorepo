import { markdownToHtml } from '$lib/listings/utils/listingMarkdown';

/** Render Dev.to article body markdown as HTML for the post preview card. */
export function renderDevtoPreviewBodyHtml(markdown: string): string {
	const trimmed = markdown.trim();
	if (!trimmed) return '';
	return markdownToHtml(trimmed);
}
