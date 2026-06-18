function parsePostSettingsJson(settings: string | null | undefined): Record<string, unknown> | null {
	if (!settings?.trim()) return null;
	try {
		const parsed: unknown = JSON.parse(settings);
		return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : null;
	} catch {
		return null;
	}
}

/** User dragged a manual-finish post to Published on the kanban (stored in `posts.settings`). */
export function isKanbanManualFinishAcknowledged(settings: string | null | undefined): boolean {
	const root = parsePostSettingsJson(settings);
	return root?.kanbanManualFinishAcknowledged === true;
}

export function withKanbanManualFinishAcknowledged(settings: string | null | undefined): string {
	const root = parsePostSettingsJson(settings) ?? {};
	return JSON.stringify({ ...root, kanbanManualFinishAcknowledged: true });
}
