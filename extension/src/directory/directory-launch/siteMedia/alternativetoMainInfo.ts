import type { LaunchStepField } from 'openquok-common';

import { alternativetoManageItemPage } from './alternativetoUploads.js';

const SHORT_DESC_HELP = 'keep it short, preferably in one concise sentence';
const FULL_DESC_HELP = 'longer description of the application';

function normalizeText(value: string): string {
	return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

function fieldLabelMatches(visibleText: string, needles: readonly string[]): boolean {
	const leading = visibleText.trim().split(/\n|[<(]/)[0]?.trim() ?? visibleText.trim();
	const norm = normalizeText(leading);
	for (const needle of needles) {
		const want = normalizeText(needle);
		if (norm === want || norm === `${want} *` || norm.startsWith(`${want} `)) return true;
	}
	return false;
}

function findFieldLabel(needles: readonly string[]): Element | null {
	for (const el of document.querySelectorAll(
		'label, legend, h3, h4, h5, p, span, [data-slot="label"], [data-slot="form-label"]'
	)) {
		const text = el.textContent ?? '';
		if (!fieldLabelMatches(text, needles)) continue;
		if (text.length > 120) continue;
		return el;
	}
	return null;
}

function findHelperAnchor(fragment: string): Element | null {
	const needle = fragment.toLowerCase();
	let best: Element | null = null;
	let bestLen = Number.POSITIVE_INFINITY;
	for (const el of document.querySelectorAll('p, span, small, div, label')) {
		const text = normalizeText(el.textContent ?? '');
		if (!text.includes(needle)) continue;
		if (text.length < bestLen) {
			bestLen = text.length;
			best = el;
		}
	}
	return best;
}

/** Last textarea before helper copy in document order (closest above the hint). */
export function nearestTextareaBefore(anchor: Element): HTMLTextAreaElement | null {
	let best: HTMLTextAreaElement | null = null;
	for (const candidate of document.querySelectorAll('textarea')) {
		if (!(candidate instanceof HTMLTextAreaElement)) continue;
		const position = anchor.compareDocumentPosition(candidate);
		if (!(position & Node.DOCUMENT_POSITION_PRECEDING)) continue;
		if (!best) {
			best = candidate;
			continue;
		}
		if (best.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING) {
			best = candidate;
		}
	}
	return best;
}

function textareaAfterLabel(label: Element): HTMLTextAreaElement | null {
	const htmlFor = label.getAttribute('for')?.trim();
	if (htmlFor) {
		const byId = document.getElementById(htmlFor);
		if (byId instanceof HTMLTextAreaElement) return byId;
	}
	let walk: Element | null = label;
	for (let depth = 0; depth < 8; depth += 1) {
		let sibling = walk.nextElementSibling;
		while (sibling) {
			if (sibling instanceof HTMLTextAreaElement) return sibling;
			const nested = sibling.querySelector('textarea');
			if (nested instanceof HTMLTextAreaElement) return nested;
			sibling = sibling.nextElementSibling;
		}
		const row = walk.parentElement;
		if (row && row !== walk) {
			const rowTextareas = row.querySelectorAll('textarea');
			if (rowTextareas.length === 1 && rowTextareas[0] instanceof HTMLTextAreaElement) {
				return rowTextareas[0];
			}
		}
		walk = walk.parentElement;
		if (!walk || walk.tagName === 'SECTION' || walk.tagName === 'FORM') break;
	}
	return null;
}

function richEditorAfterLabel(label: Element): HTMLElement | null {
	const row = label.closest('div, fieldset, li, section, form, article') ?? label.parentElement;
	if (!row) return null;
	for (const editor of row.querySelectorAll(
		'.ProseMirror, .tiptap [contenteditable="true"], [contenteditable="true"]'
	)) {
		if (editor instanceof HTMLElement && editor.isContentEditable) return editor;
	}
	return null;
}

export function resolveAlternativetoShortDescriptionControl(): HTMLTextAreaElement | null {
	const helper = findHelperAnchor(SHORT_DESC_HELP);
	if (helper) {
		const fromHelp = nearestTextareaBefore(helper);
		if (fromHelp) return fromHelp;
	}
	const label = findFieldLabel(['Short Description', 'Short description']);
	if (label) {
		const fromLabel = textareaAfterLabel(label);
		if (fromLabel) return fromLabel;
	}
	return null;
}

export function resolveAlternativetoFullDescriptionControl(): HTMLElement | null {
	const helper = findHelperAnchor(FULL_DESC_HELP);
	if (helper) {
		const fromHelp = nearestTextareaBefore(helper);
		if (fromHelp) return fromHelp;
	}
	const label = findFieldLabel(['Full Description', 'Full description', 'Description']);
	if (label) {
		const fromLabel = textareaAfterLabel(label);
		if (fromLabel) return fromLabel;
		const editor = richEditorAfterLabel(label);
		if (editor) return editor;
	}
	return null;
}

/** manage-item Short vs Full description rows share one card — generic label walking conflates them. */
export function resolveAlternativetoFieldElement(field: LaunchStepField): Element | null {
	if (!alternativetoManageItemPage()) return null;
	if (field.key === 'tagline' || field.profilePath === 'tagline') {
		return resolveAlternativetoShortDescriptionControl();
	}
	if (field.key === 'description' || field.profilePath === 'description') {
		return resolveAlternativetoFullDescriptionControl();
	}
	return null;
}