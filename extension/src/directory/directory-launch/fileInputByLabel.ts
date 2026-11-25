import { pickControlNearestLabel } from './formFieldDom.js';

/** Dropzones often place `input[type="file"]` before the visible label — pick the input in the smallest scope. */
export function resolveFileInputInLabelScope(labelEl: Element): HTMLInputElement | null {
	let scope: Element | null = labelEl;
	for (let depth = 0; depth < 14 && scope; depth += 1) {
		const inputs = listFileInputsInElement(scope);
		if (inputs.length === 1) return inputs[0] ?? null;
		scope = scope.parentElement;
	}

	const form = labelEl.closest('form');
	const searchRoot = form ?? document.body;
	const all = listFileInputsInElement(searchRoot);
	if (all.length === 0) return null;
	const nearest = pickControlNearestLabel(labelEl, all);
	return nearest instanceof HTMLInputElement ? nearest : all[0] ?? null;
}

export function listFileInputsInElement(scope: Element): HTMLInputElement[] {
	return Array.from(scope.querySelectorAll('input[type="file"]')).filter(
		(el): el is HTMLInputElement => el instanceof HTMLInputElement
	);
}

export function leadingFieldLabelToken(visibleText: string): string {
	return visibleText.trim().split(/\n|[<(]/)[0]?.trim().toLowerCase() ?? '';
}

const FIELD_LABEL_SELECTORS =
	'label, [data-slot="form-label"], [data-slot="label"], p, span, h3, h4';

export function findFieldLabelAnchorByLeadingToken(token: string): Element | null {
	const needle = token.trim().toLowerCase();
	if (!needle) return null;
	for (const el of document.querySelectorAll(FIELD_LABEL_SELECTORS)) {
		if (leadingFieldLabelToken(el.textContent ?? '') === needle) return el;
	}
	return null;
}