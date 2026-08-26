/** Per-channel composer caption mode from the connected integration catalog (`SocialProvider.editor`). */
export type IntegrationEditorMode = 'none' | 'normal' | 'markdown' | 'html';

export const INTEGRATION_EDITOR_MODES: readonly IntegrationEditorMode[] = [
	'none',
	'normal',
	'markdown',
	'html'
];

/** Coerce API/catalog strings to a known editor mode (unknown → `normal`). */
export function normalizeIntegrationEditorMode(
	value: string | null | undefined
): IntegrationEditorMode {
	const v = (value ?? '').trim().toLowerCase();
	if (v === 'none' || v === 'normal' || v === 'markdown' || v === 'html') {
		return v;
	}
	return 'normal';
}
