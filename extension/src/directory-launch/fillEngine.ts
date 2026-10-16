import type {
	AutoLaunchProfileSnapshot,
	FieldFillResult,
	LaunchStep,
	LaunchStepField,
	LaunchStepFieldFillMode,
} from 'openquok-common';

import { resolveProfileValue } from './profileValues.js';

function stripHtmlToPlainText(html: string): string {
	return html
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/(?:p|div|li|h[1-6])>/gi, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/[ \t]+\n/g, '\n')
		.replace(/[ \t]{2,}/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function queryFieldElement(selectorHint?: string): Element | null {
	if (!selectorHint?.trim()) return null;
	const parts = selectorHint.split(',').map((part) => part.trim()).filter(Boolean);
	for (const selector of parts) {
		try {
			const el = document.querySelector(selector);
			if (el) return el;
		} catch {
			/* invalid selector */
		}
	}
	return null;
}

function setNativeInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
	const proto =
		element instanceof HTMLTextAreaElement
			? HTMLTextAreaElement.prototype
			: HTMLInputElement.prototype;
	const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
	const setter = descriptor?.set;
	if (setter) {
		setter.call(element, value);
	} else {
		element.value = value;
	}
	element.dispatchEvent(new Event('input', { bubbles: true }));
	element.dispatchEvent(new Event('change', { bubbles: true }));
}

function parseBooleanValue(value: string): boolean {
	const normalized = value.trim().toLowerCase();
	return normalized === 'true' || normalized === '1' || normalized === 'yes';
}

function parseTagList(value: string): string[] {
	return value
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean);
}

function optionMatchesValue(optionText: string, optionValue: string, value: string): boolean {
	const normalized = value.trim().toLowerCase();
	if (!normalized) return false;
	const val = optionValue.trim().toLowerCase();
	const text = optionText.trim().toLowerCase();
	return (
		val === normalized ||
		text === normalized ||
		text.includes(normalized) ||
		normalized.includes(text)
	);
}

function fillNativeSelect(element: HTMLSelectElement, value: string): boolean {
	for (const option of Array.from(element.options)) {
		if (optionMatchesValue(option.textContent ?? '', option.value, value)) {
			element.value = option.value;
			element.dispatchEvent(new Event('change', { bubbles: true }));
			return true;
		}
	}
	return false;
}

function fillCombobox(element: HTMLElement, value: string): boolean {
	element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
	element.click();
	const options = document.querySelectorAll('[role="option"]');
	for (const option of Array.from(options)) {
		const text = option.textContent ?? '';
		const optionValue =
			option instanceof HTMLOptionElement
				? option.value
				: (option.getAttribute('data-value') ?? text);
		if (optionMatchesValue(text, optionValue, value)) {
			(option as HTMLElement).click();
			return true;
		}
	}
	return false;
}

function fillSelectControl(element: Element, value: string): boolean {
	if (element instanceof HTMLSelectElement) {
		return fillNativeSelect(element, value);
	}
	if (element instanceof HTMLElement && element.getAttribute('role') === 'combobox') {
		return fillCombobox(element, value);
	}
	const nestedSelect = element.querySelector('select');
	if (nestedSelect) {
		return fillNativeSelect(nestedSelect, value);
	}
	return fillTextControl(element, value);
}

function fillBooleanControl(element: Element, value: string): boolean {
	const desired = parseBooleanValue(value);

	if (element instanceof HTMLInputElement) {
		if (element.type === 'checkbox' || element.type === 'radio') {
			if (element.checked !== desired) {
				element.click();
			} else {
				element.dispatchEvent(new Event('change', { bubbles: true }));
			}
			return true;
		}
	}

	const role = element.getAttribute('role');
	if (role === 'switch' || role === 'checkbox') {
		const pressed = element.getAttribute('aria-checked') === 'true';
		if (pressed !== desired) {
			(element as HTMLElement).click();
		}
		return true;
	}

	const nestedCheckbox = element.querySelector(
		'input[type="checkbox"], input[type="radio"], [role="switch"], [role="checkbox"]'
	);
	if (nestedCheckbox) {
		return fillBooleanControl(nestedCheckbox, value);
	}

	return false;
}

function findRichHtmlTarget(element: Element): HTMLElement | null {
	if (element instanceof HTMLElement) {
		if (element.matches('.ProseMirror, .tiptap, [contenteditable="true"]')) {
			return element;
		}
		if (element.isContentEditable) {
			return element;
		}
	}
	const nested = element.querySelector<HTMLElement>(
		'.ProseMirror, .tiptap, [contenteditable="true"]'
	);
	return nested ?? null;
}

function fillRichHtmlControl(element: Element, html: string): boolean {
	const target = findRichHtmlTarget(element);
	if (target) {
		target.innerHTML = html;
		target.dispatchEvent(new Event('input', { bubbles: true }));
		target.dispatchEvent(new Event('change', { bubbles: true }));
		return true;
	}

	if (element instanceof HTMLTextAreaElement) {
		setNativeInputValue(element, html);
		return true;
	}

	if (element instanceof HTMLInputElement && element.type !== 'file') {
		setNativeInputValue(element, stripHtmlToPlainText(html));
		return true;
	}

	const plain = stripHtmlToPlainText(html);
	if (plain) {
		return fillTextControl(element, plain);
	}
	return false;
}

function dispatchEnterKey(element: HTMLElement): void {
	for (const type of ['keydown', 'keypress', 'keyup'] as const) {
		element.dispatchEvent(
			new KeyboardEvent(type, { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true })
		);
	}
}

function fillTagsControl(element: Element, value: string): boolean {
	const tags = parseTagList(value);
	if (tags.length === 0) return false;

	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		for (const tag of tags) {
			setNativeInputValue(element, tag);
			dispatchEnterKey(element);
		}
		return true;
	}

	const nestedInput = element.querySelector('input, textarea');
	if (nestedInput instanceof HTMLInputElement || nestedInput instanceof HTMLTextAreaElement) {
		return fillTagsControl(nestedInput, value);
	}

	return fillTextControl(element, tags.join(', '));
}

function fillTextControl(element: Element, value: string): boolean {
	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		if (element.type === 'file') return false;
		setNativeInputValue(element, value);
		return true;
	}
	if (element instanceof HTMLSelectElement) {
		return fillNativeSelect(element, value);
	}
	const editable = element as HTMLElement;
	if (editable.isContentEditable) {
		editable.textContent = value;
		editable.dispatchEvent(new Event('input', { bubbles: true }));
		return true;
	}
	return false;
}

function fillByMode(
	element: Element,
	value: string,
	fillMode: LaunchStepFieldFillMode
): boolean {
	switch (fillMode) {
		case 'select':
			return fillSelectControl(element, value);
		case 'boolean':
			return fillBooleanControl(element, value);
		case 'rich_html':
			return fillRichHtmlControl(element, value);
		case 'tags':
			return fillTagsControl(element, value);
		default:
			return fillTextControl(element, value);
	}
}

export function fillLaunchField(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField
): FieldFillResult {
	const value = resolveProfileValue(snapshot, field.profilePath);
	if (value === null || value === undefined) {
		return { key: field.key, label: field.label, status: 'not_in_profile' };
	}

	const element = queryFieldElement(field.selectorHint);
	if (!element) {
		return {
			key: field.key,
			label: field.label,
			status: 'not_found',
			message: 'Field not found on this page.',
		};
	}

	if (element instanceof HTMLInputElement && element.type === 'file') {
		return {
			key: field.key,
			label: field.label,
			status: 'skipped',
			message: 'File uploads must be added manually.',
		};
	}

	const fillMode = field.fillMode ?? 'text';

	try {
		const filled = fillByMode(element, value, fillMode);
		if (!filled) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message: 'Could not set value for this control.',
			};
		}
		return { key: field.key, label: field.label, status: 'found' };
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Fill failed.';
		return { key: field.key, label: field.label, status: 'error', message };
	}
}

export function fillLaunchStep(
	snapshot: AutoLaunchProfileSnapshot,
	step: LaunchStep
): FieldFillResult[] {
	const fields = step.fields ?? [];
	return fields.map((field) => fillLaunchField(snapshot, field));
}

export function countFilled(results: FieldFillResult[]): { filled: number; total: number } {
	const total = results.length;
	const filled = results.filter((r) => r.status === 'found' || r.status === 'skipped').length;
	return { filled, total };
}
