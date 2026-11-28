import type { LaunchStepField } from 'openquok-common';

import { assignFilesToInput } from '../fileInputAssign.js';
import { normalizeStartupinspireScreenshotFile } from './startupinspireScreenshotImage.js';
import { findFieldLabelAnchorByLeadingToken } from '../fileInputByLabel.js';
import {
	delay,
	isFieldElementVisible,
	isPopoverVisible,
	safeDomClick,
	setNativeInputValue,
} from '../fillListboxDom.js';
import { isGalleryProfileField, isLogoProfileField } from './profileMediaFields.js';

export type StartupinspireWizardStep = 'Informations' | 'Logo' | 'Screenshots' | 'Milestones';

export function startupinspireStartupFormPage(doc: Document = document): boolean {
	const path = doc.defaultView?.location?.pathname?.toLowerCase() ?? '';
	return (
		path.startsWith('/dashboard/startup/create') || path.startsWith('/dashboard/startup/edit')
	);
}

function collapseTechToken(value: string): string {
	return value.trim().toLowerCase().replace(/[\s._-]+/g, '');
}

function technologyMatchTokens(value: string): string[] {
	const base = value.trim().toLowerCase();
	if (!base) return [];
	const tokens = new Set<string>([base, collapseTechToken(base)]);
	const aliasGroups: string[][] = [
		['node.js', 'nodejs', 'node'],
		['postgresql', 'postgres'],
		['sveltekit', 'svelte kit', 'svelte'],
		['typescript', 'ts'],
		['javascript', 'js'],
		['supabase'],
		['clickup', 'click up'],
	];
	for (const group of aliasGroups) {
		if (group.some((entry) => base === entry || collapseTechToken(entry) === collapseTechToken(base))) {
			for (const entry of group) {
				tokens.add(entry);
				tokens.add(collapseTechToken(entry));
			}
		}
	}
	return [...tokens];
}

function optionMatchScore(optionText: string, value: string): number {
	const text = optionText.trim().toLowerCase();
	const textCollapsed = collapseTechToken(text);
	if (!text) return 0;
	let best = 0;
	for (const token of technologyMatchTokens(value)) {
		const tokenCollapsed = collapseTechToken(token);
		if (text === token || textCollapsed === tokenCollapsed) return 100;
		if (text === tokenCollapsed || textCollapsed === token) return 95;
		if (textCollapsed === tokenCollapsed && textCollapsed.length >= 3) return 90;
		if (token.length >= 4 && text.includes(token)) best = Math.max(best, 70);
		if (text.length >= 4 && token.includes(text)) best = Math.max(best, 65);
		if (
			tokenCollapsed.length >= 4 &&
			(textCollapsed.includes(tokenCollapsed) || tokenCollapsed.includes(textCollapsed))
		) {
			best = Math.max(best, 60);
		}
	}
	return best;
}

function optionMatchesTechnology(optionText: string, value: string): boolean {
	return optionMatchScore(optionText, value) >= 60;
}

/** Selected chip labels on a PrimeNG `p-multiselect` (StartupInspire technology field). */
export function readStartupinspireMultiselectChipLabels(element: Element): string[] {
	const root =
		element.matches('p-multiselect, .p-multiselect') ?
			element
		:	element.querySelector('p-multiselect, .p-multiselect');
	if (!root) return [];
	const labels: string[] = [];
	const seen = new Set<string>();
	for (const chip of root.querySelectorAll(
		'.p-multiselect-chip-item, .p-multiselect-chip, .p-multiselect-display-chip'
	)) {
		const raw =
			chip.querySelector('.p-chip-label, [class*="chip-label"]')?.textContent?.trim() ??
			chip.textContent?.replace(/\s+/g, ' ').trim() ??
			'';
		if (!raw) continue;
		const key = raw.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		labels.push(raw);
	}
	return labels;
}

export function activateStartupinspireWizardStepSync(
	stepLabel: StartupinspireWizardStep,
	doc: Document = document
): boolean {
	for (const step of doc.querySelectorAll('p-step')) {
		const text = step.textContent?.replace(/\s+/g, ' ').trim() ?? '';
		if (text !== stepLabel) continue;
		const clickTarget =
			step.querySelector<HTMLElement>('button, a, [role="button"], [tabindex]') ??
			(step instanceof HTMLElement ? step : null);
		if (clickTarget) {
			clickTarget.click();
			return true;
		}
	}
	for (const el of doc.querySelectorAll('p-step *, [class*="stepper"] *')) {
		if (!(el instanceof HTMLElement)) continue;
		if (el.textContent?.replace(/\s+/g, ' ').trim() !== stepLabel) continue;
		el.click();
		return true;
	}
	for (const el of doc.querySelectorAll('button, [role="button"]')) {
		if (!(el instanceof HTMLElement)) continue;
		if (el.textContent?.replace(/\s+/g, ' ').trim() !== stepLabel) continue;
		el.click();
		return true;
	}
	return false;
}

export async function activateStartupinspireWizardStep(
	stepLabel: StartupinspireWizardStep,
	doc: Document = document
): Promise<boolean> {
	if (!activateStartupinspireWizardStepSync(stepLabel, doc)) return false;
	await delay(250);
	return true;
}

const STARTUPINSPIRE_TEXT_FIELD_CONTROLS: Partial<Record<string, string>> = {
	name: 'startup_name',
	tagline: 'startup_headline',
	website: 'startup_url',
	description: 'startup_description',
};

function resolveStartupinspireTextControl(
	formControlName: string,
	doc: Document = document
): HTMLElement | null {
	const roots: ParentNode[] = [];
	const panel = visibleStartupinspireWizardPanel(doc);
	if (panel) roots.push(panel);
	roots.push(doc);
	const selectors = [
		`[formcontrolname="${formControlName}"]`,
		`[formControlName="${formControlName}"]`,
		`input[name="${formControlName}"]`,
		`textarea[name="${formControlName}"]`,
	];
	for (const root of roots) {
		for (const selector of selectors) {
			try {
				const el = root.querySelector(selector);
				if (el instanceof HTMLElement && isFieldElementVisible(el)) return el;
			} catch {
				/* invalid selector */
			}
		}
	}
	if (formControlName === 'startup_description') {
		for (const root of roots) {
			const rich = root.querySelector(
				'.ProseMirror, .tiptap, [contenteditable="true"][aria-label*="description" i]'
			);
			if (rich instanceof HTMLElement && isFieldElementVisible(rich)) return rich;
		}
	}
	return null;
}

function visibleStartupinspireWizardPanel(doc: Document = document): HTMLElement | null {
	for (const panel of doc.querySelectorAll('p-step-panel')) {
		if (!(panel instanceof HTMLElement)) continue;
		if (panel.hasAttribute('hidden')) continue;
		if (isFieldElementVisible(panel)) return panel;
	}
	return doc.querySelector<HTMLElement>('p-step-panels, [class*="step-panels"]');
}

/** Wizard panel for a step label (works when the step tab is not active). */
export function resolveStartupinspireWizardPanel(
	stepLabel: StartupinspireWizardStep,
	doc: Document = document
): HTMLElement | null {
	const steps = [...doc.querySelectorAll('p-step')];
	const stepIndex = steps.findIndex(
		(step) => (step.textContent?.replace(/\s+/g, ' ').trim() ?? '') === stepLabel
	);
	if (stepIndex >= 0) {
		const panels = doc.querySelectorAll('p-step-panel');
		const panel = panels[stepIndex];
		if (panel instanceof HTMLElement) return panel;
	}
	if (stepLabel === 'Screenshots') {
		for (const h3 of doc.querySelectorAll('h3')) {
			if (!/add screenshots/i.test(h3.textContent ?? '')) continue;
			const block = h3.closest('p-step-panel, section, div');
			if (block instanceof HTMLElement) return block;
		}
	}
	if (stepLabel === 'Logo') {
		for (const panel of doc.querySelectorAll('p-step-panel')) {
			if (!(panel instanceof HTMLElement)) continue;
			if (panel.querySelector('app-upload-single')) return panel;
		}
	}
	return null;
}

export function prepareStartupinspireLogoDomAccess(doc: Document = document): void {
	if (!startupinspireStartupFormPage(doc)) return;
	activateStartupinspireWizardStepSync('Logo', doc);
}

export function prepareStartupinspireScreenshotsDomAccess(doc: Document = document): void {
	if (!startupinspireStartupFormPage(doc)) return;
	activateStartupinspireWizardStepSync('Screenshots', doc);
}

export function resolveStartupinspireLogoReadRoot(doc: Document = document): Element | null {
	const panel = resolveStartupinspireWizardPanel('Logo', doc);
	if (panel) {
		const host = panel.querySelector('app-upload-single, .upload-logo-wrapper');
		if (host) return host;
	}
	const input = resolveStartupinspireLogoFileInput(doc);
	return input?.closest('app-upload-single, .upload-logo-wrapper') ?? null;
}

export function resolveStartupinspireScreenshotsReadRoot(doc: Document = document): Element | null {
	const panel = resolveStartupinspireWizardPanel('Screenshots', doc);
	if (panel) {
		const host =
			panel.querySelector('app-upload:not(app-upload-single), .screenshot-grid, app-upload') ??
			panel;
		return host;
	}
	return screenshotUploadBlock(doc);
}

const STARTUPINSPIRE_TECHNOLOGY_SELECTORS = [
	'p-multiselect[formcontrolname="startup_technology"]',
	'[formcontrolname="startup_technology"].p-multiselect',
	'.p-multiselect[formcontrolname="startup_technology"]',
] as const;

function resolveStartupinspireTechnologyMultiselect(
	root: ParentNode,
	visibleOnly: boolean
): HTMLElement | null {
	for (const selector of STARTUPINSPIRE_TECHNOLOGY_SELECTORS) {
		const hit = root.querySelector<HTMLElement>(selector);
		if (!hit) continue;
		const ms =
			hit.matches('p-multiselect, .p-multiselect') ?
				hit
			:	hit.closest('p-multiselect, .p-multiselect');
		if (!(ms instanceof HTMLElement)) continue;
		if (!visibleOnly || isFieldElementVisible(ms)) return ms;
	}
	return null;
}

function startupinspireInformationsPanel(doc: Document): HTMLElement | null {
	for (const panel of doc.querySelectorAll('p-step-panel')) {
		if (!(panel instanceof HTMLElement)) continue;
		if (resolveStartupinspireTechnologyMultiselect(panel, false)) return panel;
	}
	const anchor = findFieldLabelAnchorByLeadingToken('technology stack');
	return anchor?.closest('p-step-panel') instanceof HTMLElement ?
			(anchor.closest('p-step-panel') as HTMLElement)
		:	null;
}

/** Wizard step that hosts the technology multiselect (for DOM read while another step is focused). */
export function prepareStartupinspireTechnologyDomAccess(doc: Document = document): void {
	if (!startupinspireStartupFormPage(doc)) return;
	activateStartupinspireWizardStepSync('Informations', doc);
}

export function resolveStartupinspireTechnologyControl(
	doc: Document = document,
	options?: { includeOffStepPanel?: boolean }
): HTMLElement | null {
	const anchor = findFieldLabelAnchorByLeadingToken('technology stack');
	if (anchor) {
		const block = anchor.closest('div, section, fieldset') ?? anchor.parentElement;
		const ms = block?.querySelector('p-multiselect, .p-multiselect');
		if (ms instanceof HTMLElement && isFieldElementVisible(ms)) return ms;
	}

	const panel = visibleStartupinspireWizardPanel(doc);
	const roots: ParentNode[] = panel ? [panel, doc] : [doc];
	for (const root of roots) {
		const scoped = resolveStartupinspireTechnologyMultiselect(root, true);
		if (scoped) return scoped;
		for (const selector of ['p-multiselect', '.p-multiselect'] as const) {
			const hit = root.querySelector<HTMLElement>(selector);
			if (!hit) continue;
			const ms =
				hit.matches('p-multiselect, .p-multiselect') ?
					hit
				:	hit.closest('p-multiselect, .p-multiselect');
			if (ms instanceof HTMLElement && isFieldElementVisible(ms)) return ms;
		}
	}

	if (options?.includeOffStepPanel) {
		const infoPanel = startupinspireInformationsPanel(doc);
		if (infoPanel) {
			const hiddenScoped = resolveStartupinspireTechnologyMultiselect(infoPanel, false);
			if (hiddenScoped) return hiddenScoped;
		}
	}

	return null;
}

function multiselectOverlay(doc: Document = document): HTMLElement | null {
	for (const selector of [
		'.p-multiselect-overlay',
		'.p-multiselect-panel',
		'[data-pc-section="overlay"]',
	]) {
		for (const el of doc.querySelectorAll(selector)) {
			if (!(el instanceof HTMLElement) || !isPopoverVisible(el)) continue;
			if (el.querySelector('.p-multiselect-option, [role="option"], .p-multiselect-list')) {
				return el;
			}
		}
	}
	for (const listbox of doc.querySelectorAll('[role="listbox"]')) {
		if (!(listbox instanceof HTMLElement) || !isPopoverVisible(listbox)) continue;
		if (!listbox.querySelector('.p-multiselect-option, [role="option"]')) continue;
		const host = listbox.closest(
			'.p-multiselect-overlay, .p-component-overlay, .p-overlay, .p-overlay-visible'
		);
		if (host instanceof HTMLElement) return host;
		return listbox;
	}
	return null;
}

function multiselectTrigger(root: HTMLElement): HTMLElement {
	return (
		root.querySelector<HTMLElement>('.p-multiselect-dropdown') ??
		root.querySelector<HTMLElement>('.p-multiselect-label-container') ??
		root.querySelector<HTMLElement>('[role="combobox"]') ??
		root
	);
}

function multiselectOptionLabel(option: HTMLElement): string {
	const label = option.querySelector('.p-multiselect-option-label, .p-chip-label');
	return (label?.textContent ?? option.textContent ?? '').replace(/\s+/g, ' ').trim();
}

async function openStartupinspireMultiselectOverlay(
	root: HTMLElement,
	doc: Document
): Promise<HTMLElement | null> {
	for (let attempt = 0; attempt < 5; attempt += 1) {
		safeDomClick(multiselectTrigger(root));
		await delay(90 + attempt * 40);
		const overlay = multiselectOverlay(doc);
		if (overlay) return overlay;
	}
	return null;
}

function multiselectFilterInput(overlay: HTMLElement): HTMLInputElement | null {
	const filter = overlay.querySelector<HTMLInputElement>(
		'input.p-multiselect-filter, .p-multiselect-filter-container input, input[type="text"], input:not([type="hidden"])'
	);
	return filter instanceof HTMLInputElement ? filter : null;
}

async function selectOptionInOverlay(overlay: HTMLElement, value: string): Promise<boolean> {
	const deadline = Date.now() + 1_600;
	while (Date.now() < deadline) {
		let bestTarget: HTMLElement | null = null;
		let bestScore = 0;
		for (const option of overlay.querySelectorAll(
			'[role="option"], .p-multiselect-option, li.p-multiselect-item'
		)) {
			if (!(option instanceof HTMLElement)) continue;
			if (option.getAttribute('aria-disabled') === 'true') continue;
			const text = multiselectOptionLabel(option);
			const score = optionMatchScore(text, value);
			if (score > bestScore) {
				bestScore = score;
				bestTarget = option;
			}
		}
		if (bestTarget && bestScore >= 60) {
			if (
				bestTarget.getAttribute('aria-selected') === 'true' ||
				bestTarget.getAttribute('aria-checked') === 'true'
			) {
				return true;
			}
			const target =
				bestTarget.querySelector<HTMLElement>('[data-pc-section="option"]') ??
				bestTarget.querySelector<HTMLElement>('input[type="checkbox"]')?.closest('li') ??
				bestTarget;
			safeDomClick(target);
			await delay(110);
			return true;
		}
		await delay(120);
	}
	return false;
}

async function resetMultiselectFilter(overlay: HTMLElement): Promise<void> {
	const filter = multiselectFilterInput(overlay);
	if (!filter) return;
	setNativeInputValue(filter, '');
	filter.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
	await delay(140);
}

async function closeStartupinspireMultiselectOverlay(doc: Document): Promise<void> {
	doc.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
	await delay(100);
	if (multiselectOverlay(doc)) {
		doc.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await delay(100);
	}
}

async function pickStartupinspireTechnologyOption(
	overlay: HTMLElement,
	value: string
): Promise<boolean> {
	const filter = multiselectFilterInput(overlay);
	if (filter) {
		setNativeInputValue(filter, '');
		filter.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
		await delay(80);
		setNativeInputValue(filter, value);
		filter.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }));
		filter.dispatchEvent(new Event('keyup', { bubbles: true }));
		filter.focus();
		await delay(420);
	}
	return selectOptionInOverlay(overlay, value);
}

function startupinspireChipRemoveTarget(chip: Element): Element | null {
	if (!(chip instanceof HTMLElement)) return null;
	return (
		chip.querySelector('button, [role="button"]') ??
		chip.querySelector('[data-pc-section="removeicon"]') ??
		chip.querySelector('.p-multiselect-chip-icon, .p-chip-remove-icon')
	);
}

async function clearStartupinspireTechnologySelections(
	root: HTMLElement,
	doc: Document
): Promise<void> {
	const clearIcon = root.querySelector(
		'.p-multiselect-clear-icon, [data-pc-section="clearicon"]'
	);
	if (clearIcon instanceof HTMLElement && isFieldElementVisible(clearIcon)) {
		safeDomClick(clearIcon);
		await delay(160);
	}

	let safety = 0;
	while (safety < 12) {
		const chip = root.querySelector('.p-multiselect-chip-item, .p-multiselect-chip');
		if (!chip) break;
		const removeTarget = startupinspireChipRemoveTarget(chip);
		if (!removeTarget) break;
		safeDomClick(removeTarget);
		await delay(110);
		safety += 1;
	}

	const overlay = await openStartupinspireMultiselectOverlay(root, doc);
	if (!overlay) return;

	for (const option of overlay.querySelectorAll<HTMLElement>(
		'[role="option"][aria-selected="true"], .p-multiselect-option[aria-selected="true"], .p-multiselect-option.p-highlight'
	)) {
		safeDomClick(option);
		await delay(60);
	}
	const filter = multiselectFilterInput(overlay);
	if (filter) {
		setNativeInputValue(filter, '');
		filter.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'deleteContentBackward' }));
	}
	doc.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
	await delay(80);
}

export async function fillStartupinspireTechnologyStack(
	values: string[],
	doc: Document = document
): Promise<boolean> {
	prepareStartupinspireTechnologyDomAccess(doc);
	await delay(220);

	let root = resolveStartupinspireTechnologyControl(doc);
	if (!root) return false;
	const normalized = values.map((entry) => entry.trim()).filter(Boolean);
	if (normalized.length === 0) return false;

	try {
		await clearStartupinspireTechnologySelections(root, doc);
	} catch {
		/* chip clear is best-effort — continue filling profile tags */
	}
	await delay(120);
	await closeStartupinspireMultiselectOverlay(doc);

	let attached = 0;
	let overlay = await openStartupinspireMultiselectOverlay(root, doc);
	if (!overlay) return false;

	for (const value of normalized) {
		const freshRoot = resolveStartupinspireTechnologyControl(doc);
		if (freshRoot) root = freshRoot;

		if (!multiselectOverlay(doc)) {
			overlay = await openStartupinspireMultiselectOverlay(root, doc);
			if (!overlay) continue;
		} else {
			overlay = multiselectOverlay(doc)!;
		}

		const picked = await pickStartupinspireTechnologyOption(overlay, value);
		if (picked) attached += 1;

		await resetMultiselectFilter(overlay);
	}

	await closeStartupinspireMultiselectOverlay(doc);
	return attached > 0;
}

export function resolveStartupinspireLogoFileInput(doc: Document = document): HTMLInputElement | null {
	const panel = resolveStartupinspireWizardPanel('Logo', doc);
	if (panel) {
		const scoped = panel.querySelector<HTMLInputElement>(
			'app-upload-single input[type="file"], input[type="file"][accept*="image"]'
		);
		if (scoped instanceof HTMLInputElement) return scoped;
	}
	const visiblePanel = visibleStartupinspireWizardPanel(doc);
	const inPanel = visiblePanel?.querySelector<HTMLInputElement>(
		'app-upload-single input[type="file"], input[type="file"][accept*="image"]'
	);
	return inPanel instanceof HTMLInputElement ? inPanel : null;
}

function screenshotUploadBlock(doc: Document = document): HTMLElement | null {
	const panel = resolveStartupinspireWizardPanel('Screenshots', doc);
	if (panel) {
		const host = panel.querySelector('app-upload');
		if (host instanceof HTMLElement) return host;
	}
	for (const h3 of doc.querySelectorAll('h3')) {
		if (!/add screenshots/i.test(h3.textContent ?? '')) continue;
		const block = h3.closest('p-step-panel, section, div') ?? h3.parentElement;
		const nested = block?.querySelector('app-upload');
		if (nested instanceof HTMLElement) return nested;
	}
	return null;
}

export function resolveStartupinspireScreenshotFileInput(doc: Document = document): HTMLInputElement | null {
	const block = screenshotUploadBlock(doc);
	if (block) {
		const scoped = block.querySelector('input[type="file"]');
		if (scoped instanceof HTMLInputElement) return scoped;
	}
	const panel = resolveStartupinspireWizardPanel('Screenshots', doc);
	if (panel) {
		for (const input of panel.querySelectorAll<HTMLInputElement>('input[type="file"]')) {
			if (input.closest('app-upload-single')) continue;
			return input;
		}
	}
	for (const input of doc.querySelectorAll<HTMLInputElement>('input[type="file"]')) {
		if (input.closest('app-upload-single, .upload-logo-wrapper')) continue;
		const host = input.closest('app-upload, .upload-trigger');
		if (!host) continue;
		if (!/upload screenshots/i.test(host.textContent ?? '')) continue;
		return input;
	}
	return null;
}

export async function waitForStartupinspireScreenshotFileInput(
	doc: Document = document,
	timeoutMs = 10_000
): Promise<HTMLInputElement | null> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const input = resolveStartupinspireScreenshotFileInput(doc);
		if (input) return input;
		await delay(120);
	}
	return null;
}

export async function confirmStartupinspireCropDialog(
	headerNeedle: string,
	doc: Document = document,
	timeoutMs = 12_000
): Promise<boolean> {
	const want = headerNeedle.trim().toLowerCase();
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		for (const dialog of doc.querySelectorAll('p-dialog, .p-dialog, [role="dialog"]')) {
			if (!(dialog instanceof HTMLElement)) continue;
			if (!isPopoverVisible(dialog)) continue;
			const title =
				dialog
					.querySelector('.p-dialog-title, [class*="dialog-title"], [class*="p-dialog-header"]')
					?.textContent?.trim()
					.toLowerCase() ?? '';
			if (want && title && !title.includes(want)) continue;
			if (!title && want && !dialog.querySelector('image-cropper, .crop-thumb-strip')) continue;

			const primary = dialog.querySelector<HTMLButtonElement>(
				'button.p-button-primary, .p-button-primary, button[class*="p-button-primary"]'
			);
			if (primary?.disabled) continue;
			if (primary) {
				await delay(450);
				if (primary.disabled) continue;
				primary.click();
				await delay(300);
				return true;
			}
		}
		await delay(120);
	}
	return false;
}

export async function prepareStartupinspireLogoUpload(doc: Document = document): Promise<void> {
	if (!startupinspireStartupFormPage(doc)) return;
	await activateStartupinspireWizardStep('Logo', doc);
	await delay(150);
}

export async function prepareStartupinspireScreenshotUpload(doc: Document = document): Promise<void> {
	if (!startupinspireStartupFormPage(doc)) return;
	await activateStartupinspireWizardStep('Screenshots', doc);
	await delay(450);
}

export function resolveStartupinspireFieldElement(field: LaunchStepField): Element | null {
	if (!startupinspireStartupFormPage()) return null;

	const textControl = STARTUPINSPIRE_TEXT_FIELD_CONTROLS[field.key];
	if (textControl) {
		const resolved = resolveStartupinspireTextControl(textControl);
		if (resolved) return resolved;
	}

	if (field.key === 'technology' || /technology/i.test(field.label)) {
		return resolveStartupinspireTechnologyControl();
	}

	if (isLogoProfileField(field)) {
		const input = resolveStartupinspireLogoFileInput();
		if (input) return input.closest('app-upload-single') ?? input.parentElement ?? input;
	}

	if (isGalleryProfileField(field)) {
		const input = resolveStartupinspireScreenshotFileInput();
		if (input) {
			return (
				input.closest('app-upload, .upload-trigger, .screenshot-grid') ?? input.parentElement ?? input
			);
		}
	}

	return null;
}

export async function assignStartupinspireLogoFile(
	file: File,
	doc: Document = document
): Promise<boolean> {
	await prepareStartupinspireLogoUpload(doc);
	const input = resolveStartupinspireLogoFileInput(doc);
	if (!input) return false;
	if (!assignFilesToInput(input, [file])) return false;
	await delay(200);
	return confirmStartupinspireCropDialog('Crop Logo', doc);
}

export async function assignStartupinspireScreenshotFiles(
	files: File[],
	doc: Document = document
): Promise<{ attached: number; total: number }> {
	await prepareStartupinspireScreenshotUpload(doc);
	const firstInput = await waitForStartupinspireScreenshotFileInput(doc);
	if (!firstInput) {
		return { attached: 0, total: files.length };
	}
	let attached = 0;
	for (const file of files) {
		const input = (await waitForStartupinspireScreenshotFileInput(doc, 4_000)) ?? firstInput;
		if (!input) break;
		const prepared = await normalizeStartupinspireScreenshotFile(file);
		if (!assignFilesToInput(input, [prepared])) break;
		await delay(250);
		const confirmed = await confirmStartupinspireCropDialog('screenshot', doc, 20_000);
		if (!confirmed) break;
		attached += 1;
		await delay(350);
	}
	return { attached, total: files.length };
}