import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createComposerTextHistory } from '$lib/posts/utils/composerTextHistory';

const empty = { text: '', selectionStart: 0, selectionEnd: 0 };
const snap = (text: string) => ({
	text,
	selectionStart: text.length,
	selectionEnd: text.length
});

describe('createComposerTextHistory', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('starts with a single snapshot after clear', () => {
		const history = createComposerTextHistory();
		history.clear(empty);
		expect(history.peek()).toEqual(empty);
		expect(history.canUndo()).toBe(false);
		expect(history.canRedo()).toBe(false);
	});

	it('groups rapid typing within 100ms into one undo step', () => {
		const history = createComposerTextHistory({ groupDelayMs: 100 });
		history.clear(empty);

		history.recordTyping(snap('h'));
		history.recordTyping(snap('hi'));
		vi.advanceTimersByTime(50);
		history.recordTyping(snap('hel'));

		expect(history.peek()?.text).toBe('hel');
		expect(history.canUndo()).toBe(true);

		const undone = history.undo();
		expect(undone).toEqual(empty);
		expect(history.canRedo()).toBe(true);
	});

	it('starts a new typing group after the group delay elapses', () => {
		const history = createComposerTextHistory({ groupDelayMs: 100 });
		history.clear(empty);

		history.recordTyping(snap('hi'));
		vi.advanceTimersByTime(100);
		history.recordTyping(snap('hi!'));

		expect(history.canUndo()).toBe(true);
		history.undo();
		expect(history.peek()?.text).toBe('hi');
		history.undo();
		expect(history.peek()).toEqual(empty);
	});

	it('truncates redo tail on a new mutation', () => {
		const history = createComposerTextHistory();
		history.clear(empty);
		history.recordMutation(empty, snap('draft'));
		history.undo();
		expect(history.canRedo()).toBe(true);

		history.recordMutation(empty, snap('new'));
		expect(history.canRedo()).toBe(false);
		expect(history.peek()?.text).toBe('new');
	});

	it('caps the stack at maxEntries', () => {
		const history = createComposerTextHistory({ maxEntries: 3, groupDelayMs: 0 });
		history.clear(snap('0'));
		vi.advanceTimersByTime(1);

		for (let i = 1; i <= 5; i++) {
			history.recordTyping(snap(String(i)));
			vi.advanceTimersByTime(1);
		}

		let steps = 0;
		while (history.canUndo()) {
			history.undo();
			steps++;
		}
		expect(steps).toBeLessThanOrEqual(2);
	});

	it('recordBeforeMutation and recordAfterMutation capture toolbar-style edits', () => {
		const history = createComposerTextHistory();
		history.clear(snap('plain'));

		history.recordBeforeMutation(snap('plain'));
		history.recordAfterMutation(snap('𝗽𝗹𝗮𝗶𝗻'));

		expect(history.canUndo()).toBe(true);
		const undone = history.undo();
		expect(undone?.text).toBe('plain');
	});
});
