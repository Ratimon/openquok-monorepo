/**
 * Resolves provider settings for the post preview column.
 * Prefers the preview channel's integration id; falls back to explicit preview settings.
 */
export function resolvePreviewProviderSettings(
	previewIntegrationId: string | null | undefined,
	byIntegrationId: Record<string, Record<string, unknown>>,
	fallbackPreviewProviderSettings: Record<string, unknown> = {}
): Record<string, unknown> {
	const id = previewIntegrationId?.trim();
	if (id) return byIntegrationId[id] ?? {};
	return fallbackPreviewProviderSettings;
}
