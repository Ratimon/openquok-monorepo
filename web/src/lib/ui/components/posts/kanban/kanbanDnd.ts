import type { PostKanbanColumnId } from '$lib/posts/PostKanbanBoard.presenter.svelte';

export const KANBAN_CARD_DRAG_MIME = 'application/x-openquok-kanban-card';

export type KanbanCardDragPayload = {
	postId: string;
	postGroup: string;
	sourceColumn: PostKanbanColumnId;
	needsManualFinishInApp?: boolean;
	isReviewed?: boolean;
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
			return {
				postId: parsed.postId,
				postGroup: parsed.postGroup,
				sourceColumn: parsed.sourceColumn,
				needsManualFinishInApp: parsed.needsManualFinishInApp === true,
				isReviewed: parsed.isReviewed === true
			};
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

export type KanbanCardMoveContext = Pick<
	KanbanCardDragPayload,
	'needsManualFinishInApp' | 'isReviewed'
>;

/** Draft ↔ scheduled; reviewed manual-finish posts may move scheduled → published. */
export function canMoveKanbanCard(
	source: PostKanbanColumnId,
	target: PostKanbanColumnId,
	ctx?: KanbanCardMoveContext
): boolean {
	if (source === target) return false;
	if (source === 'published') return false;
	if (target === 'published') {
		return (
			source === 'scheduled' &&
			ctx?.needsManualFinishInApp === true &&
			ctx?.isReviewed === true
		);
	}
	if (ctx?.needsManualFinishInApp && source === 'scheduled') return false;
	return (
		(source === 'draft' && target === 'scheduled') || (source === 'scheduled' && target === 'draft')
	);
}

export function kanbanMoveBlockedMessage(
	source: PostKanbanColumnId,
	target: PostKanbanColumnId,
	ctx?: KanbanCardMoveContext
): string {
	if (source === 'published') {
		return 'Published posts cannot be moved on the board.';
	}
	if (target === 'published') {
		if (ctx?.needsManualFinishInApp && !ctx?.isReviewed) {
			return 'Mark this post as reviewed before moving it to Published.';
		}
		return 'Only reviewed inbox or private-draft posts can be moved to Published.';
	}
	return 'This column change is not allowed.';
}

export function columnToApiStatus(column: PostKanbanColumnId): 'draft' | 'scheduled' | null {
	if (column === 'draft') return 'draft';
	if (column === 'scheduled') return 'scheduled';
	return null;
}
