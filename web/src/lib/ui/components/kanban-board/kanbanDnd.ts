import type { PostKanbanColumnId } from './kanbanTypes';

export const KANBAN_CARD_DRAG_MIME = 'application/x-openquok-kanban-card';

export type KanbanCardDragPayload = {
	postId: string;
	postGroup: string;
	sourceColumn: PostKanbanColumnId;
};

export function serializeKanbanCardDrag(payload: KanbanCardDragPayload): string {
	return JSON.stringify(payload);
}

function parsePayloadJson(raw: string): KanbanCardDragPayload | null {
	try {
		const parsed = JSON.parse(raw) as KanbanCardDragPayload;
		if (
			typeof parsed.postId === 'string' &&
			parsed.postId &&
			typeof parsed.postGroup === 'string' &&
			parsed.postGroup &&
			(parsed.sourceColumn === 'draft' ||
				parsed.sourceColumn === 'scheduled' ||
				parsed.sourceColumn === 'published')
		) {
			return parsed;
		}
	} catch {
		return null;
	}
	return null;
}

export function parseKanbanCardDrag(
	dataTransfer: DataTransfer | null,
	fallback?: KanbanCardDragPayload | null
): KanbanCardDragPayload | null {
	if (fallback) return fallback;
	if (!dataTransfer) return null;
	const raw =
		dataTransfer.getData(KANBAN_CARD_DRAG_MIME) || dataTransfer.getData('text/plain');
	if (!raw) return null;
	return parsePayloadJson(raw);
}

/** Published is terminal; only draft ↔ scheduled moves are allowed. */
export function canMoveKanbanCard(
	source: PostKanbanColumnId,
	target: PostKanbanColumnId
): boolean {
	if (source === target) return false;
	if (source === 'published' || target === 'published') return false;
	return (
		(source === 'draft' && target === 'scheduled') || (source === 'scheduled' && target === 'draft')
	);
}

export function columnToApiStatus(column: PostKanbanColumnId): 'draft' | 'scheduled' | null {
	if (column === 'draft') return 'draft';
	if (column === 'scheduled') return 'scheduled';
	return null;
}
