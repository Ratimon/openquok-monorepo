import type { LaunchStepField, LaunchStepFieldFillMode, NormalizedFieldValue } from 'openquok-common';
import { richHtmlToPlainText } from 'openquok-common';

import {
	choiceLabelForControl,
	isChoiceControlChecked,
	resolveFieldElement,
	resolveTagsFieldRoot,
} from './fillEngine.js';

function resolveFillMode(field: LaunchStepField): LaunchStepFieldFillMode {
	if (field.fillMode) return field.fillMode;
	if (field.profilePath === 'logo_url') return 'file';
	if (field.profilePath.includes('gallery_urls')) return 'files';
	return 'text';
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

function parseCommaTagList(value: string): string[] {
	return value
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean);
}

/** Combobox `value` on Uneed often appends glued pill text after the last comma-separated tag. */
function parseTagFieldInputValue(value: string): string[] {
	const trimmed = stripTagCounterCopy(value.trim());
	if (!trimmed) return [];

	const parts = parseCommaTagList(trimmed).map((part) => normalizeTagChipText(part));
	if (parts.length >= 2) {
		const head = parts.slice(0, -1).filter(isValidTagLabel);
		const last = parts[parts.length - 1] ?? '';
		for (let cut = 0; cut <= last.length; cut++) {
			const prefix = normalizeTagChipText(last.slice(0, cut));
			const tail = last.slice(cut);
			if (!prefix || !isValidTagLabel(prefix) || !tail) continue;
			if (isGluedCompositeOfTags(tail, [...head, prefix])) {
				return [...head, prefix];
			}
		}
		const strippedFull = stripRedundantGluedSuffix(trimmed, head);
		if (strippedFull !== trimmed) {
			return parseCommaTagList(strippedFull)
				.map((part) => normalizeTagChipText(part))
				.filter(isValidTagLabel);
		}
	}

	return parts.filter(isValidTagLabel);
}

function stripRemoveAffordance(text: string): string {
	return text
		.replace(/[×✕]\s*$/u, '')
		.replace(/\s+remove$/i, '')
		.trim();
}

function stripTagCounterCopy(text: string): string {
	return text
		.replace(/\d+\/\d+\s*tags(?:\s*[—–-]\s*maximum\s+reached)?/gi, '')
		.replace(/\d+\/\d+\s*tags\s*$/i, '')
		.trim();
}

function isTagLimitHelperText(text: string): boolean {
	return /^\d+\/\d+\s*tags(?:\s*[—–-]\s*maximum\s+reached)?\.?$/i.test(text.trim());
}

function isValidTagLabel(text: string): boolean {
	const cleaned = normalizeTagChipText(text);
	if (!cleaned || isTagLimitHelperText(cleaned)) return false;
	if (cleaned.length > 80) return false;
	if (/\d+\/\d+\s*tags/i.test(cleaned)) return false;
	return true;
}

function countRemovableChipWrappers(scope: Element): number {
	let count = 0;
	for (const wrap of scope.querySelectorAll('div, span')) {
		if (wrap.matches('input, textarea, select, label')) continue;
		if (!wrap.querySelector(':scope > button, :scope > [role="button"]')) continue;
		if (wrap.querySelector(':scope > div, :scope > span')?.querySelector('button, [role="button"]')) {
			continue;
		}
		const text = stripTagCounterCopy(normalizeTagChipText(wrap.textContent ?? ''));
		if (text && isValidTagLabel(text)) count += 1;
	}
	return count;
}

/** Parent flex rows that contain several pill chips — not a single label. */
function isAggregateTagChipContainer(el: Element): boolean {
	return countRemovableChipWrappers(el) > 1;
}

function normalizeTagChipText(raw: string): string {
	let cleaned = stripRemoveAffordance(raw);
	cleaned = stripTagCounterCopy(cleaned);
	if (/^\d+\/\d+\s*tags$/i.test(cleaned)) return '';
	const repeated = cleaned.match(/^(.{2,})\1$/u);
	if (repeated) {
		cleaned = repeated[1] ?? cleaned;
	}
	return cleaned;
}

function addUniqueTagLabel(labels: string[], seen: Set<string>, raw: string): void {
	const cleaned = normalizeTagChipText(raw);
	if (!cleaned || !isValidTagLabel(cleaned) || cleaned.includes('\n')) return;
	const key = cleaned.toLowerCase();
	if (seen.has(key)) return;
	seen.add(key);
	labels.push(cleaned);
}

function permuteTagStrings(items: string[]): string[][] {
	if (items.length <= 1) return [items];
	if (items.length > 5) return [];
	const out: string[][] = [];
	const walk = (prefix: string[], rest: string[]): void => {
		if (rest.length === 0) {
			out.push(prefix);
			return;
		}
		for (let index = 0; index < rest.length; index++) {
			const next = [...prefix, rest[index]!];
			const remaining = [...rest.slice(0, index), ...rest.slice(index + 1)];
			walk(next, remaining);
		}
	};
	walk([], items);
	return out;
}

function isGluedCompositeOfTags(candidate: string, tags: readonly string[]): boolean {
	if (tags.length < 2) return false;
	const c = candidate.toLowerCase().replace(/\s+/g, '');
	if (!c) return false;
	for (const perm of permuteTagStrings([...tags])) {
		const joined = perm.map((part) => part.toLowerCase().replace(/\s+/g, '')).join('');
		if (joined.length > 0 && c === joined) return true;
	}
	return false;
}

function peelGlueFromTagLabel(label: string, hints: readonly string[]): string {
	const normalized = normalizeTagChipText(label);
	const hintList = hints.filter(isValidTagLabel);
	if (hintList.some((hint) => hint.toLowerCase() === normalized.toLowerCase())) {
		return normalized;
	}
	for (const hint of hintList) {
		if (!normalized.toLowerCase().startsWith(hint.toLowerCase())) continue;
		const tail = normalized.slice(hint.length);
		if (tail && isGluedCompositeOfTags(tail, hintList)) return hint;
	}
	for (let cut = 0; cut <= normalized.length; cut++) {
		const prefix = normalizeTagChipText(normalized.slice(0, cut));
		const tail = normalized.slice(cut);
		if (!prefix || !isValidTagLabel(prefix) || !tail) continue;
		if (isGluedCompositeOfTags(tail, [...hintList, prefix])) return prefix;
	}
	return normalized;
}

function reconcileTagReadItems(
	fromInput: string[],
	chips: string[],
	maxItems: number
): string[] {
	const cleanChips = coerceTagDisplayItems(sanitizeTagChipLabels(chips));
	const hintForPeel = cleanChips.length > 0 ? cleanChips : fromInput;
	const parsedInput = fromInput
		.map((part) => peelGlueFromTagLabel(part, hintForPeel))
		.filter(isValidTagLabel);

	if (cleanChips.length > 0) {
		const chipKeys = new Set(cleanChips.map((tag) => tag.toLowerCase()));
		const inputLooksMashed = parsedInput.some(
			(tag) =>
				!chipKeys.has(tag.toLowerCase()) &&
				peelGlueFromTagLabel(tag, cleanChips).toLowerCase() !== tag.toLowerCase()
		);
		const chipsCoverInput =
			parsedInput.length === 0 ||
			parsedInput.every((tag) => chipKeys.has(tag.toLowerCase()));
		if (chipsCoverInput || inputLooksMashed || cleanChips.length >= parsedInput.length) {
			return cleanChips.slice(0, maxItems);
		}
	}

	return coerceTagDisplayItems(mergeTagReadItems(parsedInput, cleanChips, maxItems)).slice(
		0,
		maxItems
	);
}

/** Uneed mirrors combobox value with glued pill text (`Automation, 3D, X` + `Automation3DX`). */
function stripRedundantGluedSuffix(text: string, tags: readonly string[]): string {
	if (tags.length < 2 || !text) return text;
	const lowerNoSpace = text.toLowerCase().replace(/\s+/g, '');
	for (const perm of permuteTagStrings([...tags])) {
		const suffix = perm.map((part) => part.toLowerCase().replace(/\s+/g, '')).join('');
		if (suffix.length < 4 || !lowerNoSpace.endsWith(suffix) || lowerNoSpace.length <= suffix.length) {
			continue;
		}
		for (let index = 0; index <= text.length; index++) {
			const tail = text.slice(index);
			if (isGluedCompositeOfTags(tail, tags)) {
				const head = text.slice(0, index).trim().replace(/,\s*$/, '');
				return head || text;
			}
		}
	}
	return text;
}

/** Drop wrapper text that concatenates two or more real chip labels (PeerPush badge lists). */
export function filterCompositeTagLabels(labels: string[]): string[] {
	const unique = labels.map((entry) => entry.trim()).filter(Boolean);
	if (unique.length < 2) return unique;

	return unique.filter((candidate) => {
		const others = unique.filter((entry) => entry !== candidate);
		if (others.length < 2) return true;

		const candidateLower = candidate.toLowerCase();

		for (const perm of permuteTagStrings(others)) {
			const joined = perm.map((part) => part.toLowerCase()).join('');
			if (joined.length > 0 && candidateLower === joined) return false;
		}

		let matched = 0;
		let cursor = 0;
		const byLength = [...others].sort((a, b) => b.length - a.length);
		for (const other of byLength) {
			const otherLower = other.toLowerCase();
			const index = candidateLower.indexOf(otherLower, cursor);
			if (index >= 0) {
				matched += 1;
				cursor = index + otherLower.length;
			}
		}
		if (matched >= 2 && cursor === candidateLower.length) return false;

		return true;
	});
}

function hasNestedTagChipMatch(el: Element): boolean {
	const selector = '[class*="chip" i], [class*="tag" i], [class*="badge" i], [data-testid*="tag" i]';
	return Array.from(el.querySelectorAll(selector)).some(
		(nested) => nested !== el && el.contains(nested)
	);
}

function isLikelySingleTagChip(el: Element): boolean {
	if (el.querySelector(':scope > button, :scope > [role="button"]')) return true;
	if (el.matches('[data-testid*="tag" i]')) return true;
	const className = el.className;
	if (typeof className !== 'string') return false;
	if (/rounded-full|rounded-lg|pill|chip|badge/i.test(className)) return true;
	return el.children.length <= 2;
}

function isTagChipElementExcluded(el: Element): boolean {
	if (el.closest('[role="listbox"], [role="menu"], [data-radix-select-viewport], [cmdk-list]')) {
		return true;
	}
	if (el.matches('[role="option"]') || el.closest('[role="option"]')) {
		return true;
	}
	if (el instanceof HTMLElement) {
		const style = window.getComputedStyle(el);
		if (style.display === 'none' || style.visibility === 'hidden') return true;
		const opacity = style.opacity?.trim();
		if (opacity !== '' && opacity != null && Number(opacity) === 0) return true;
	}
	return false;
}

/** Heuristic: tag chips near the control (siblings / field container). */
function readTagChipLabels(container: Element): string[] {
	const seen = new Set<string>();
	const labels: string[] = [];

	const addLabel = (raw: string) => addUniqueTagLabel(labels, seen, raw);

	for (const el of container.querySelectorAll('[data-testid*="tag" i]')) {
		if (isTagChipElementExcluded(el)) continue;
		if (isAggregateTagChipContainer(el)) continue;
		if (hasNestedTagChipMatch(el)) continue;
		if (!isLikelySingleTagChip(el)) continue;
		addLabel(el.textContent ?? '');
	}

	for (const el of container.querySelectorAll('[class*="chip" i], [class*="tag" i], [class*="badge" i]')) {
		if (el.matches('input, textarea, select, label')) continue;
		if (isTagChipElementExcluded(el)) continue;
		if (isAggregateTagChipContainer(el)) continue;
		if (hasNestedTagChipMatch(el)) continue;
		if (!isLikelySingleTagChip(el)) continue;
		addLabel(el.textContent ?? '');
	}

	for (const wrap of container.querySelectorAll('div, span')) {
		if (wrap.matches('input, textarea, select, label')) continue;
		if (isTagChipElementExcluded(wrap)) continue;
		if (isAggregateTagChipContainer(wrap)) continue;
		const removeBtn = wrap.querySelector(':scope > button, :scope > [role="button"]');
		if (!removeBtn) continue;
		if (wrap.querySelector(':scope > div, :scope > span')?.querySelector('button, [role="button"]')) {
			continue;
		}
		let text = (wrap.textContent ?? '').trim();
		const btnText = (removeBtn.textContent ?? '').trim();
		if (btnText && text.endsWith(btnText)) {
			text = text.slice(0, Math.max(0, text.length - btnText.length)).trim();
		}
		if (!text || text.includes('\n')) continue;
		addLabel(text);
	}

	for (const el of container.querySelectorAll('[class*="rounded-full"], [class*="rounded-lg"]')) {
		if (!el.querySelector('button, [role="button"]')) continue;
		if (el.matches('input, textarea, select')) continue;
		if (isTagChipElementExcluded(el)) continue;
		if (isAggregateTagChipContainer(el)) continue;
		const btn = el.querySelector('button, [role="button"]');
		let text = (el.textContent ?? '').trim();
		if (btn) {
			const btnText = (btn.textContent ?? '').trim();
			if (btnText && text.endsWith(btnText)) {
				text = text.slice(0, Math.max(0, text.length - btnText.length)).trim();
			}
		}
		if (text && !text.includes('\n')) addLabel(text);
	}

	for (const btn of container.querySelectorAll('button')) {
		const aria = btn.getAttribute('aria-label') ?? '';
		if (/remove|delete|dismiss/i.test(aria)) {
			const sibling = btn.previousElementSibling;
			if (sibling && !(sibling instanceof HTMLInputElement)) {
				addLabel(sibling.textContent ?? '');
			}
			const parent = btn.parentElement;
			if (parent && parent !== container) {
				let text = (parent.textContent ?? '').trim();
				const btnText = (btn.textContent ?? '').trim();
				if (btnText && text.endsWith(btnText)) {
					text = text.slice(0, Math.max(0, text.length - btnText.length)).trim();
				}
				addLabel(text);
			}
		}
	}

	return filterCompositeTagLabels(labels);
}

function sanitizeTagChipLabels(chips: string[]): string[] {
	const normalized = chips
		.map((chip) => normalizeTagChipText(chip))
		.filter((chip) => chip.length > 0 && chip.length <= 120 && !chip.includes('\n'));
	const peeled = normalized.map((chip) => peelGlueFromTagLabel(chip, normalized));
	return filterCompositeTagLabels(peeled.filter(isValidTagLabel));
}

function mergeTagReadItems(
	fromInput: string[],
	chips: string[],
	maxItems: number
): string[] {
	const cleanChips = sanitizeTagChipLabels(chips).filter(isValidTagLabel);
	const validInput = fromInput
		.map((part) => normalizeTagChipText(part))
		.filter(isValidTagLabel);
	const seen = new Set<string>();
	const out: string[] = [];
	const push = (raw: string) => {
		const cleaned = normalizeTagChipText(raw);
		if (!cleaned || !isValidTagLabel(cleaned) || cleaned.includes('\n')) return;
		const key = cleaned.toLowerCase();
		if (seen.has(key)) return;
		seen.add(key);
		out.push(cleaned);
	};

	const chipsMatchingInput =
		validInput.length === 0 ||
		validInput.every((tag) =>
			cleanChips.some((chip) => chip.toLowerCase() === tag.toLowerCase())
		);

	if (validInput.length > 0 && chipsMatchingInput) {
		for (const part of validInput) push(part);
		return out.slice(0, maxItems);
	}

	if (cleanChips.length >= validInput.length && cleanChips.length > 0 && chipsMatchingInput) {
		const aligned =
			validInput.length === 0
				? cleanChips
				: cleanChips.filter((chip) =>
						validInput.some((tag) => tag.toLowerCase() === chip.toLowerCase())
					);
		for (const chip of aligned) push(chip);
		if (out.length > 0) return out.slice(0, maxItems);
	}

	for (const part of validInput) push(part);
	for (const chip of cleanChips) {
		if (isGluedCompositeOfTags(chip, validInput)) continue;
		if (out.some((tag) => tag.toLowerCase() === chip.toLowerCase())) continue;
		push(chip);
	}

	return out.slice(0, maxItems);
}

/** Compare-rail chip list: drop helper copy and glued multi-chip strings. */
export function coerceTagDisplayItems(items: readonly string[]): string[] {
	const hintTags: string[] = [];
	for (const item of items) {
		const parts = item.includes(',') ? parseCommaTagList(item) : [item];
		for (const part of parts) {
			const cleaned = normalizeTagChipText(part);
			if (isValidTagLabel(cleaned)) hintTags.push(cleaned);
		}
	}
	const dedupeHints = [...new Set(hintTags.map((tag) => tag.toLowerCase()))].map(
		(key) => hintTags.find((tag) => tag.toLowerCase() === key)!
	);
	const peelHints = dedupeHints.filter((tag) =>
		items.some((entry) => normalizeTagChipText(entry).toLowerCase() === tag.toLowerCase())
	);

	const expanded: string[] = [];
	for (const item of items) {
		let stripped = stripTagCounterCopy(normalizeTagChipText(item));
		if (!stripped) continue;
		stripped = stripRedundantGluedSuffix(stripped, dedupeHints.length > 0 ? dedupeHints : expanded);

		if (stripped.includes(',')) {
			const parts = parseCommaTagList(stripped)
				.map((part) => normalizeTagChipText(part))
				.filter(isValidTagLabel);
			if (parts.length > 1) {
				expanded.push(...parts);
				continue;
			}
		}

		const hintsForPeel =
			peelHints.length > 0 ? peelHints : expanded.length > 0 ? expanded : dedupeHints;
		if (hintsForPeel.length > 0 && isGluedCompositeOfTags(stripped, hintsForPeel)) continue;
		const peeled = peelGlueFromTagLabel(stripped, hintsForPeel);
		if (expanded.length > 0 && isGluedCompositeOfTags(peeled, expanded)) continue;
		if (peeled.toLowerCase() !== stripped.toLowerCase() && isValidTagLabel(peeled)) {
			expanded.push(peeled);
			continue;
		}
		if (isGluedCompositeOfTags(stripped, peelHints.length > 0 ? [...peelHints, ...expanded] : expanded)) {
			continue;
		}
		if (isValidTagLabel(stripped)) expanded.push(stripped);
	}

	const withoutComposites = filterCompositeTagLabels(expanded);
	const filtered = withoutComposites.filter(
		(candidate) => !isGluedCompositeOfTags(candidate, withoutComposites)
	);
	const seen = new Set<string>();
	const deduped: string[] = [];
	for (const tag of filtered) {
		const key = tag.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(tag);
	}
	return deduped;
}

function readTagsValue(element: Element, field?: LaunchStepField): NormalizedFieldValue {
	const kind: LaunchStepFieldFillMode = 'tags';
	const scope = field ? resolveTagsFieldRoot(field) ?? element : element;
	const chips = readTagChipLabels(scope);

	const maxChipRead =
		typeof field?.maxItems === 'number' && field.maxItems > 0 ? field.maxItems + 2 : 8;

	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		const fromInput = parseTagFieldInputValue(element.value);
		const items = reconcileTagReadItems(fromInput, chips, maxChipRead);
		return { kind, items, present: items.length > 0 };
	}

	const nestedInput = element.querySelector('input, textarea');
	if (nestedInput instanceof HTMLInputElement || nestedInput instanceof HTMLTextAreaElement) {
		const fromInput = parseTagFieldInputValue(nestedInput.value);
		const items = reconcileTagReadItems(fromInput, chips, maxChipRead);
		return { kind, items, present: items.length > 0 };
	}

	const items = coerceTagDisplayItems(sanitizeTagChipLabels(chips)).slice(0, maxChipRead);
	return { kind, items, present: items.length > 0 };
}

function escapeCssIdent(value: string): string {
	if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
		return CSS.escape(value);
	}
	return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function labelForControl(control: Element): HTMLLabelElement | null {
	if (control instanceof HTMLInputElement && control.id) {
		const label = document.querySelector(`label[for="${escapeCssIdent(control.id)}"]`);
		if (label instanceof HTMLLabelElement) return label;
	}
	const parentLabel = control.closest('label');
	if (parentLabel instanceof HTMLLabelElement) return parentLabel;
	return null;
}

function readSelectValue(element: Element): NormalizedFieldValue {
	const kind: LaunchStepFieldFillMode = 'select';
	let scalar: string | undefined;

	if (element instanceof HTMLSelectElement) {
		const option = element.options[element.selectedIndex];
		scalar = option ? (option.textContent ?? option.value).trim() : undefined;
	} else {
		const nested = element.querySelector('select');
		if (nested instanceof HTMLSelectElement) {
			const option = nested.options[nested.selectedIndex];
			scalar = option ? (option.textContent ?? option.value).trim() : undefined;
		} else if (element.getAttribute('role') === 'combobox') {
			scalar = (element.textContent ?? '').trim() || undefined;
		} else {
			const combobox = element.querySelector('[role="combobox"], button[aria-haspopup="listbox"]');
			if (combobox) {
				scalar = (combobox.textContent ?? '').trim() || undefined;
			}
		}
		if (!scalar) {
			const radios = element.querySelectorAll('input[type="radio"]');
			for (const radio of Array.from(radios)) {
				if (!(radio instanceof HTMLInputElement) || !radio.checked) continue;
				const label = labelForControl(radio);
				scalar = (label?.textContent ?? radio.value).trim() || undefined;
				break;
			}
			if (!scalar && element instanceof HTMLInputElement && element.type === 'radio' && element.checked) {
				const label = labelForControl(element);
				scalar = (label?.textContent ?? element.value).trim() || undefined;
			}
		}
	}

	const present = Boolean(scalar?.length);
	return { kind, scalar, present };
}

function readCheckboxGroupValue(element: Element): NormalizedFieldValue {
	const kind: LaunchStepFieldFillMode = 'checkbox_group';
	const choiceSelector =
		'input[type="checkbox"], [role="checkbox"], button[role="checkbox"], [data-slot="checkbox"]';
	const scope =
		element.querySelectorAll(choiceSelector).length > 1
			? element
			: (element.closest('fieldset, div, section, form') ?? element);
	const items: string[] = [];
	const seen = new Set<string>();
	const pushLabel = (text: string) => {
		const trimmed = text.trim();
		if (!trimmed) return;
		const key = trimmed.toLowerCase();
		if (seen.has(key)) return;
		seen.add(key);
		items.push(trimmed);
	};
	for (const checkbox of scope.querySelectorAll(choiceSelector)) {
		if (!isChoiceControlChecked(checkbox)) continue;
		pushLabel(choiceLabelForControl(checkbox));
	}
	return { kind, items, present: items.length > 0 };
}

function readBooleanValue(element: Element): NormalizedFieldValue {
	const kind: LaunchStepFieldFillMode = 'boolean';
	let on = false;
	let resolved = false;

	if (element instanceof HTMLInputElement) {
		if (element.type === 'checkbox' || element.type === 'radio') {
			on = element.checked;
			resolved = true;
		}
	} else {
		const role = element.getAttribute('role');
		if (role === 'switch' || role === 'checkbox') {
			on = element.getAttribute('aria-checked') === 'true';
			resolved = true;
		} else {
			const nested = element.querySelector(
				'input[type="checkbox"], input[type="radio"], [role="switch"], [role="checkbox"]'
			);
			if (nested) return readBooleanValue(nested);
		}
	}

	if (!resolved) {
		return { kind, present: false };
	}
	return { kind, scalar: on ? 'true' : 'false', present: true };
}

function readRichHtmlValue(element: Element): NormalizedFieldValue {
	const kind: LaunchStepFieldFillMode = 'rich_html';
	const target = findRichHtmlTarget(element);
	if (target) {
		const html = target.innerHTML.trim();
		const text = (target.textContent ?? '').trim();
		const present = html.length > 0 && text.length > 0;
		return { kind, scalar: html, present };
	}
	if (element instanceof HTMLTextAreaElement) {
		const scalar = element.value.trim();
		return { kind, scalar: scalar || undefined, present: scalar.length > 0 };
	}
	return { kind, present: false };
}

function resolveFileInputsInScope(element: Element): HTMLInputElement[] {
	if (element instanceof HTMLInputElement && element.type === 'file') {
		return [element];
	}
	return Array.from(element.querySelectorAll('input[type="file"]')).filter(
		(el): el is HTMLInputElement => el instanceof HTMLInputElement
	);
}

function readFileValue(element: Element, kind: 'file' | 'files'): NormalizedFieldValue {
	const inputs = resolveFileInputsInScope(element);
	let count = 0;
	for (const input of inputs) {
		count += input.files?.length ?? 0;
	}
	if (kind === 'file') {
		return { kind, present: count > 0 };
	}
	const items = count > 0 ? Array.from({ length: count }, (_, i) => `file-${i + 1}`) : undefined;
	return { kind, items, present: count > 0 };
}

function readTextValue(element: Element): NormalizedFieldValue {
	const kind: LaunchStepFieldFillMode = 'text';
	let scalar: string | undefined;

	if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
		if (element.type !== 'file') {
			scalar = element.value.trim() || undefined;
		}
	} else if (element instanceof HTMLSelectElement) {
		return readSelectValue(element);
	} else if (element instanceof HTMLElement && element.isContentEditable) {
		scalar = (element.textContent ?? '').trim() || undefined;
	}

	const present = Boolean(scalar?.length);
	return { kind, scalar, present };
}

function readNormalizedFromElement(
	element: Element,
	fillMode: LaunchStepFieldFillMode,
	field?: LaunchStepField
): NormalizedFieldValue {
	switch (fillMode) {
		case 'tags':
			return readTagsValue(element, field);
		case 'checkbox_group':
			return readCheckboxGroupValue(element);
		case 'select':
			return readSelectValue(element);
		case 'boolean':
			return readBooleanValue(element);
		case 'rich_html':
			return readRichHtmlValue(element);
		case 'file':
			return readFileValue(element, 'file');
		case 'files':
			return readFileValue(element, 'files');
		default:
			return readTextValue(element);
	}
}

/**
 * Read the current on-page value for a launch step field (live DOM).
 * Returns `null` when the control cannot be resolved on the page.
 */
export function readFormFieldValue(field: LaunchStepField): NormalizedFieldValue | null {
	const fillMode = resolveFillMode(field);
	const element = resolveFieldElement(field);
	if (!element) return null;
	const result = readNormalizedFromElement(element, fillMode, field);
	if (
		fillMode === 'text' &&
		field.profilePath === 'description' &&
		result.scalar &&
		result.scalar.includes('<')
	) {
		return {
			...result,
			scalar: richHtmlToPlainText(result.scalar),
		};
	}
	return result;
}
