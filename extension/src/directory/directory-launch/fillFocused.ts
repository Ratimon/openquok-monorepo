import type { AutoLaunchFocusedFillMode, LaunchStepFieldFillMode } from 'openquok-common';

import { fillElementByMode } from './fillEngine.js';

const PANEL_HOST_ID = 'openquok-directory-launch-host';
const FILE_INPUT_HINT =
	'File uploads cannot use focused fill — use Fill step or Fill all in the step rail for logo and gallery fields.';

export type FillFocusedInput = {
	values: string[];
	fillMode: AutoLaunchFocusedFillMode;
	profilePath?: string;
};

export type FillFocusedResult = { ok: boolean; error?: string };

function isInsideOpenQuokPanel(node: Element): boolean {
	let current: Node | null = node;
	while (current) {
		if (current instanceof HTMLElement && current.id === PANEL_HOST_ID) {
			return true;
		}
		const root = current.getRootNode();
		if (root instanceof ShadowRoot) {
			const host = root.host;
			if (host instanceof HTMLElement && host.id === PANEL_HOST_ID) {
				return true;
			}
		}
		current = current.parentNode;
	}
	return false;
}

function isFillableControl(element: Element): boolean {
	if (element instanceof HTMLInputElement) {
		return (
			element.type !== 'hidden' &&
			element.type !== 'submit' &&
			element.type !== 'button' &&
			element.type !== 'reset'
		);
	}
	if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
		return true;
	}
	if (element instanceof HTMLElement) {
		if (element.isContentEditable) return true;
		if (element.matches('.ProseMirror, .tiptap, [contenteditable="true"]')) return true;
		if (element.getAttribute('role') === 'combobox') return true;
	}
	return false;
}

export function resolveFocusedElement(): Element | null {
	const active = document.activeElement;
	if (!active || !(active instanceof Element)) return null;
	if (active instanceof HTMLBodyElement || active.tagName === 'HTML') return null;

	if (isFillableControl(active)) return active;

	const nested = active.querySelector(
		'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select, [contenteditable="true"], .ProseMirror, .tiptap, [role="combobox"]'
	);
	if (nested) return nested;

	let parent = active.parentElement;
	while (parent) {
		if (isFillableControl(parent)) return parent;
		parent = parent.parentElement;
	}

	return null;
}

export function inferFocusedFillMode(element: Element): LaunchStepFieldFillMode {
	if (element instanceof HTMLSelectElement) return 'select';

	if (element instanceof HTMLInputElement) {
		if (element.type === 'checkbox' || element.type === 'radio') return 'boolean';
	}

	const role = element.getAttribute('role');
	if (role === 'switch' || role === 'checkbox') return 'boolean';

	const richTarget =
		element.matches('.ProseMirror, .tiptap, [contenteditable="true"]') ||
		Boolean(
			element.querySelector('.ProseMirror, .tiptap, [contenteditable="true"]')
		);
	if (richTarget) return 'rich_html';

	if (element instanceof HTMLElement && element.isContentEditable) return 'rich_html';

	const comboboxRoot =
		element.closest('[role="combobox"]') ??
		(element.getAttribute('role') === 'combobox' ? element : null);

	if (comboboxRoot) {
		if (comboboxRoot.getAttribute('aria-multiselectable') === 'true') return 'tags';
		if (comboboxRoot.querySelector('[class*="tag"], [data-tag], [class*="chip"]')) {
			return 'tags';
		}
		return 'select';
	}

	if (
		element instanceof HTMLInputElement &&
		(element.getAttribute('aria-multiselectable') === 'true' || element.multiple)
	) {
		return 'tags';
	}

	return 'text';
}

export function formatValuesForFillMode(
	values: string[],
	fillMode: LaunchStepFieldFillMode
): string {
	const trimmed = values.map((value) => value.trim()).filter(Boolean);
	if (trimmed.length === 0) return '';

	switch (fillMode) {
		case 'tags':
			return trimmed.join(',');
		case 'rich_html':
			if (trimmed.length === 1) return trimmed[0];
			return trimmed.map((value) => `<p>${value}</p>`).join('');
		case 'boolean':
		case 'select':
			return trimmed[0];
		case 'file':
		case 'files':
			return trimmed[0];
		default:
			return trimmed.length === 1 ? trimmed[0] : trimmed.join(', ');
	}
}

function resolveEffectiveFillMode(
	element: Element,
	requested: AutoLaunchFocusedFillMode
): LaunchStepFieldFillMode {
	if (requested !== 'auto') {
		if (requested === 'file' || requested === 'files') return requested;
		return requested;
	}
	return inferFocusedFillMode(element);
}

export async function executeFillFocused(input: FillFocusedInput): Promise<FillFocusedResult> {
	const element = resolveFocusedElement();
	if (!element) {
		return {
			ok: false,
			error: 'Click a field on the directory page first, then fill from the side panel.',
		};
	}

	if (isInsideOpenQuokPanel(element)) {
		return {
			ok: false,
			error: 'Focus a directory form field, not the OpenQuok step panel.',
		};
	}

	if (element instanceof HTMLInputElement && element.type === 'file') {
		return { ok: false, error: FILE_INPUT_HINT };
	}

	const effectiveMode = resolveEffectiveFillMode(element, input.fillMode);
	if (effectiveMode === 'file' || effectiveMode === 'files') {
		return { ok: false, error: FILE_INPUT_HINT };
	}

	const payload = formatValuesForFillMode(input.values, effectiveMode);
	if (!payload) {
		return { ok: false, error: 'No values selected to fill.' };
	}

	const filled = await fillElementByMode(element, payload, effectiveMode);
	if (!filled) {
		return {
			ok: false,
			error: 'Could not set the value for the focused control.',
		};
	}

	return { ok: true };
}
