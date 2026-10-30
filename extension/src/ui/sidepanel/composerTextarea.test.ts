import { describe, expect, it } from 'vitest';

import { insertAtTextareaCursor, wrapTextareaSelection } from './composerTextarea.js';

function textareaWith(value: string, start: number, end: number): HTMLTextAreaElement {
	const el = document.createElement('textarea');
	el.value = value;
	el.selectionStart = start;
	el.selectionEnd = end;
	return el;
}

describe('composerTextarea', () => {
	it('insertAtTextareaCursor inserts at the caret', () => {
		const el = textareaWith('Hello world', 5, 5);
		insertAtTextareaCursor(el, ',');
		expect(el.value).toBe('Hello, world');
		expect(el.selectionStart).toBe(6);
	});

	it('wrapTextareaSelection wraps the selection', () => {
		const el = textareaWith('Hello world', 0, 5);
		wrapTextareaSelection(el, '**', '**');
		expect(el.value).toBe('**Hello** world');
	});
});
