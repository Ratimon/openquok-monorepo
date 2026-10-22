import type {
	AutoLaunchProfileSnapshot,
	FieldFillResult,
	LaunchStep,
	LaunchStepField,
	LaunchStepFieldFillMode,
} from 'openquok-common';

import { fetchProfileMediaFile } from './profileMediaFetch.js';
import { resolveProfileStoragePathList, resolveProfileValue } from './profileValues.js';

export type FillLaunchContext = {
	dashboardOrigin: string;
};

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

function queryFileInputs(selectorHint?: string): HTMLInputElement[] {
	const results: HTMLInputElement[] = [];
	const seen = new Set<HTMLInputElement>();
	const parts = selectorHint?.trim()
		? selectorHint.split(',').map((part) => part.trim()).filter(Boolean)
		: ['input[type="file"]'];
	for (const selector of parts) {
		try {
			for (const el of document.querySelectorAll(selector)) {
				if (el instanceof HTMLInputElement && el.type === 'file' && !seen.has(el)) {
					seen.add(el);
					results.push(el);
				}
			}
		} catch {
			/* invalid selector */
		}
	}
	return results;
}

function defaultFileInputIndex(field: LaunchStepField, fillMode: LaunchStepFieldFillMode): number {
	if (field.fileInputIndex !== undefined) return field.fileInputIndex;
	if (fillMode === 'files' || field.profilePath.includes('gallery_urls')) return 1;
	return 0;
}

function resolveFileInput(field: LaunchStepField, fillMode: LaunchStepFieldFillMode): HTMLInputElement | null {
	const index = defaultFileInputIndex(field, fillMode);
	const fromHint = queryFileInputs(field.selectorHint);
	if (fromHint[index]) return fromHint[index];
	if (index === 0 && fromHint[0]) return fromHint[0];
	const all = Array.from(document.querySelectorAll('input[type="file"]')).filter(
		(el): el is HTMLInputElement => el instanceof HTMLInputElement
	);
	return all[index] ?? null;
}

function asFileList(files: File[]): FileList {
	const list = {
		length: files.length,
		item(index: number) {
			return files[index] ?? null;
		},
		*[Symbol.iterator]() {
			for (const file of files) yield file;
		},
	} as FileList;
	return list;
}

function assignFilesToInput(input: HTMLInputElement, files: File[]): boolean {
	if (files.length === 0) return false;
	if (typeof DataTransfer !== 'undefined') {
		const transfer = new DataTransfer();
		for (const file of files) {
			transfer.items.add(file);
		}
		input.files = transfer.files;
	} else {
		Object.defineProperty(input, 'files', {
			configurable: true,
			value: asFileList(files),
		});
	}
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.dispatchEvent(new Event('change', { bubbles: true }));
	return true;
}

function isFileFillMode(fillMode: LaunchStepFieldFillMode | undefined): boolean {
	return fillMode === 'file' || fillMode === 'files';
}

function resolveFillMode(field: LaunchStepField): LaunchStepFieldFillMode {
	if (field.fillMode) return field.fillMode;
	if (field.profilePath === 'logo_url') return 'file';
	if (field.profilePath.includes('gallery_urls')) return 'files';
	return 'text';
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

async function fillFileLaunchField(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField,
	context: FillLaunchContext
): Promise<FieldFillResult> {
	const paths = resolveProfileStoragePathList(snapshot, field.profilePath);
	if (paths.length === 0) {
		return { key: field.key, label: field.label, status: 'not_in_profile' };
	}

	const fillMode = resolveFillMode(field);
	const input = resolveFileInput(field, fillMode);
	if (!input) {
		return {
			key: field.key,
			label: field.label,
			status: 'not_found',
			message: 'File input not found on this page.',
		};
	}

	const pathsToLoad = fillMode === 'files' ? paths : [paths[0]];
	const files: File[] = [];

	for (const path of pathsToLoad) {
		const file = await fetchProfileMediaFile(context.dashboardOrigin, path);
		if (file) files.push(file);
	}

	if (files.length === 0) {
		return {
			key: field.key,
			label: field.label,
			status: 'error',
			message: 'Could not download image from OpenQuok.',
		};
	}

	const assigned = assignFilesToInput(input, files);
	if (!assigned) {
		return {
			key: field.key,
			label: field.label,
			status: 'error',
			message: 'Could not attach file to the upload control.',
		};
	}

	return { key: field.key, label: field.label, status: 'found' };
}

export async function fillLaunchField(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField,
	context?: FillLaunchContext
): Promise<FieldFillResult> {
	const fillMode = resolveFillMode(field);

	if (isFileFillMode(fillMode)) {
		if (!context?.dashboardOrigin?.trim()) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message: 'OpenQuok dashboard origin missing — restart launch from OpenQuok.',
			};
		}
		return fillFileLaunchField(snapshot, field, {
			dashboardOrigin: context.dashboardOrigin.trim(),
		});
	}

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
			message: 'Set fillMode to "file" or "files" for upload fields.',
		};
	}

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

export async function fillLaunchStep(
	snapshot: AutoLaunchProfileSnapshot,
	step: LaunchStep,
	context?: FillLaunchContext
): Promise<FieldFillResult[]> {
	const fields = step.fields ?? [];
	const results: FieldFillResult[] = [];
	for (const field of fields) {
		results.push(await fillLaunchField(snapshot, field, context));
	}
	return results;
}

export function countFilled(results: FieldFillResult[]): { filled: number; total: number } {
	const total = results.length;
	const filled = results.filter((r) => r.status === 'found' || r.status === 'skipped').length;
	return { filled, total };
}
