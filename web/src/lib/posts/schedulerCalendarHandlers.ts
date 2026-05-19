type OpenActionsHandler = (
	postGroup: string | null,
	focusPostId?: string,
	focusIntegrationId?: string,
	createAtIso?: string
) => void;

const handlers = {
	editPostGroup: null as ((postGroup: string) => void) | null,
	openActions: null as OpenActionsHandler | null,
	refresh: null as (() => void) | null
};

/**
 * Schedule-X can mount event components outside the parent Svelte tree (portal),
 * which breaks `setContext/getContext`. This bus lets the calendar register handlers
 * that event UI can invoke reliably.
 */
export function registerEditPostGroupHandler(next: ((postGroup: string) => void) | null): void {
	handlers.editPostGroup = next;
}

export function triggerEditPostGroup(postGroup: string): void {
	if (!postGroup) return;
	handlers.editPostGroup?.(postGroup);
}

export function registerOpenActionsForPostGroupHandler(next: OpenActionsHandler | null): void {
	handlers.openActions = next;
}

export function triggerOpenActionsForPostGroup(
	postGroup: string,
	focusPostId?: string,
	focusIntegrationId?: string,
	createAtIso?: string
): void {
	if (!postGroup) return;
	handlers.openActions?.(postGroup, focusPostId, focusIntegrationId, createAtIso);
}

export function triggerOpenSlotActions(createAtIso: string): void {
	if (!createAtIso) return;
	handlers.openActions?.(null, undefined, undefined, createAtIso);
}

export function registerRefreshCalendarHandler(next: (() => void) | null): void {
	handlers.refresh = next;
}

export function triggerRefreshCalendar(): void {
	handlers.refresh?.();
}
