import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

/** Plain text for docs HowTo JSON-LD from MDX / markdown step bodies. */
export function docsStepBodyToPlainText(body: string): string {
	let text = body.trim();
	if (!text) return '';

	text = text.replace(/```[\s\S]*?```/g, '');
	text = text.replace(/<Badge\s+[^>]*\btext=(?:"([^"]*)"|'([^']*)')[^>]*\/>/gi, (_, a, b) => a ?? b ?? '');
	text = text.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*\/>/g, '');
	text = text.replace(/<[A-Z][A-Za-z0-9]*\b[^>]*>[\s\S]*?<\/[A-Z][A-Za-z0-9]*>/g, '');
	text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
	text = text.replace(/\*([^*]+)\*/g, '$1');
	text = text.replace(/^\s*[-*]\s+/gm, '• ');
	text = stripHtmlToPlainText(text);

	return text.replace(/\n{3,}/g, '\n\n').trim();
}
