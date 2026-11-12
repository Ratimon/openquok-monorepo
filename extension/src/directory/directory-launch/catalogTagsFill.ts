import type { LaunchStepField } from 'openquok-common';
import { LAUNCH_FIELD_CATALOG_IDS, matchUneedOfficialTag, resolveLaunchFieldCatalogId } from 'openquok-common';

import {
	comboboxAriaControlsHost,
	delay,
	dismissOpenListbox,
	dispatchEnterKey,
	filterInputInListboxPanel,
	isPopoverVisible,
	listboxPanelForTrigger,
	listboxScopesForCombobox,
	openComboboxMenu,
	setNativeInputValue,
	tryPickListChoice,
	waitForListboxPanel,
} from './fillListboxDom.js';
import { resolveTagsFieldRoot, resolveTagsFillAnchor } from './fillEngine.js';
import { readFormFieldValue } from './readFormField.js';

function tagLabelFromChipWrap(wrap: Element): string {
	const btn = wrap.querySelector('button, [role="button"]');
	let text = (wrap.textContent ?? '').trim();
	if (btn) {
		const btnText = (btn.textContent ?? '').trim();
		if (btnText && text.endsWith(btnText)) {
			text = text.slice(0, Math.max(0, text.length - btnText.length)).trim();
		}
	}
	return text.replace(/[×✕]\s*$/u, '').trim();
}

async function removeTagChip(scope: Element, label: string): Promise<boolean> {
	const needle = label.trim().toLowerCase();
	const candidates = scope.querySelectorAll(
		'div, span, [class*="rounded-full"], [class*="rounded-lg"]'
	);
	for (const wrap of candidates) {
		if (wrap.matches('input, textarea, select, label')) continue;
		const text = tagLabelFromChipWrap(wrap);
		if (text.toLowerCase() !== needle) continue;
		const btn =
			wrap.querySelector(':scope > button, :scope > [role="button"]') ??
			wrap.querySelector('button[aria-label*="remove" i], button[aria-label*="delete" i]');
		if (!(btn instanceof HTMLElement)) continue;
		btn.focus();
		btn.click();
		await delay(80);
		btn.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true })
		);
		await delay(120);
		return true;
	}
	return false;
}

async function syncOfficialTagsBeforeFill(
	element: Element,
	field: LaunchStepField,
	targetTags: string[]
): Promise<boolean> {
	const maxTags =
		typeof field.maxItems === 'number' && field.maxItems > 0 ? field.maxItems : 3;
	const scope = resolveTagsFieldRoot(field) ?? element;
	const targetKeys = new Set(targetTags.map((tag) => tag.toLowerCase()));

	for (let attempt = 0; attempt < 6; attempt++) {
		const onForm = readFormFieldValue(field)?.items ?? [];
		const extra = onForm.filter((entry) => !targetKeys.has(entry.toLowerCase()));
		if (extra.length === 0) break;
		let removed = false;
		for (const existing of extra) {
			if (await removeTagChip(scope, existing)) {
				removed = true;
				await delay(100);
			}
		}
		if (!removed) return false;
	}

	const afterRemove = readFormFieldValue(field)?.items ?? [];
	if (afterRemove.some((entry) => !targetKeys.has(entry.toLowerCase()))) {
		return false;
	}

	for (const tag of targetTags) {
		if (targetTags.indexOf(tag) > maxTags - 1) break;
		while ((readFormFieldValue(field)?.items?.length ?? 0) >= maxTags) {
			const removable = (readFormFieldValue(field)?.items ?? []).find(
				(entry) => !targetKeys.has(entry.toLowerCase())
			);
			if (!removable) return false;
			if (!(await removeTagChip(scope, removable))) return false;
			await delay(100);
		}
	}

	return true;
}

async function openListboxPopupPicker(anchor: HTMLElement): Promise<HTMLElement> {
	const isPopupTrigger =
		anchor.matches('button[aria-haspopup="listbox"][aria-label*="popup" i]') ||
		anchor.getAttribute('aria-label') === 'Show popup';
	if (isPopupTrigger) {
		anchor.focus();
		anchor.click();
		await delay(120);
		return anchor;
	}
	return openComboboxMenu(anchor);
}

async function clickListOptionForOfficialTag(tag: string, near?: HTMLElement): Promise<boolean> {
	const listValue = matchUneedOfficialTag(tag) ?? tag;
	const scopes: Element[] = [];
	if (near) {
		const panel = listboxPanelForTrigger(near);
		if (panel) scopes.push(panel);
		scopes.push(...listboxScopesForCombobox(comboboxAriaControlsHost(near)));
	}
	if (scopes.length === 0) {
		for (const listbox of document.querySelectorAll('[role="listbox"]')) {
			if (isPopoverVisible(listbox)) scopes.push(listbox);
		}
	}
	for (const scope of scopes) {
		if (await tryPickListChoice(scope, listValue, true)) return true;
	}
	return false;
}

async function fillUneedOfficialCatalogTags(
	element: Element,
	tags: string[],
	field: LaunchStepField
): Promise<boolean> {
	const anchor = resolveTagsFillAnchor(element, field);
	if (!anchor) return false;
	const officialTargets = tags
		.map((raw) => matchUneedOfficialTag(raw))
		.filter((tag): tag is string => Boolean(tag))
		.slice(0, field.maxItems ?? 3);
	if (officialTargets.length === 0) return false;
	if (!(await syncOfficialTagsBeforeFill(element, field, officialTargets))) return false;

	for (const tag of officialTargets) {
		const onForm = readFormFieldValue(field)?.items ?? [];
		if (onForm.some((entry) => entry.toLowerCase() === tag.toLowerCase())) continue;

		if (
			anchor instanceof HTMLInputElement &&
			anchor.getAttribute('role') !== 'combobox' &&
			!anchor.matches('input[aria-autocomplete]')
		) {
			anchor.focus();
			setNativeInputValue(anchor, tag);
			anchor.dispatchEvent(new InputEvent('input', { bubbles: true, data: tag }));
			let picked = await clickListOptionForOfficialTag(tag, anchor);
			if (!picked) {
				dispatchEnterKey(anchor);
				picked = true;
			}
			dismissOpenListbox(anchor);
			if (!picked) return false;
			continue;
		}

		const interaction = await openListboxPopupPicker(anchor);
		let panel = listboxPanelForTrigger(anchor);
		if (!panel && interaction instanceof HTMLElement) {
			panel = (await waitForListboxPanel(interaction)) as HTMLElement | null;
		}
		const filter = panel ? filterInputInListboxPanel(panel) : null;
		if (filter) {
			filter.focus();
			setNativeInputValue(filter, tag);
			filter.dispatchEvent(new InputEvent('input', { bubbles: true, data: tag }));
			await delay(40);
		}
		let picked = panel ? await tryPickListChoice(panel, tag, true) : false;
		if (!picked) {
			picked = await clickListOptionForOfficialTag(tag, anchor);
		}
		if (!picked) {
			for (const scope of listboxScopesForCombobox(anchor)) {
				if (await tryPickListChoice(scope, tag, true)) {
					picked = true;
					break;
				}
			}
		}
		if (!picked) {
			for (const listbox of document.querySelectorAll('[role="listbox"]')) {
				if (!isPopoverVisible(listbox)) continue;
				if (await tryPickListChoice(listbox, tag, true)) {
					picked = true;
					break;
				}
			}
		}
		if (!picked) {
			dispatchEnterKey(filter ?? interaction);
		}
		dismissOpenListbox(interaction);
		if (!picked) return false;
		await delay(60);
	}
	const onForm = readFormFieldValue(field)?.items ?? [];
	const matchedCount = officialTargets.filter((target) =>
		onForm.some((entry) => entry.toLowerCase() === target.toLowerCase())
	).length;
	return matchedCount > 0;
}

/** Catalog-backed multi-tag DOM fill (`tagsCatalog` in shipped extension config). */
export async function fillCatalogTagsControl(
	element: Element,
	tags: string[],
	field: LaunchStepField
): Promise<boolean> {
	const catalogId = resolveLaunchFieldCatalogId(field);
	if (catalogId === LAUNCH_FIELD_CATALOG_IDS['uneed:tags']) {
		return fillUneedOfficialCatalogTags(element, tags, field);
	}
	return false;
}
