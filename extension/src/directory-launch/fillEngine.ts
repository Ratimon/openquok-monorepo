import type {
	AutoLaunchProfileSnapshot,
	FieldFillResult,
	LaunchStep,
	LaunchStepField,
} from 'openquok-common';

import { resolveProfileValue } from './profileValues.js';

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

function fillTextControl(element: Element, value: string): boolean {
	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		if (element.type === 'file') return false;
		setNativeInputValue(element, value);
		return true;
	}
	if (element instanceof HTMLSelectElement) {
		const normalized = value.toLowerCase();
		for (const option of Array.from(element.options)) {
			if (
				option.value.toLowerCase() === normalized ||
				option.textContent?.trim().toLowerCase() === normalized
			) {
				element.value = option.value;
				element.dispatchEvent(new Event('change', { bubbles: true }));
				return true;
			}
		}
		return false;
	}
	const editable = element as HTMLElement;
	if (editable.isContentEditable) {
		editable.textContent = value;
		editable.dispatchEvent(new Event('input', { bubbles: true }));
		return true;
	}
	return false;
}

export function fillLaunchField(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField
): FieldFillResult {
	const value = resolveProfileValue(snapshot, field.profilePath);
	if (!value) {
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

	try {
		const filled = fillTextControl(element, value);
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
