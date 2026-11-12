import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	executeFillFocused,
	formatValuesForFillMode,
	inferFocusedFillMode,
	resolveFocusedElement,
} from './fillFocused.js';

describe('fillFocused helpers', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('formats tag values as a comma-separated list', () => {
		expect(formatValuesForFillMode(['SaaS', ' AI '], 'tags')).toBe('SaaS,AI');
	});

	it('infers select for native select elements', () => {
		const select = document.createElement('select');
		expect(inferFocusedFillMode(select)).toBe('select');
	});

	it('infers rich_html for contenteditable targets', () => {
		const editor = document.createElement('div');
		editor.setAttribute('contenteditable', 'true');
		expect(inferFocusedFillMode(editor)).toBe('rich_html');
	});

	it('infers text for plain inputs', () => {
		const input = document.createElement('input');
		expect(inferFocusedFillMode(input)).toBe('text');
	});
});

describe('executeFillFocused', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('fills the focused text input', async () => {
		const input = document.createElement('input');
		document.body.appendChild(input);
		input.focus();

		expect(resolveFocusedElement()).toBe(input);

		const result = await executeFillFocused({
			values: ['Hello'],
			fillMode: 'text',
		});

		expect(result.ok).toBe(true);
		expect(input.value).toBe('Hello');
	});

	it('refuses file inputs with a step-rail hint', async () => {
		const input = document.createElement('input');
		input.type = 'file';
		document.body.appendChild(input);
		input.focus();

		const result = await executeFillFocused({
			values: ['logo.png'],
			fillMode: 'auto',
		});

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/step rail/i);
	});

	it('returns an error when nothing is focused', async () => {
		const result = await executeFillFocused({
			values: ['Hello'],
			fillMode: 'text',
		});

		expect(result.ok).toBe(false);
		expect(result.error).toMatch(/click a field/i);
	});
});
