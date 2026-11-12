/** Shared listbox / combobox DOM helpers for directory autofill (provider-agnostic). */

export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function setNativeInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
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

export function isFieldElementVisible(element: Element): boolean {
	if (!(element instanceof HTMLElement)) return false;
	if (element.closest('[hidden], [aria-hidden="true"]')) return false;
	const style = window.getComputedStyle(element);
	const opacity = style.opacity?.trim();
	if (
		style.display === 'none' ||
		style.visibility === 'hidden' ||
		(opacity !== '' && opacity != null && Number(opacity) === 0)
	) {
		return false;
	}
	const rect = element.getBoundingClientRect();
	if (rect.width > 0 && rect.height > 0) return true;
	if (element.clientWidth > 0 || element.clientHeight > 0) return true;
	return element.getClientRects().length > 0 || element.isConnected;
}

export function scrollControlIntoView(control: Element): void {
	if (!(control instanceof HTMLElement)) return;
	try {
		control.scrollIntoView({ block: 'center', inline: 'nearest' });
	} catch {
		/* ignore */
	}
}

export function isPopoverVisible(el: Element): boolean {
	if (!(el instanceof HTMLElement)) return false;
	if (el.getAttribute('aria-hidden') === 'true') return false;
	if (el.hasAttribute('hidden')) return false;
	const style = getComputedStyle(el);
	if (style.display === 'none' || style.visibility === 'hidden') return false;
	return el.getClientRects().length > 0;
}

/** Host that owns `aria-controls` (often the wrapper, not the inner toggle button). */
export function comboboxAriaControlsHost(combobox: HTMLElement): HTMLElement {
	const controls = combobox.getAttribute('aria-controls')?.trim();
	if (controls) return combobox;
	const wrapped = combobox.closest('[role="combobox"], [aria-controls]');
	if (wrapped instanceof HTMLElement) {
		const parentControls = wrapped.getAttribute('aria-controls')?.trim();
		if (parentControls) return wrapped;
	}
	return combobox;
}

/** Nuxt UI / Reka often puts `role="combobox"` on a wrapper; the real toggle is an inner `button`. */
export function comboboxInteractionTarget(combobox: HTMLElement): HTMLElement {
	if (combobox.matches('button, input[role="combobox"], input[aria-autocomplete]')) {
		return combobox;
	}
	const innerButton = combobox.querySelector('button:not([disabled])');
	if (innerButton instanceof HTMLElement) return innerButton;
	const innerInput = combobox.querySelector(
		'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
	);
	if (innerInput instanceof HTMLElement) return innerInput;
	return combobox;
}

export function listboxScopesForCombobox(combobox: HTMLElement): Element[] {
	const scopes: Element[] = [];
	const controlsId = comboboxAriaControlsHost(combobox).getAttribute('aria-controls')?.trim();
	if (controlsId) {
		const listbox = document.getElementById(controlsId);
		if (listbox) scopes.push(listbox);
	}
	for (const listbox of document.querySelectorAll('[role="listbox"]')) {
		if (!isPopoverVisible(listbox)) continue;
		if (scopes.includes(listbox)) continue;
		scopes.push(listbox);
	}
	return scopes;
}

function collectListboxChoices(scope: Element): HTMLElement[] {
	const picked: HTMLElement[] = [];
	for (const option of scope.querySelectorAll('[role="option"]')) {
		if (!(option instanceof HTMLElement)) continue;
		if (option.getAttribute('aria-disabled') === 'true' || option.hasAttribute('data-disabled')) {
			continue;
		}
		picked.push(option);
	}
	if (picked.length > 0) return picked;
	for (const item of scope.querySelectorAll(
		'[data-slot="item"], [role="menuitem"], [data-reka-collection-item]'
	)) {
		if (item instanceof HTMLElement) picked.push(item);
	}
	return picked;
}

/** Reka UI Select/Combobox commits on Enter when the option row is focused (click alone is not enough). */
async function commitListboxChoice(option: HTMLElement): Promise<void> {
	option.focus();
	option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
	option.click();
	option.dispatchEvent(
		new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true })
	);
	option.dispatchEvent(
		new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true })
	);
	await delay(80);
}

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

export async function tryPickListChoice(
	scope: Element,
	value: string,
	forSelect = false
): Promise<boolean> {
	for (const option of collectListboxChoices(scope)) {
		const text = option.textContent ?? '';
		const optionValue =
			option instanceof HTMLOptionElement
				? option.value
				: (option.getAttribute('data-value') ?? text);
		const matches = forSelect
			? optionMatchesSelectValue(text, optionValue, value)
			: optionMatchesTagValue(text, optionValue, value);
		if (!matches) continue;
		await commitListboxChoice(option);
		return true;
	}
	return false;
}

export function comboboxHostFromInput(input: HTMLElement): Element | null {
	return input.closest('[data-field], .relative, section, fieldset, form') ?? input.parentElement;
}

export async function ensureHeadlessComboboxPanelOpen(input: HTMLInputElement): Promise<void> {
	const host = comboboxHostFromInput(input);
	if (!host) return;
	for (const listbox of host.querySelectorAll('[role="listbox"]')) {
		if (isPopoverVisible(listbox)) return;
	}
	const toggle = host.querySelector(
		'button[aria-label="Toggle options"], button[aria-haspopup="listbox"]'
	);
	if (toggle instanceof HTMLButtonElement) {
		toggle.click();
		await delay(50);
	}
}

export async function waitForListboxPanel(trigger: HTMLElement): Promise<Element | null> {
	const controlsId = comboboxAriaControlsHost(trigger).getAttribute('aria-controls')?.trim();
	if (!controlsId) return null;
	for (let attempt = 0; attempt < 12; attempt++) {
		const panel = document.getElementById(controlsId);
		if (panel) return panel;
		await delay(attempt < 4 ? 25 : 50);
	}
	return null;
}

export async function openComboboxMenu(combobox: HTMLElement): Promise<HTMLElement> {
	const target = comboboxInteractionTarget(combobox);
	scrollControlIntoView(target);
	target.focus();
	for (const type of ['pointerdown', 'mousedown'] as const) {
		target.dispatchEvent(
			new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse' })
		);
	}
	target.click();
	await delay(120);
	await waitForListboxPanel(comboboxAriaControlsHost(combobox));
	return target;
}

export function dispatchEnterKey(element: HTMLElement): void {
	for (const type of ['keydown', 'keypress', 'keyup'] as const) {
		element.dispatchEvent(
			new KeyboardEvent(type, { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true })
		);
	}
}

export function dismissOpenListbox(focusTarget?: HTMLElement): void {
	const target = focusTarget ?? document.body;
	target.dispatchEvent(
		new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true })
	);
}

export function listboxPanelForTrigger(trigger: HTMLElement): HTMLElement | null {
	const controlsId = comboboxAriaControlsHost(trigger).getAttribute('aria-controls')?.trim();
	if (!controlsId) return null;
	const panel = document.getElementById(controlsId);
	return panel instanceof HTMLElement ? panel : null;
}

export function filterInputInListboxPanel(panel: Element): HTMLInputElement | null {
	const input = panel.querySelector(
		'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
	);
	return input instanceof HTMLInputElement ? input : null;
}

export function resolveComboboxTrigger(element: Element): HTMLElement | null {
	if (element instanceof HTMLElement) {
		if (element.getAttribute('role') === 'combobox') return element;
		if (
			element.matches(
				'button[aria-haspopup="listbox"], button[aria-haspopup="menu"], input[role="combobox"]'
			)
		) {
			return element;
		}
	}
	const selectors = [
		'[role="combobox"]',
		'button[aria-haspopup="listbox"]',
		'button[aria-haspopup="menu"]',
		'input[role="combobox"]',
	];
	for (const selector of selectors) {
		const nested = element.querySelector(selector);
		if (nested instanceof HTMLElement && isFieldElementVisible(nested)) {
			return nested;
		}
	}
	return null;
}
