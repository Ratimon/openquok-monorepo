import { HistoryStack } from '$lib/ui/canvas-editor/utils/historyStack';

import type { ComposerTextSnapshot } from '$lib/posts/utils/composerTextareaSnapshot';

export type { ComposerTextSnapshot } from '$lib/posts/utils/composerTextareaSnapshot';
export { snapshotFromTextarea } from '$lib/posts/utils/composerTextareaSnapshot';

const DEFAULT_MAX_ENTRIES = 100;
const DEFAULT_GROUP_DELAY_MS = 100;

function snapshotsEqual(a: ComposerTextSnapshot, b: ComposerTextSnapshot): boolean {
	return (
		a.text === b.text &&
		a.selectionStart === b.selectionStart &&
		a.selectionEnd === b.selectionEnd
	);
}

export type ComposerTextHistory = ReturnType<typeof createComposerTextHistory>;

export function createComposerTextHistory(options?: {
	maxEntries?: number;
	groupDelayMs?: number;
}) {
	const maxEntries = options?.maxEntries ?? DEFAULT_MAX_ENTRIES;
	const groupDelayMs = options?.groupDelayMs ?? DEFAULT_GROUP_DELAY_MS;
	const stack = new HistoryStack<ComposerTextSnapshot>(maxEntries);
	let groupTimer: ReturnType<typeof setTimeout> | undefined;
	let grouping = false;

	function flushDebounced(): void {
		if (groupTimer !== undefined) {
			clearTimeout(groupTimer);
			groupTimer = undefined;
		}
		grouping = false;
	}

	function clear(snapshot: ComposerTextSnapshot): void {
		flushDebounced();
		stack.clear(snapshot);
	}

	/** Debounced typing groups (100ms) — merges rapid keystrokes into one undo step. */
	function recordTyping(snapshot: ComposerTextSnapshot): void {
		if (groupTimer !== undefined) {
			clearTimeout(groupTimer);
		}
		if (!grouping) {
			stack.push(snapshot, snapshotsEqual);
			grouping = true;
		} else if (stack.canUndo()) {
			stack.undo();
			stack.push(snapshot, snapshotsEqual);
		} else {
			stack.push(snapshot, snapshotsEqual);
		}
		groupTimer = setTimeout(() => {
			grouping = false;
			groupTimer = undefined;
		}, groupDelayMs);
	}

	function recordMutation(before: ComposerTextSnapshot, after: ComposerTextSnapshot): void {
		flushDebounced();
		const head = stack.peek();
		if (!head || !snapshotsEqual(head, before)) {
			stack.push(before, snapshotsEqual);
		}
		stack.push(after, snapshotsEqual);
	}

	function recordBeforeMutation(before: ComposerTextSnapshot): void {
		flushDebounced();
		const head = stack.peek();
		if (!head || !snapshotsEqual(head, before)) {
			stack.push(before, snapshotsEqual);
		}
	}

	function recordAfterMutation(after: ComposerTextSnapshot): void {
		flushDebounced();
		stack.push(after, snapshotsEqual);
	}

	return {
		clear,
		recordTyping,
		recordMutation,
		recordBeforeMutation,
		recordAfterMutation,
		flushDebounced,
		canUndo: () => stack.canUndo(),
		canRedo: () => stack.canRedo(),
		undo: () => stack.undo(),
		redo: () => stack.redo(),
		peek: () => stack.peek()
	};
}
