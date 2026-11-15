import type {
	AutoLaunchProfileSnapshot,
	FieldFillResult,
	LaunchStep,
	LaunchStepField,
	LaunchStepFieldFillMode,
} from 'openquok-common';
import {
	applyLaunchFieldScalarCap,
	applyLaunchFieldScalarCoercion,
	applyLaunchFieldSelectCoercion,
	choiceGroupControlCountBounds,
	fieldHasLaunchFieldCatalog,
	catalogListFillSkipMessage,
	catalogTagsDomFillSkipMessage,
	fillableTagsForLaunchField,
	LAUNCH_FIELD_CATALOG_IDS,
	plainTextToSimpleHtml,
	resolveLaunchFieldCatalogId,
	richHtmlToPlainText,
} from 'openquok-common';

import { replaceElementHtml } from '../../shared/domHtml.js';

const LABEL_FALLBACK_MIN_TOKEN_LENGTH = 3;

function escapeCssIdent(value: string): string {
	if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
		return CSS.escape(value);
	}
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
/** Standalone labels too short to pair with a longer configured field label (e.g. "URL" → "Launch video URL"). */
const LABEL_FALLBACK_MIN_REVERSE_LENGTH = 8;
const GENERIC_SHORT_FIELD_LABELS = new Set(['url', 'link', 'name', 'text', 'id']);

import {
	comboboxAriaControlsHost,
	comboboxInteractionTarget,
	delay,
	dispatchEnterKey,
	isFieldElementVisible,
	listboxScopesForCombobox,
	openComboboxMenu,
	resolveComboboxTrigger,
	scrollControlIntoView,
	setNativeInputValue,
	tryPickListChoice,
	waitForListboxPanel,
} from './fillListboxDom.js';
import { fetchProfileMediaFile } from './profileMediaFetch.js';
import {
	collectRawItemsFromProfilePaths,
	defaultTagProfilePathsForField,
} from './launchCompareState.js';
import {
	resolveLaunchProfileScalar,
	resolveProfileStoragePathList,
	resolveProfileValue,
} from './profileValues.js';

export type FillLaunchContext = {
	dashboardOrigin?: string;
	/** Main product profile — supplies social URLs when the active handoff is a directory variant. */
	mainProfileSnapshot?: AutoLaunchProfileSnapshot | null;
};

export type FillLaunchFieldOptions = {
	/** Scalar override (text, url, select, rich_html, boolean as string, or comma-joined tags). */
	valueOverride?: string;
	/** Tag list override; joined for `fillMode: "tags"` when `valueOverride` is omitted. */
	valuesOverride?: string[];
};

function isRichTextControl(element: Element): boolean {
	if (element instanceof HTMLElement) {
		if (element.matches('.ProseMirror, .tiptap, [contenteditable="true"]')) return true;
		if (element.isContentEditable) return true;
	}
	return Boolean(element.querySelector('.ProseMirror, .tiptap, [contenteditable="true"]'));
}

function isPlainTextInputControl(element: Element): boolean {
	if (element instanceof HTMLTextAreaElement) return true;
	if (element instanceof HTMLInputElement) {
		const type = element.type.toLowerCase();
		return type !== 'file' && type !== 'checkbox' && type !== 'radio' && type !== 'hidden';
	}
	return false;
}

function checkboxGroupScope(element: Element): Element {
	if (countCheckboxesInScope(element) > 1) return element;
	if (element instanceof HTMLInputElement && element.type === 'checkbox') {
		const fieldset = element.closest('fieldset');
		if (fieldset && countCheckboxesInScope(fieldset) > 1) {
			return fieldset;
		}
		const container = element.closest('div, section, fieldset, form');
		if (container && countCheckboxesInScope(container) > 1) {
			return container;
		}
	}
	if (element.getAttribute('role') === 'checkbox') {
		const container = element.closest('div, section, fieldset, form');
		if (container && countCheckboxesInScope(container) > 1) {
			return container;
		}
	}
	return element;
}

function elementAcceptableForFillMode(element: Element, fillMode: LaunchStepFieldFillMode): boolean {
	switch (fillMode) {
		case 'rich_html':
			if (isRichTextControl(element)) return true;
			if (element instanceof HTMLTextAreaElement && !isShortMaxLengthFieldControl(element)) {
				return true;
			}
			return false;
		case 'text':
			return isPlainTextInputControl(element) && !isRichTextControl(element);
		case 'tags':
			if (element instanceof HTMLInputElement && element.type === 'checkbox') return false;
			if (
				element instanceof HTMLButtonElement &&
				(element.getAttribute('aria-haspopup') === 'listbox' ||
					(element.getAttribute('aria-label') ?? '').toLowerCase().includes('popup'))
			) {
				return true;
			}
			if (isPlainTextInputControl(element)) return true;
			if (element.querySelector('input, textarea, [role="combobox"], button[aria-haspopup="listbox"]')) {
				return true;
			}
			return hasTagChipsInScope(element);
		case 'checkbox_group': {
			const scope = checkboxGroupScope(element);
			return countCheckboxesInScope(scope) > 0;
		}
		case 'select':
			if (element instanceof HTMLSelectElement) return true;
			if (element instanceof HTMLInputElement && element.type === 'radio') return true;
			if (element.getAttribute('role') === 'combobox') return true;
			return element.querySelectorAll('input[type="radio"], select').length > 0;
		case 'boolean':
			if (element instanceof HTMLInputElement) {
				return element.type === 'checkbox' || element.type === 'radio';
			}
			if (
				element.getAttribute('role') === 'switch' ||
				element.getAttribute('role') === 'checkbox'
			) {
				return true;
			}
			return Boolean(
				element.querySelector('input[type="checkbox"], input[type="radio"], [role="switch"]')
			);
		default:
			return true;
	}
}

function scoreCandidateForFillMode(element: Element, fillMode: LaunchStepFieldFillMode): number {
	if (!elementAcceptableForFillMode(element, fillMode)) return -1;
	if (fillMode === 'checkbox_group') {
		return countCheckboxesInScope(checkboxGroupScope(element));
	}
	if (fillMode === 'select') {
		if (element instanceof HTMLSelectElement) return 10;
		const radioCount = element.querySelectorAll('input[type="radio"]').length;
		if (radioCount > 0) return radioCount;
	}
	if (fillMode === 'text' && isPlainTextInputControl(element)) return 10;
	if (fillMode === 'rich_html') {
		if (isRichTextControl(element)) return 10;
		if (element instanceof HTMLTextAreaElement) return 8;
	}
	return 1;
}

function queryFieldElement(field: LaunchStepField): Element | null {
	const fillMode = resolveFillMode(field);
	const selectorHint = field.selectorHint;
	if (!selectorHint?.trim()) return null;
	const parts = selectorHint.split(',').map((part) => part.trim()).filter(Boolean);
	const candidates: Element[] = [];
	for (const selector of parts) {
		try {
			for (const el of document.querySelectorAll(selector)) {
				candidates.push(el);
			}
		} catch {
			/* invalid selector */
		}
	}
	if (candidates.length === 0) return null;
	let best: Element | null = null;
	let bestScore = -1;
	const sectionBlock =
		field.tagsScope === 'section' ? sectionBlockForField(field) : null;
	for (const candidate of candidates) {
		if (!isFieldElementVisible(candidate)) continue;
		if (!elementPassesFieldGuard(field, candidate)) continue;
		if (sectionBlock && !sectionBlock.contains(candidate)) continue;
		let score = scoreCandidateForFillMode(candidate, fillMode);
		if (sectionBlock?.contains(candidate)) score += 1_000;
		if (score > bestScore) {
			bestScore = score;
			best = candidate;
		}
	}
	return best;
}

function normalizeFieldLabel(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function labelTextMatchesField(visibleText: string, fieldLabel: string): boolean {
	const haystack = normalizeFieldLabel(visibleText);
	const needle = normalizeFieldLabel(fieldLabel);
	if (!haystack || !needle) return false;
	const leading = visibleText.trim().split(/\n|[<(]/)[0]?.trim() ?? visibleText.trim();
	if (normalizeFieldLabel(leading) === needle) return true;
	if (haystack.startsWith(needle)) {
		const next = haystack.charAt(needle.length);
		if (!next || next === ' ' || next === '*') return true;
	}
	if (haystack.includes(needle)) return true;
	if (GENERIC_SHORT_FIELD_LABELS.has(haystack)) return false;
	if (needle.includes(haystack) && haystack.length >= LABEL_FALLBACK_MIN_REVERSE_LENGTH) return true;
	const tokens = needle.split(' ').filter((part) => part.length >= LABEL_FALLBACK_MIN_TOKEN_LENGTH);
	return tokens.length > 0 && tokens.every((part) => haystack.includes(part));
}

/** Avoid matching a wizard shell label (e.g. Tags row inside a huge layout block). */
function labelTextMatchesFieldExact(visibleText: string, fieldLabel: string): boolean {
	const haystack = normalizeFieldLabel(visibleText);
	const needle = normalizeFieldLabel(fieldLabel);
	if (!haystack || !needle) return false;
	if (haystack === needle) return true;
	if (haystack === `${needle} *` || haystack === `${needle}*`) return true;
	return false;
}

function isOpenLaunchStyleChoiceRowLabel(el: Element): boolean {
	if (!(el instanceof HTMLLabelElement)) return false;
	return (
		el.querySelectorAll(
			':scope > input[type="checkbox"], :scope input[type="checkbox"], :scope > input[type="radio"], :scope input[type="radio"], :scope > [role="checkbox"], :scope > [data-slot="checkbox"]'
		).length === 1
	);
}

/** Site chrome (nav/footer links) must not anchor form field resolution. */
function isExcludedFieldLabelAnchor(el: Element): boolean {
	if (el.closest('nav, footer, header, [role="navigation"], [role="contentinfo"], [role="banner"]')) {
		return true;
	}
	if (el.closest('a[href]')) return true;
	return false;
}

/** Option text in a checkbox/radio row — not the wizard section title (`data-slot="label"`). */
function isChoiceGroupOptionLabel(el: Element): boolean {
	if (el.getAttribute('data-slot') === 'label' || el.getAttribute('data-slot') === 'form-label') {
		return false;
	}
	if (el instanceof HTMLLabelElement && isOpenLaunchStyleChoiceRowLabel(el)) return true;
	const parent = el.parentElement;
	if (!parent) return false;
	if (parent.querySelector(':scope > [role="switch"]')) return false;
	const choice = parent.querySelector(
		':scope > [role="checkbox"], :scope > [data-slot="checkbox"], :scope > input[type="checkbox"], :scope > input[type="radio"]'
	);
	if (!choice) return false;
	if (choice instanceof HTMLInputElement && choice.classList.contains('sr-only')) return false;
	return choice !== el && !el.contains(choice);
}

function countCheckboxesInScope(scope: Element): number {
	const native = scope.querySelectorAll('input[type="checkbox"]').length;
	const role = scope.querySelectorAll(
		'[role="checkbox"], [data-slot="checkbox"], button[role="checkbox"]'
	).length;
	return Math.max(native, role);
}

function countRadiosInScope(scope: Element): number {
	return scope.querySelectorAll('input[type="radio"]').length;
}

function choiceGroupContainerFromAnchor(
	anchor: Element,
	countInScope: (scope: Element) => number,
	minCount: number
): Element | null {
	let block: Element | null = anchor.parentElement;
	for (let depth = 0; depth < 10 && block; depth++) {
		if (countInScope(block) >= minCount) return block;
		block = block.parentElement;
	}
	let sibling: Element | null = anchor.nextElementSibling;
	for (let step = 0; step < 5 && sibling; step++) {
		if (countInScope(sibling) >= minCount) return sibling;
		sibling = sibling.nextElementSibling;
	}
	return null;
}

function checkboxGroupContainerFromAnchor(anchor: Element): Element | null {
	return choiceGroupContainerFromAnchor(anchor, countCheckboxesInScope, 2);
}

function radioGroupContainerFromAnchor(anchor: Element): Element | null {
	return choiceGroupContainerFromAnchor(anchor, countRadiosInScope, 2);
}

function resolveChoiceGroupContainerNearFieldLabel(
	field: LaunchStepField,
	fillMode: 'checkbox_group' | 'select'
): Element | null {
	const labelNeedle = field.label.trim();
	if (!labelNeedle) return null;

	const headingSelectors =
		'label, legend, h3, h4, h5, p, span, [data-slot="label"], [data-slot="form-label"], [class*="form-label" i]';

	for (const anchor of document.querySelectorAll(headingSelectors)) {
		if (isOpenLaunchStyleChoiceRowLabel(anchor) || isChoiceGroupOptionLabel(anchor)) continue;
		if (isExcludedFieldLabelAnchor(anchor)) continue;
		const text = anchor.textContent ?? '';
		if (!labelMatchesForField(text, labelNeedle, field)) continue;
		const container =
			fillMode === 'checkbox_group'
				? checkboxGroupContainerFromAnchor(anchor)
				: radioGroupContainerFromAnchor(anchor);
		if (container && elementAcceptableForFillMode(container, fillMode)) {
			return container;
		}
	}
	return null;
}

/** Open Launch and shadcn forms often use a field heading (`div`/`p`) instead of `<legend>`. */
function resolveCheckboxGroupContainerNearFieldLabel(field: LaunchStepField): Element | null {
	return resolveChoiceGroupContainerNearFieldLabel(field, 'checkbox_group');
}

function resolveSelectContainerNearFieldLabel(field: LaunchStepField): Element | null {
	return resolveChoiceGroupContainerNearFieldLabel(field, 'select');
}

function isSocialLinkProfileField(field: LaunchStepField): boolean {
	return (
		field.key.startsWith('social_') ||
		Boolean(field.profilePath?.includes('profile_data.social_'))
	);
}

function isListingFormIdentityInput(element: HTMLInputElement): boolean {
	const attrName = (element.getAttribute('name') ?? '').toLowerCase();
	return (
		attrName === 'name' ||
		attrName === 'slug' ||
		attrName === 'url' ||
		attrName === 'description' ||
		attrName === 'repo_url' ||
		attrName === 'tagline'
	);
}

function isShortMaxLengthFieldControl(element: Element): boolean {
	if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
		return element.maxLength > 0 && element.maxLength <= 80;
	}
	return false;
}

function elementPassesFieldGuard(field: LaunchStepField, element: Element): boolean {
	const fillMode = resolveFillMode(field);

	if (field.key === 'name' && element instanceof HTMLInputElement) {
		const attrName = (element.getAttribute('name') ?? '').toLowerCase();
		if (attrName && attrName !== 'name') return false;
		if (element.type === 'url' || element.type === 'email' || element.type === 'tel') return false;
	}

	if (field.key === 'website' && element instanceof HTMLInputElement) {
		const attrName = (element.getAttribute('name') ?? '').toLowerCase();
		if (attrName === 'repo_url' || attrName === 'name' || attrName === 'slug') return false;
	}

	if (
		(field.key === 'launch_video_url' || field.profilePath === 'profile_data.launch_video_url') &&
		element instanceof HTMLInputElement
	) {
		const attrName = (element.getAttribute('name') ?? '').toLowerCase();
		if (attrName === 'name' || attrName === 'url' || attrName === 'slug') return false;
	}

	if (
		(field.key === 'social_youtube' || field.profilePath === 'profile_data.social_youtube') &&
		element instanceof HTMLInputElement
	) {
		const attrName = (element.getAttribute('name') ?? '').toLowerCase();
		if (attrName === 'name' || attrName === 'url' || attrName === 'slug' || attrName === 'description') {
			return false;
		}
	}

	if (isSocialLinkProfileField(field) && element instanceof HTMLInputElement) {
		if (isListingFormIdentityInput(element)) return false;
		if (element.type === 'checkbox' || element.type === 'radio' || element.type === 'hidden') {
			return false;
		}
		if (
			field.key !== 'social_github' &&
			(element.getAttribute('name') ?? '').toLowerCase() === 'repo_url'
		) {
			return false;
		}
	}

	if (field.key === 'tagline' || field.profilePath === 'tagline') {
		if (isRichTextControl(element)) return false;
		if (element.closest('.tiptap, .ProseMirror[contenteditable="true"]')) {
			return isShortMaxLengthFieldControl(element);
		}
	}

	if (field.profilePath === 'description' && fillMode === 'rich_html') {
		if (element instanceof HTMLTextAreaElement) {
			if (isShortMaxLengthFieldControl(element)) return false;
			return true;
		}
		if (element instanceof HTMLInputElement) {
			if (isShortMaxLengthFieldControl(element)) return false;
			if (!isRichTextControl(element)) return false;
		}
	}

	if (field.fillMode === 'tags' || field.key === 'tags') {
		if (isShortMaxLengthFieldControl(element)) return false;
	}

	if (fillMode === 'checkbox_group') {
		const bounds = choiceGroupControlCountBounds(field);
		if (bounds) {
			const count = countCheckboxesInScope(element);
			if (count < bounds.min || count > bounds.max) return false;
		}
	}

	return elementAcceptableForFillMode(element, fillMode);
}

function pickVisibleControl(candidates: Iterable<Element>): Element | null {
	for (const el of candidates) {
		if (isFieldElementVisible(el)) return el;
	}
	return null;
}

function labelMatchesSectionHeading(visibleText: string, fieldLabel: string): boolean {
	const needle = normalizeFieldLabel(fieldLabel);
	const leading = visibleText.trim().split(/\n|[<(]/)[0]?.trim() ?? visibleText.trim();
	const leadNorm = normalizeFieldLabel(leading);
	if (!leadNorm || !needle) return false;
	if (leadNorm === needle) return true;
	if (leadNorm === `${needle} *` || leadNorm === `${needle}*`) return true;
	if (leadNorm.startsWith(needle)) {
		const next = leadNorm.charAt(needle.length);
		if (!next || next === ' ' || next === '*') return true;
	}
	return false;
}

function labelMatchesForField(
	visibleText: string,
	fieldLabel: string,
	field?: LaunchStepField
): boolean {
	if (field?.key === 'tags') return labelTextMatchesFieldExact(visibleText, fieldLabel);
	if (field?.labelMatch === 'section') {
		return labelMatchesSectionHeading(visibleText, fieldLabel);
	}
	return labelTextMatchesField(visibleText, fieldLabel);
}

function tagsControlAffinityScore(control: Element, labelEl: Element, field?: LaunchStepField): number {
	if (!isFieldElementVisible(control)) return -1;
	if (field && !elementPassesFieldGuard(field, control)) return -1;
	if (!elementAcceptableForFillMode(control, 'tags')) return -1;

	let score = 0;
	const position = labelEl.compareDocumentPosition(control);
	if (position & Node.DOCUMENT_POSITION_FOLLOWING) score += 80;
	if (position & Node.DOCUMENT_POSITION_PRECEDING) score -= 40;

	if (control instanceof HTMLInputElement) {
		const name = (control.getAttribute('name') ?? '').toLowerCase();
		const aria = (control.getAttribute('aria-label') ?? '').toLowerCase();
		const placeholder = (control.getAttribute('placeholder') ?? '').toLowerCase();
		if (name.includes('tag') && !name.includes('tagline')) score += 120;
		if (aria.includes('tag') && !aria.includes('tagline')) score += 120;
		if (placeholder.includes('search tags') || placeholder.includes('add tag')) score += 80;
		if (name.includes('categor') || aria.includes('categor')) score -= 250;
		if (aria.includes('pricing')) score -= 250;
	}

	const chipHost =
		control.closest('[class*="flex"], [class*="grid"], div, section') ?? control.parentElement;
	if (chipHost && hasTagChipsInScope(chipHost) && chipHost.contains(control)) {
		score += 90;
	}

	let shared: Element | null = labelEl.parentElement;
	for (let depth = 0; depth < 8 && shared; depth++) {
		if (shared.contains(control)) {
			score += 70 - depth * 8;
			break;
		}
		shared = shared.parentElement;
	}

	return score;
}

function pickBestTagsControlNearLabel(
	labelEl: Element,
	block: Element,
	field?: LaunchStepField
): Element | null {
	const controls = block.querySelectorAll(controlSelectorForFillMode('tags'));
	let best: Element | null = null;
	let bestScore = -1;
	for (const control of controls) {
		const score = tagsControlAffinityScore(control, labelEl, field);
		if (score > bestScore) {
			bestScore = score;
			best = control;
		}
	}
	if (best && bestScore > 0) return best;
	return null;
}

/** Keep tag reads scoped to the Tags row, not the whole wizard card (Category/Pricing siblings). */
function isNarrowTagsReadScope(block: Element, tagsLabel: Element | null, control: Element): boolean {
	if (!block.contains(control)) return false;
	if (tagsLabel && !block.contains(tagsLabel)) return false;
	const tagsRow = tagsLabel?.closest('div, section, fieldset, li') ?? tagsLabel?.parentElement;
	for (const label of block.querySelectorAll('label')) {
		const text = normalizeFieldLabel(label.textContent ?? '');
		if (text === 'category' || text === 'pricing' || text === 'product name') {
			if (tagsRow?.contains(label)) continue;
			if (block.contains(label)) return false;
		}
	}
	return true;
}

function hasTagChipsInScope(scope: Element): boolean {
	for (const el of scope.querySelectorAll('[class*="rounded-full"], [class*="rounded-lg"]')) {
		if (!el.querySelector('button, [role="button"]')) continue;
		if (el.matches('input, textarea, select')) continue;
		return true;
	}
	for (const wrap of scope.querySelectorAll('div, span')) {
		if (wrap.matches('input, textarea, select, label')) continue;
		if (wrap.querySelector(':scope > button, :scope > [role="button"]')) return true;
	}
	return false;
}

/** Walk ancestor blocks (Uneed / shadcn often split label and control across sibling divs). */
const FIELD_HEADING_SELECTORS =
	'label, legend, h2, h3, h4, h5, p, span, [data-slot="label"], [data-slot="form-label"], [class*="form-label" i]';

function fieldLabelNeedles(field: LaunchStepField): string[] {
	const needles: string[] = [];
	const primary = field.label.trim();
	if (primary) needles.push(primary);
	for (const alias of field.labelAliases ?? []) {
		const trimmed = alias.trim();
		if (!trimmed || needles.includes(trimmed)) continue;
		needles.push(trimmed);
	}
	return needles;
}

function labelMatchesAnyFieldLabel(visibleText: string, field: LaunchStepField): boolean {
	for (const needle of fieldLabelNeedles(field)) {
		if (labelMatchesForField(visibleText, needle, field)) return true;
	}
	return false;
}

function sectionBlockForField(field: LaunchStepField): Element | null {
	const heading = findFieldLabelAnchor(field);
	if (!heading) return null;
	return heading.closest('section, fieldset, form, li, div') ?? heading.parentElement;
}

function findFieldLabelAnchor(field: LaunchStepField): Element | null {
	if (fieldLabelNeedles(field).length === 0) return null;
	for (const anchor of document.querySelectorAll(FIELD_HEADING_SELECTORS)) {
		if (isOpenLaunchStyleChoiceRowLabel(anchor) || isChoiceGroupOptionLabel(anchor)) continue;
		if (isExcludedFieldLabelAnchor(anchor)) continue;
		const text = anchor.textContent ?? '';
		if (!labelMatchesAnyFieldLabel(text, field)) continue;
		return anchor;
	}
	return null;
}

/** Label-first resolution for fields that share combobox patterns (Uneed Tags vs Category). */
/** Reka / Nuxt forms wire `<label for="…">` to stable control ids (Uneed General tab). */
function resolveControlByLabelForAttribute(field: LaunchStepField): Element | null {
	const fillMode = resolveFillMode(field);
	if (fieldLabelNeedles(field).length === 0) return null;

	for (const labelEl of document.querySelectorAll('label')) {
		if (isExcludedFieldLabelAnchor(labelEl)) continue;
		const text = labelEl.textContent ?? '';
		if (!labelMatchesAnyFieldLabel(text, field)) continue;
		const htmlFor = labelEl.getAttribute('for')?.trim();
		if (!htmlFor) continue;
		const target = document.getElementById(htmlFor);
		if (!target || !isFieldElementVisible(target)) continue;
		if (!elementAcceptableForFillMode(target, fillMode)) continue;
		if (!elementPassesFieldGuard(field, target)) continue;
		return target;
	}
	return null;
}

function resolveControlByExactFieldLabel(field: LaunchStepField): Element | null {
	const fillMode = resolveFillMode(field);
	if (fieldLabelNeedles(field).length === 0) return null;

	for (const labelEl of document.querySelectorAll(FIELD_HEADING_SELECTORS)) {
		if (isOpenLaunchStyleChoiceRowLabel(labelEl) || isChoiceGroupOptionLabel(labelEl)) continue;
		if (isExcludedFieldLabelAnchor(labelEl)) continue;
		const text = labelEl.textContent ?? '';
		if (!labelMatchesAnyFieldLabel(text, field)) continue;
		const control = findControlInLabelBlock(labelEl, fillMode, field);
		if (control) return control;
	}
	return null;
}

function controlWithinExactLabelBlock(control: Element, field: LaunchStepField): boolean {
	const labelNeedle = field.label.trim();
	if (!labelNeedle) return true;
	const needsLabelScopedHint = field.key === 'tags';
	const isCategory = field.key === 'category' && resolveFillMode(field) === 'select';
	if (!needsLabelScopedHint && !isCategory) return true;

	let hasExactLabelOnPage = false;
	for (const labelEl of document.querySelectorAll('label')) {
		if (!labelTextMatchesFieldExact(labelEl.textContent ?? '', labelNeedle)) continue;
		hasExactLabelOnPage = true;
		let block: Element | null =
			labelEl.closest('div, fieldset, li, section, form') ?? labelEl.parentElement;
		for (let depth = 0; depth < 10 && block; depth++) {
			if (block.contains(control)) return true;
			block = block.parentElement;
		}
	}
	/** Hint-only fields in tests / atypical markup — no `Tags` label in the DOM. */
	if (!hasExactLabelOnPage) return true;
	return false;
}

function findControlInLabelBlock(
	labelEl: Element,
	fillMode: LaunchStepFieldFillMode,
	field?: LaunchStepField
): Element | null {
	let block: Element | null =
		labelEl.closest('div, fieldset, li, section, form') ?? labelEl.parentElement;
	for (let depth = 0; depth < 8 && block; depth++) {
		if (fillMode === 'rich_html') {
			const editors = block.querySelectorAll(
				'.ProseMirror, .tiptap .ProseMirror, .tiptap [contenteditable="true"], [contenteditable="true"]'
			);
			const acceptable = Array.from(editors).filter(
				(el) =>
					isRichTextControl(el) &&
					isFieldElementVisible(el) &&
					(!field || elementPassesFieldGuard(field, el))
			);
			const picked = pickVisibleControl(acceptable);
			if (picked) return picked;
			const textareas = block.querySelectorAll('textarea');
			const textareaCandidates = Array.from(textareas).filter(
				(el) =>
					isFieldElementVisible(el) &&
					elementAcceptableForFillMode(el, fillMode) &&
					(!field || elementPassesFieldGuard(field, el))
			);
			const textarea = pickVisibleControl(textareaCandidates);
			if (textarea) return textarea;
		}

		if (fillMode === 'tags') {
			const popup = block.querySelector(
				'button[aria-haspopup="listbox"], button[aria-label*="popup" i]'
			);
			if (
				popup instanceof HTMLElement &&
				isFieldElementVisible(popup) &&
				(!field || elementPassesFieldGuard(field, popup))
			) {
				return popup;
			}
			const tagsControl = pickBestTagsControlNearLabel(labelEl, block, field);
			if (tagsControl) return tagsControl;
		}

		if (fillMode === 'boolean') {
			const switches = block.querySelectorAll('[role="switch"]');
			for (const candidate of switches) {
				if (
					isFieldElementVisible(candidate) &&
					elementAcceptableForFillMode(candidate, fillMode) &&
					(!field || elementPassesFieldGuard(field, candidate))
				) {
					return candidate;
				}
			}
		}

		if (
			fillMode === 'checkbox_group' &&
			countCheckboxesInScope(block) >= 2 &&
			elementAcceptableForFillMode(block, fillMode) &&
			(!field || elementPassesFieldGuard(field, block))
		) {
			return block;
		}

		const controls = block.querySelectorAll(controlSelectorForFillMode(fillMode));
		const acceptable = Array.from(controls).filter((el) => {
			if (!elementAcceptableForFillMode(el, fillMode)) return false;
			return !field || elementPassesFieldGuard(field, el);
		});
		const nested = pickVisibleControl(acceptable);
		if (nested) return nested;
		const first = acceptable[0];
		if (first) return first;

		if (fillMode === 'tags' && hasTagChipsInScope(block)) {
			const input = block.querySelector(
				'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, [role="combobox"] input, input[role="combobox"]'
			);
			if (
				input &&
				isFieldElementVisible(input) &&
				elementAcceptableForFillMode(input, fillMode) &&
				(!field || elementPassesFieldGuard(field, input))
			) {
				return input;
			}
			return block;
		}

		block = block.parentElement;
	}
	return null;
}

function controlSelectorForFillMode(fillMode: LaunchStepFieldFillMode): string {
	switch (fillMode) {
		case 'rich_html':
			return 'textarea, .ProseMirror, .tiptap, [contenteditable="true"]';
		case 'checkbox_group':
			return 'fieldset, input[type="checkbox"], [role="checkbox"], [data-slot="checkbox"]';
		case 'tags':
			return 'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, input[role="combobox"], [role="combobox"] input, button[aria-haspopup="listbox"], button[aria-label*="popup" i]';
		case 'select':
			return 'select, input[type="radio"], [role="combobox"], button[role="combobox"]';
		case 'boolean':
			return 'input[type="checkbox"], input[type="radio"], [role="switch"], [role="checkbox"]';
		default:
			return 'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea';
	}
}

/** Fallback when `selectorHint` misses (common on label-driven React forms such as Uneed). */
function queryFieldElementByLabel(
	fieldLabel: string,
	fillMode: LaunchStepFieldFillMode = 'text',
	field?: LaunchStepField
): Element | null {
	const labelNeedles = field
		? fieldLabelNeedles(field)
		: fieldLabel.trim()
			? [fieldLabel.trim()]
			: [];
	for (const labelNeedle of labelNeedles) {
		const found = queryFieldElementByLabelNeedle(labelNeedle, fillMode, field);
		if (found) return found;
	}
	return null;
}

function queryFieldElementByLabelNeedle(
	labelNeedle: string,
	fillMode: LaunchStepFieldFillMode = 'text',
	field?: LaunchStepField
): Element | null {
	const needle = labelNeedle.trim();
	if (!needle) return null;

	for (const control of document.querySelectorAll('input, textarea, select')) {
		const ariaLabel = control.getAttribute('aria-label');
		if (ariaLabel && labelTextMatchesField(ariaLabel, needle)) {
			if (isFieldElementVisible(control) && (!field || elementPassesFieldGuard(field, control))) {
				return control;
			}
		}
		const labelledBy = control.getAttribute('aria-labelledby');
		if (labelledBy) {
			for (const id of labelledBy.split(/\s+/).filter(Boolean)) {
				const labelEl = document.getElementById(id);
				const text = labelEl?.textContent ?? '';
				if (
					labelTextMatchesField(text, needle) &&
					isFieldElementVisible(control) &&
					(!field || elementPassesFieldGuard(field, control))
				) {
					return control;
				}
			}
		}
	}

	for (const legend of document.querySelectorAll('legend')) {
		const text = legend.textContent ?? '';
		if (!labelTextMatchesField(text, needle)) continue;
		const fieldset = legend.closest('fieldset');
		if (fieldset && elementAcceptableForFillMode(fieldset, fillMode)) {
			return fieldset;
		}
	}

	for (const labelEl of document.querySelectorAll(FIELD_HEADING_SELECTORS)) {
		if (isOpenLaunchStyleChoiceRowLabel(labelEl) || isChoiceGroupOptionLabel(labelEl)) continue;
		if (isExcludedFieldLabelAnchor(labelEl)) continue;
		const text = labelEl.textContent ?? '';
		if (field) {
			if (!labelMatchesAnyFieldLabel(text, field)) continue;
		} else if (!labelMatchesForField(text, needle, field)) {
			continue;
		}

		const htmlFor = labelEl.getAttribute('for');
		if (htmlFor) {
			const target = document.getElementById(htmlFor);
			if (
				target &&
				isFieldElementVisible(target) &&
				elementAcceptableForFillMode(target, fillMode) &&
				(!field || elementPassesFieldGuard(field, target))
			) {
				return target;
			}
		}

		const fromBlock = findControlInLabelBlock(labelEl, fillMode, field);
		if (fromBlock) return fromBlock;
	}

	return null;
}

export function resolveFieldElement(field: LaunchStepField): Element | null {
	const fillMode = resolveFillMode(field);

	if (
		field.key === 'name' ||
		field.key === 'slug' ||
		field.key === 'website' ||
		field.key === 'tagline' ||
		isSocialLinkProfileField(field)
	) {
		const byFor = resolveControlByLabelForAttribute(field);
		if (byFor) return byFor;
	}

	const labelFirst =
		field.key === 'tags' ||
		field.fillMode === 'tags' ||
		(field.key === 'category' && fillMode === 'select') ||
		fillMode === 'checkbox_group' ||
		fillMode === 'select' ||
		(field.key === 'description' && fillMode === 'rich_html');

	if (
		fillMode === 'tags' &&
		field.tagsScope === 'section' &&
		field.selectorHint?.trim()
	) {
		const fromHint = queryFieldElement(field);
		if (
			fromHint &&
			elementPassesFieldGuard(field, fromHint) &&
			controlWithinExactLabelBlock(fromHint, field)
		) {
			return fromHint;
		}
	}

	if (fillMode === 'checkbox_group') {
		const checkboxGroup = resolveCheckboxGroupContainerNearFieldLabel(field);
		if (checkboxGroup && elementPassesFieldGuard(field, checkboxGroup)) {
			return checkboxGroup;
		}
	}

	if (fillMode === 'select') {
		const selectGroup = resolveSelectContainerNearFieldLabel(field);
		if (selectGroup && elementPassesFieldGuard(field, selectGroup)) {
			return selectGroup;
		}
	}

	if (labelFirst) {
		const byExactLabel = resolveControlByExactFieldLabel(field);
		if (byExactLabel && elementPassesFieldGuard(field, byExactLabel)) {
			return byExactLabel;
		}
	}

	const fromHint = queryFieldElement(field);
	if (
		fromHint &&
		elementPassesFieldGuard(field, fromHint) &&
		controlWithinExactLabelBlock(fromHint, field)
	) {
		return fromHint;
	}
	const fromLabel = queryFieldElementByLabel(field.label, fillMode, field);
	if (
		fromLabel &&
		elementPassesFieldGuard(field, fromLabel) &&
		controlWithinExactLabelBlock(fromLabel, field)
	) {
		return fromLabel;
	}
	return null;
}

/** DOM subtree for reading tag pills on section-scoped combobox fields. */
export function resolveTagsFieldRoot(field: LaunchStepField): Element | null {
	const control = resolveFieldElement(field);
	if (!control) return null;

	const dataFieldHost = control.closest('[data-field]');
	if (dataFieldHost?.contains(control)) return dataFieldHost;

	if (field.tagsScope === 'section') {
		const heading = findFieldLabelAnchor(field);
		if (heading) {
			const section = heading.closest('section');
			if (section?.contains(control)) return section;
			let block: Element | null =
				heading.closest('div, li, fieldset, form') ?? heading.parentElement;
			for (let depth = 0; depth < 10 && block; depth++) {
				if (block.contains(control)) return block;
				block = block.parentElement;
			}
		}
	}

	const labelNeedle = field.label.trim();
	let tagsLabel: Element | null = findFieldLabelAnchor(field);
	if (!tagsLabel) {
		for (const candidate of document.querySelectorAll('label')) {
			if (labelTextMatchesFieldExact(candidate.textContent ?? '', labelNeedle)) {
				tagsLabel = candidate;
				break;
			}
		}
	}

	let best: Element | null = null;
	let bestArea = Number.POSITIVE_INFINITY;

	let block: Element | null = control.parentElement;
	for (let depth = 0; depth < 12 && block; depth++) {
		if (tagsLabel && !block.contains(tagsLabel) && !block.contains(control)) {
			block = block.parentElement;
			continue;
		}
		if (!isNarrowTagsReadScope(block, tagsLabel, control)) {
			block = block.parentElement;
			continue;
		}
		const hasChips = hasTagChipsInScope(block);
		if (!hasChips && depth < 2) {
			block = block.parentElement;
			continue;
		}
		if (!(block instanceof HTMLElement)) {
			block = block.parentElement;
			continue;
		}
		const rect = block.getBoundingClientRect();
		const area = Math.max(1, rect.width * rect.height);
		if (area < bestArea && block.contains(control)) {
			bestArea = area;
			best = block;
		}
		block = block.parentElement;
	}

	if (tagsLabel) {
		let labelBlock: Element | null =
			tagsLabel.closest('div, section, fieldset, li, form') ?? tagsLabel.parentElement;
		for (let depth = 0; depth < 10 && labelBlock; depth++) {
			if (!labelBlock.contains(control)) {
				labelBlock = labelBlock.parentElement;
				continue;
			}
			if (!isNarrowTagsReadScope(labelBlock, tagsLabel, control)) {
				labelBlock = labelBlock.parentElement;
				continue;
			}
			if (!(labelBlock instanceof HTMLElement)) break;
			const rect = labelBlock.getBoundingClientRect();
			const area = Math.max(1, rect.width * rect.height);
			if (area < bestArea) {
				bestArea = area;
				best = labelBlock;
			}
			labelBlock = labelBlock.parentElement;
		}
	}

	return best ?? control.parentElement ?? control;
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
	return val === normalized || text === normalized || text.includes(normalized);
}

/** Listbox picks for `select` fills — avoid partial matches (e.g. "Business" vs "Business products"). */
function optionMatchesSelectValue(optionText: string, optionValue: string, value: string): boolean {
	const normalized = value.trim().toLowerCase();
	if (!normalized) return false;
	const val = optionValue.trim().toLowerCase();
	const text = optionText.trim().toLowerCase();
	return val === normalized || text === normalized;
}

function optionMatchesTagValue(optionText: string, optionValue: string, tag: string): boolean {
	if (optionMatchesSelectValue(optionText, optionValue, tag)) return true;
	const normalized = tag.trim().toLowerCase();
	if (normalized.length < 2) return false;
	const val = optionValue.trim().toLowerCase();
	const text = optionText.trim().toLowerCase();
	if (val.includes(normalized) || text.includes(normalized)) return true;
	if (normalized.includes(text) && text.length >= 4) return true;
	if (normalized.includes(val) && val.length >= 4) return true;
	return false;
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

async function fillCombobox(element: HTMLElement, value: string): Promise<boolean> {
	const interaction = await openComboboxMenu(element);
	const controlsHost = comboboxAriaControlsHost(element);

	for (let attempt = 0; attempt < 14; attempt++) {
		if (attempt > 0) {
			await delay(attempt < 5 ? 20 : 45);
		}
		const scopes = listboxScopesForCombobox(controlsHost);
		for (const scope of scopes) {
			if (await tryPickListChoice(scope, value, true)) {
				return true;
			}
		}
		const expanded =
			controlsHost.getAttribute('aria-expanded') === 'true' ||
			interaction.getAttribute('aria-expanded') === 'true';
		if (!expanded && attempt % 3 === 0) {
			await openComboboxMenu(element);
		}
	}

	for (let step = 0; step < 12; step++) {
		interaction.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })
		);
		await delay(16);
		const active = document.querySelector(
			'[role="option"][data-highlighted], [role="option"][aria-selected="true"], [data-reka-collection-item][data-highlighted]'
		);
		if (!(active instanceof HTMLElement)) continue;
		const text = active.textContent ?? '';
		const optionValue = active.getAttribute('data-value') ?? text;
		if (!optionMatchesSelectValue(text, optionValue, value)) continue;
		await commitListboxChoice(active);
		return true;
	}
	return false;
}

function resolveBooleanTrigger(element: Element): Element {
	if (element.getAttribute('role') === 'switch' || element.getAttribute('role') === 'checkbox') {
		return element;
	}
	const nestedSwitch = element.querySelector('[role="switch"]');
	if (nestedSwitch) return nestedSwitch;
	if (element instanceof HTMLInputElement && element.type === 'checkbox') {
		const block = element.closest('div, label, fieldset, section, form') ?? element.parentElement;
		const siblingSwitch = block?.querySelector('[role="switch"]');
		if (siblingSwitch) return siblingSwitch;
	}
	return element;
}

function labelForControl(control: Element): HTMLLabelElement | null {
	if (control instanceof HTMLInputElement && control.id) {
		const label = document.querySelector(`label[for="${escapeCssIdent(control.id)}"]`);
		if (label instanceof HTMLLabelElement) return label;
	}
	const parentLabel = control.closest('label');
	if (parentLabel instanceof HTMLLabelElement) return parentLabel;
	if (
		control.getAttribute('role') === 'checkbox' ||
		control.getAttribute('data-slot') === 'checkbox'
	) {
		const row = control.closest('div, li, fieldset, label');
		if (row) {
			for (const candidate of row.querySelectorAll('label')) {
				if (candidate === control || candidate.contains(control)) continue;
				if (candidate.querySelector('[role="checkbox"], [data-slot="checkbox"]') === control) {
					return candidate;
				}
				if (
					candidate.compareDocumentPosition(control) &
					(Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_PRECEDING)
				) {
					return candidate;
				}
			}
			const next = control.nextElementSibling;
			if (next instanceof HTMLLabelElement) return next;
			const prev = control.previousElementSibling;
			if (prev instanceof HTMLLabelElement) return prev;
		}
	}
	return null;
}

export function isChoiceControlChecked(control: Element): boolean {
	if (control instanceof HTMLInputElement) return control.checked;
	if (control.getAttribute('aria-checked') === 'true') return true;
	if (control.getAttribute('data-state') === 'checked') return true;
	return false;
}

export function choiceLabelForControl(control: Element): string {
	const label = labelForControl(control);
	const fromLabel = label?.textContent?.trim();
	if (fromLabel) return fromLabel;
	if (control instanceof HTMLInputElement) {
		return control.value.trim();
	}
	return (control.textContent ?? '').trim();
}

function fillRadioGroup(element: Element, value: string): boolean {
	let radios: HTMLInputElement[] = [];
	if (element instanceof HTMLInputElement && element.type === 'radio') {
		const name = element.name.trim();
		if (name) {
			radios = Array.from(
				document.querySelectorAll<HTMLInputElement>(
					`input[type="radio"][name="${escapeCssIdent(name)}"]`
				)
			);
		} else {
			radios = [element];
		}
	} else {
		radios = Array.from(element.querySelectorAll('input[type="radio"]')).filter(
			(el): el is HTMLInputElement => el instanceof HTMLInputElement
		);
	}
	if (radios.length === 0) return false;

	for (const radio of radios) {
		const label = labelForControl(radio);
		const text = label?.textContent ?? '';
		if (optionMatchesValue(text, radio.value, value)) {
			if (!radio.checked) {
				radio.checked = true;
				radio.dispatchEvent(new Event('input', { bubbles: true }));
				radio.dispatchEvent(new Event('change', { bubbles: true }));
			}
			return true;
		}
	}
	return false;
}

async function fillSelectControl(element: Element, value: string): Promise<boolean> {
	if (element instanceof HTMLSelectElement) {
		return fillNativeSelect(element, value);
	}
	if (element instanceof HTMLInputElement && element.type === 'radio') {
		return fillRadioGroup(element, value);
	}
	const combobox = resolveComboboxTrigger(element);
	if (combobox) {
		return fillCombobox(combobox, value);
	}
	const nestedRadios = element.querySelectorAll('input[type="radio"]');
	if (nestedRadios.length > 0) {
		return fillRadioGroup(element, value);
	}
	const nestedSelect = element.querySelector('select');
	if (nestedSelect instanceof HTMLSelectElement) {
		return fillNativeSelect(nestedSelect, value);
	}
	return fillTextControl(element, value);
}

function toggleCheckboxControl(checkbox: HTMLInputElement | HTMLElement, desired: boolean): void {
	if (checkbox instanceof HTMLInputElement && checkbox.type === 'checkbox') {
		if (checkbox.checked !== desired) {
			checkbox.checked = desired;
			checkbox.dispatchEvent(new Event('input', { bubbles: true }));
			checkbox.dispatchEvent(new Event('change', { bubbles: true }));
		}
		return;
	}
	if (checkbox.getAttribute('role') === 'checkbox') {
		const pressed = checkbox.getAttribute('aria-checked') === 'true';
		if (pressed !== desired) {
			checkbox.click();
		}
	}
}

function activateCheckboxChoice(control: HTMLInputElement | HTMLElement): void {
	scrollControlIntoView(control);
	if (control instanceof HTMLInputElement && control.type === 'checkbox') {
		if (!control.checked) {
			const label = labelForControl(control);
			if (label instanceof HTMLElement) {
				label.click();
			} else {
				toggleCheckboxControl(control, true);
			}
		}
		return;
	}
	if (control.getAttribute('role') === 'checkbox') {
		if (control.getAttribute('aria-checked') !== 'true') {
			control.click();
		}
		return;
	}
	control.click();
}

function fillCheckboxGroupControl(element: Element, value: string): boolean {
	const tags = parseTagList(value);
	if (tags.length === 0) return false;
	const scope = checkboxGroupScope(element);
	const checkboxes = Array.from(
		scope.querySelectorAll(
			'input[type="checkbox"], [role="checkbox"], button[role="checkbox"], [data-slot="checkbox"]'
		)
	);
	if (checkboxes.length === 0) return false;

	let toggled = false;
	for (const tag of tags) {
		let matched = false;
		for (const checkbox of checkboxes) {
			if (
				!(checkbox instanceof HTMLInputElement) &&
				checkbox.getAttribute('role') !== 'checkbox' &&
				checkbox.getAttribute('data-slot') !== 'checkbox'
			) {
				continue;
			}
			const text = choiceLabelForControl(checkbox);
			const valueAttr =
				checkbox instanceof HTMLInputElement
					? checkbox.value
					: (checkbox.getAttribute('value') ?? '');
			if (!optionMatchesValue(text, valueAttr, tag)) continue;
			const alreadyChecked = isChoiceControlChecked(checkbox);
			if (!alreadyChecked) {
				activateCheckboxChoice(
					checkbox instanceof HTMLInputElement ? checkbox : (checkbox as HTMLElement)
				);
			}
			toggled = true;
			matched = true;
			break;
		}
		if (!matched) {
			/* Scroll the group so late categories in overflow lists can mount or come into view. */
			scrollControlIntoView(scope);
		}
	}
	return toggled;
}

function fillBooleanControl(element: Element, value: string): boolean {
	const desired = parseBooleanValue(value);
	element = resolveBooleanTrigger(element);

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
		target.focus();
		try {
			if (typeof document.execCommand === 'function') {
				document.execCommand('selectAll', false);
				if (document.execCommand('insertHTML', false, html)) {
					target.dispatchEvent(
						new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' })
					);
					target.dispatchEvent(new Event('change', { bubbles: true }));
					return true;
				}
			}
		} catch {
			/* fall through to DOM assignment */
		}
		replaceElementHtml(target, html);
		target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertFromPaste' }));
		target.dispatchEvent(new Event('change', { bubbles: true }));
		return true;
	}

	if (element instanceof HTMLTextAreaElement) {
		setNativeInputValue(element, richHtmlToPlainText(html));
		return true;
	}

	if (element instanceof HTMLInputElement && element.type !== 'file') {
		setNativeInputValue(element, richHtmlToPlainText(html));
		return true;
	}

	const plain = richHtmlToPlainText(html);
	if (plain) {
		return fillTextControl(element, plain);
	}
	return false;
}

function resolveTagsInputControl(element: Element, field?: LaunchStepField): HTMLInputElement | null {
	if (element instanceof HTMLInputElement && element.type !== 'file') {
		return element;
	}
	const nested = element.querySelector(
		'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]), textarea, input[role="combobox"]'
	);
	if (nested instanceof HTMLInputElement) return nested;
	if (field) {
		const resolved = resolveFieldElement(field);
		if (resolved instanceof HTMLInputElement) return resolved;
	}
	return null;
}

export function resolveTagsFillAnchor(element: Element, field?: LaunchStepField): HTMLElement | null {
	const input = resolveTagsInputControl(element, field);
	if (input) return input;
	const combobox = resolveComboboxTrigger(element);
	if (combobox) return combobox;
	if (field) {
		const resolved = resolveFieldElement(field);
		if (resolved instanceof HTMLElement) {
			return (
				resolveComboboxTrigger(resolved) ??
				(resolved instanceof HTMLInputElement ? resolved : null)
			);
		}
	}
	return null;
}

async function fillTagsControl(
	element: Element,
	value: string,
	field?: LaunchStepField
): Promise<boolean> {
	const tags = parseTagList(value);
	if (tags.length === 0) return false;

	if (
		field &&
		resolveLaunchFieldCatalogId(field) === LAUNCH_FIELD_CATALOG_IDS['uneed:tags']
	) {
		const { fillCatalogTagsControl } = await import('./catalogTagsFill.js');
		return fillCatalogTagsControl(element, tags, field);
	}

	const searchInput = resolveTagsInputControl(element, field);
	if (searchInput) {
		const { fillSectionScopedSearchTags } = await import('./sectionScopedTagsFill.js');
		if (field?.tagsScope === 'section') {
			return fillSectionScopedSearchTags(searchInput, tags);
		}
		const comboboxLike =
			searchInput.getAttribute('role') === 'combobox' ||
			searchInput.matches('[aria-autocomplete]') ||
			Boolean(resolveComboboxTrigger(searchInput));
		if (!comboboxLike) {
			for (const tag of tags) {
				searchInput.focus();
				setNativeInputValue(searchInput, tag);
				searchInput.dispatchEvent(new InputEvent('input', { bubbles: true, data: tag }));
				dispatchEnterKey(searchInput);
				await delay(50);
			}
			return true;
		}
		return fillSectionScopedSearchTags(searchInput, tags);
	}

	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		for (const tag of tags) {
			setNativeInputValue(element, tag);
			dispatchEnterKey(element);
		}
		return true;
	}

	const nestedInput = element.querySelector('input, textarea');
	if (nestedInput instanceof HTMLInputElement || nestedInput instanceof HTMLTextAreaElement) {
		return fillTagsControl(nestedInput, value, field);
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

export type ApplyUserValueToFormFieldOptions = {
	/** When false (default), rich_html edits are plain text → simple `<p>` HTML. */
	richAsHtml?: boolean;
};

/** Write a member-edited value into the live directory control (compare rail On page column). */
export async function applyUserValueToFormField(
	field: LaunchStepField,
	value: string,
	options?: ApplyUserValueToFormFieldOptions
): Promise<boolean> {
	const fillMode = resolveFillMode(field);
	if (fillMode === 'file' || fillMode === 'files') return false;
	const element = resolveFieldElement(field);
	if (!element) return false;
	let payload = value;
	if (fillMode === 'rich_html' && options?.richAsHtml !== true) {
		payload = plainTextToSimpleHtml(value);
	}
	return fillElementByMode(element, payload, fillMode, field);
}

export function isFormFieldUserEditable(fillMode: LaunchStepFieldFillMode | undefined): boolean {
	return fillMode !== 'file' && fillMode !== 'files' && fillMode !== 'select';
}

export async function fillElementByMode(
	element: Element,
	value: string,
	fillMode: LaunchStepFieldFillMode,
	field?: LaunchStepField
): Promise<boolean> {
	switch (fillMode) {
		case 'select':
			return fillSelectControl(element, value);
		case 'boolean':
			return fillBooleanControl(element, value);
		case 'rich_html':
			return fillRichHtmlControl(element, value);
		case 'tags':
			return fillTagsControl(element, value, field);
		case 'checkbox_group':
			return fillCheckboxGroupControl(element, value);
		default:
			return fillTextControl(element, value);
	}
}

/** Raw profile tag labels before catalog filtering (fill + compare warnings). */
function profileTagCandidatesForField(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField,
	options?: FillLaunchFieldOptions
): string[] {
	if (options?.valuesOverride?.length) {
		return options.valuesOverride.map((entry) => entry.trim()).filter(Boolean);
	}
	if (field.fillMode === 'tags' && (field.profileSourcePaths?.length ?? 0) > 0) {
		return collectRawItemsFromProfilePaths(snapshot, defaultTagProfilePathsForField(field));
	}
	const raw = resolveProfileValue(snapshot, field.profilePath);
	if (!raw?.trim()) return [];
	return parseTagList(raw);
}

export function fillableTagListForField(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField,
	options?: FillLaunchFieldOptions
): string[] {
	return fillableTagsForLaunchField(profileTagCandidatesForField(snapshot, field, options), field);
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

function isLikelyHttpUrl(value: string): boolean {
	return /^https?:\/\//i.test(value.trim());
}

function resolveProductNameFillValue(
	snapshot: AutoLaunchProfileSnapshot,
	candidate: string | null | undefined
): string | null {
	const fromProfile = resolveProfileValue(snapshot, 'name');
	if (candidate?.trim()) {
		const trimmed = candidate.trim();
		if (!isLikelyHttpUrl(trimmed)) return trimmed;
	}
	if (fromProfile?.trim() && !isLikelyHttpUrl(fromProfile)) return fromProfile.trim();
	return null;
}

function resolveFillValue(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField,
	options?: FillLaunchFieldOptions,
	context?: FillLaunchContext
): string | null {
	const isProductNameField = field.key === 'name' || field.profilePath === 'name';

	if (options?.valueOverride !== undefined && options.valueOverride !== null) {
		const trimmed = options.valueOverride.trim();
		if (trimmed.length === 0) return null;
		if (isProductNameField) {
			return resolveProductNameFillValue(snapshot, options.valueOverride);
		}
		return options.valueOverride;
	}
	if (options?.valuesOverride && options.valuesOverride.length > 0) {
		if (isProductNameField) {
			const scalar = options.valuesOverride.join(', ').trim();
			return resolveProductNameFillValue(snapshot, scalar);
		}
		return options.valuesOverride.join(', ');
	}
	let value = resolveLaunchProfileScalar(snapshot, field, context?.mainProfileSnapshot);
	if (isSocialLinkProfileField(field) && value?.trim()) {
		const productName = resolveProfileValue(snapshot, 'name')?.trim();
		if (productName && value.trim().toLowerCase() === productName.toLowerCase()) {
			return null;
		}
	}
	if (value && field.profilePath === 'description' && resolveFillMode(field) === 'text') {
		value = richHtmlToPlainText(value);
	}
	if (value) {
		value = applyLaunchFieldScalarCoercion(value, field);
		value = applyLaunchFieldScalarCap(value, field);
		if (resolveFillMode(field) === 'select') {
			value = applyLaunchFieldSelectCoercion(value, field);
		}
	}
	if (isProductNameField) {
		return resolveProductNameFillValue(snapshot, value);
	}
	return value;
}

function catalogGatedListFillResult(
	field: LaunchStepField,
	candidates: string[],
	fillable: string[]
): FieldFillResult | null {
	if (fillable.length > 0) return null;
	if (candidates.length > 0) {
		const message = catalogListFillSkipMessage(field);
		if (!message) return null;
		return {
			key: field.key,
			label: field.label,
			status: 'skipped',
			message,
		};
	}
	return { key: field.key, label: field.label, status: 'not_in_profile' };
}

export async function fillLaunchField(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField,
	context?: FillLaunchContext,
	options?: FillLaunchFieldOptions
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

	const catalogGatesListFill =
		(fillMode === 'tags' &&
			resolveLaunchFieldCatalogId(field) === LAUNCH_FIELD_CATALOG_IDS['uneed:tags']) ||
		(fillMode === 'checkbox_group' && fieldHasLaunchFieldCatalog(field));

	let value: string | null;
	if (fillMode === 'tags' || fillMode === 'checkbox_group') {
		const fillable = fillableTagListForField(snapshot, field, options);
		if (catalogGatesListFill) {
			const candidates = profileTagCandidatesForField(snapshot, field, options);
			const gated = catalogGatedListFillResult(field, candidates, fillable);
			if (gated) return gated;
		}
		value = fillable.length > 0 ? fillable.join(', ') : null;
	} else {
		value = resolveFillValue(snapshot, field, options, context);
	}
	if (value === null || value === undefined) {
		return { key: field.key, label: field.label, status: 'not_in_profile' };
	}

	const element = resolveFieldElement(field);
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
		const filled = await fillElementByMode(element, value, fillMode, field);
		if (!filled) {
			const catalogSkipMessage = catalogTagsDomFillSkipMessage(field);
			return {
				key: field.key,
				label: field.label,
				status: catalogSkipMessage ? 'skipped' : 'error',
				message: catalogSkipMessage ?? 'Could not set value for this control.',
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
	context?: FillLaunchContext,
	fillOptionsForField?: (field: LaunchStepField) => FillLaunchFieldOptions | undefined
): Promise<FieldFillResult[]> {
	const fields = step.fields ?? [];
	const results: FieldFillResult[] = [];
	for (const field of fields) {
		results.push(await fillLaunchField(snapshot, field, context, fillOptionsForField?.(field)));
	}
	return results;
}

export function countFilled(results: FieldFillResult[]): { filled: number; total: number } {
	const total = results.length;
	const filled = results.filter((r) => r.status === 'found' || r.status === 'skipped').length;
	return { filled, total };
}
