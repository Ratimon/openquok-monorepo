/**
 * Multi-tag fill for `tagsScope: "section"` fields (type-ahead combobox inside a labeled block).
 * Driven by shipped extension config — not provider-specific.
 */

import {
	comboboxAriaControlsHost,
	comboboxHostFromInput,
	delay,
	dismissOpenListbox,
	dispatchEnterKey,
	ensureHeadlessComboboxPanelOpen,
	isPopoverVisible,
	listboxPanelForTrigger,
	listboxScopesForCombobox,
	setNativeInputValue,
	tryPickListChoice,
} from './fillListboxDom.js';

async function tryClickSuggestNewTag(host: Element, tag: string): Promise<boolean> {
	const needle = tag.trim();
	if (!needle) return false;
	for (const btn of host.querySelectorAll('button[type="button"]')) {
		if (!(btn instanceof HTMLButtonElement) || btn.disabled) continue;
		const text = (btn.textContent ?? '').trim();
		if (!/suggest/i.test(text)) continue;
		if (!text.toLowerCase().includes(needle.toLowerCase())) continue;
		btn.click();
		await delay(100);
		return true;
	}
	return false;
}

async function pickTagFromVisibleListboxes(tag: string, near?: HTMLElement): Promise<boolean> {
	const scopes: Element[] = [];
	let suggestHost: Element | null = null;
	if (near) {
		suggestHost = comboboxHostFromInput(near);
		const panel = listboxPanelForTrigger(near);
		if (panel && isPopoverVisible(panel)) scopes.push(panel);
		for (const scope of listboxScopesForCombobox(comboboxAriaControlsHost(near))) {
			if (!scopes.includes(scope)) scopes.push(scope);
		}
		if (suggestHost) {
			for (const listbox of suggestHost.querySelectorAll('[role="listbox"]')) {
				if (!isPopoverVisible(listbox)) continue;
				if (!scopes.includes(listbox)) scopes.push(listbox);
			}
		}
	}
	if (scopes.length === 0) {
		for (const listbox of document.querySelectorAll('[role="listbox"]')) {
			if (!isPopoverVisible(listbox)) continue;
			scopes.push(listbox);
		}
	}
	for (const scope of scopes) {
		if (await tryPickListChoice(scope, tag, false)) return true;
	}
	if (suggestHost && (await tryClickSuggestNewTag(suggestHost, tag))) return true;
	return false;
}

/** Type-ahead multi-select tags inside a section-scoped combobox (no catalog chip sync). */
export async function fillSectionScopedSearchTags(
	input: HTMLInputElement | HTMLTextAreaElement,
	tags: string[]
): Promise<boolean> {
	let added = 0;
	for (const tag of tags) {
		input.focus();
		setNativeInputValue(input, tag);
		input.dispatchEvent(new InputEvent('input', { bubbles: true, data: tag }));
		if (input instanceof HTMLInputElement) {
			await ensureHeadlessComboboxPanelOpen(input);
		}
		let picked = false;
		for (let attempt = 0; attempt < 8 && !picked; attempt++) {
			if (attempt > 0) await delay(40);
			picked = await pickTagFromVisibleListboxes(tag, input instanceof HTMLInputElement ? input : undefined);
		}
		if (!picked && input instanceof HTMLInputElement) {
			picked = await tryClickSuggestNewTag(comboboxHostFromInput(input) ?? input, tag);
		}
		if (!picked) {
			dispatchEnterKey(input);
		} else {
			dismissOpenListbox(input instanceof HTMLInputElement ? input : undefined);
		}
		setNativeInputValue(input, '');
		input.dispatchEvent(new InputEvent('input', { bubbles: true, data: '' }));
		added += 1;
		await delay(35);
	}
	return added > 0;
}
