import type { IntegrationEditorMode } from '$lib/integrations/integrationEditorMode';
import { plainTextToComposerHtml } from '$lib/ui/components/posts/composer-editor/plainTextToComposerHtml';
import { stripHtmlToPlainText } from '$lib/utils/plainTextFromHtml';

/**
 * Normalize stored composer body for the target editor mode on load or persist.
 * Standard modes get plain text; rich modes get TipTap-ready HTML.
 */
export function composerBodyForEditorMode(
	mode: IntegrationEditorMode,
	body: string
): string {
	const raw = typeof body === 'string' ? body : '';

	switch (mode) {
		case 'none':
		case 'normal':
			return stripHtmlToPlainText(raw);
		case 'markdown':
		case 'html':
			return plainTextToComposerHtml(raw);
		default:
			return stripHtmlToPlainText(raw);
	}
}
