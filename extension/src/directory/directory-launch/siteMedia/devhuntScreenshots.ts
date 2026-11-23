import type { FieldFillResult, LaunchStepField, LaunchStepFieldFillMode } from 'openquok-common';

import { assignFilesToInput } from '../fileInputAssign.js';
import { isGalleryProfileField, isLogoProfileField } from './profileMediaFields.js';
import type { SiteMediaAdapter, SiteMediaFileInputContext, SiteMediaFileInputOptions } from './types.js';

const SCREENSHOTS_CONTAINER_SELECTOR = '#tool-screenshots-container';

function screenshotsContainerOnPage(): boolean {
	return Boolean(document.querySelector(SCREENSHOTS_CONTAINER_SELECTOR));
}

function fileInputOutsideScreenshotsContainer(input: HTMLInputElement): boolean {
	return !input.closest(SCREENSHOTS_CONTAINER_SELECTOR);
}

function resolveGalleryFileInput(): HTMLInputElement | null {
	const byId = document.getElementById('image-upload');
	if (byId instanceof HTMLInputElement && byId.type === 'file') return byId;
	const container = document.querySelector(SCREENSHOTS_CONTAINER_SELECTOR);
	if (!container) return null;
	const scoped = container.querySelector('input#image-upload, input[type="file"]');
	return scoped instanceof HTMLInputElement ? scoped : null;
}

function countScreenshotPreviewImages(container: Element): number {
	return Array.from(container.querySelectorAll('img[src]')).filter((img) => {
		if (!(img instanceof HTMLImageElement)) return false;
		if (img.closest('label[for="image-upload"]')) return false;
		const src = img.getAttribute('src')?.trim() ?? '';
		return src.length > 0;
	}).length;
}

function screenshotUploadBusy(container: Element): boolean {
	const label = container.querySelector('label[for="image-upload"]');
	if (!(label instanceof HTMLElement)) return false;
	return label.className.includes('pointer-events-none');
}

async function waitForScreenshotPreviews(
	container: Element,
	expectedCount: number,
	timeoutMs = 45_000
): Promise<boolean> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const count = countScreenshotPreviewImages(container);
		if (count >= expectedCount && !screenshotUploadBusy(container)) {
			return true;
		}
		await new Promise((resolve) => setTimeout(resolve, 150));
	}
	return false;
}

function listFileInputsInsideContainer(): HTMLInputElement[] {
	const container = document.querySelector(SCREENSHOTS_CONTAINER_SELECTOR);
	if (!container) return [];
	return Array.from(container.querySelectorAll('input[type="file"]')).filter(
		(el): el is HTMLInputElement => el instanceof HTMLInputElement
	);
}

function fileInputHasChosenFile(input: HTMLInputElement): boolean {
	return Boolean(input.files && input.files.length > 0);
}

function slotLooksFilled(el: HTMLElement): boolean {
	if (el.querySelector('img[src], video[src], [class*="preview" i] img')) return true;
	return false;
}

function clickNextEmptyScreenshotSlot(container: Element): boolean {
	const candidates = container.querySelectorAll('label, button, [role="button"], div, span');
	for (const el of candidates) {
		if (!(el instanceof HTMLElement)) continue;
		if (slotLooksFilled(el)) continue;
		const text = (el.textContent ?? '').trim().toLowerCase();
		const aria = (el.getAttribute('aria-label') ?? '').toLowerCase();
		if (text.includes('remove') || aria.includes('remove')) continue;
		if (text === '×' || text === 'x') continue;
		if (!text.includes('upload')) continue;
		if (text.length > 40) continue;
		el.click();
		return true;
	}

	const labels = container.querySelectorAll('label[for]');
	for (const label of labels) {
		if (!(label instanceof HTMLLabelElement)) continue;
		const id = label.htmlFor;
		if (!id) continue;
		const input = document.getElementById(id);
		if (!(input instanceof HTMLInputElement) || input.type !== 'file') continue;
		if (fileInputHasChosenFile(input)) continue;
		label.click();
		return true;
	}

	return false;
}

function clickScreenshotUploadAffordance(container: Element): void {
	if (clickNextEmptyScreenshotSlot(container)) return;
	const anyLabel = container.querySelector('label');
	if (anyLabel instanceof HTMLElement) anyLabel.click();
}

function fileInputInsideContainer(options?: SiteMediaFileInputOptions): HTMLInputElement | null {
	const container = document.querySelector(SCREENSHOTS_CONTAINER_SELECTOR);
	if (!container) return null;

	const pickFrom = (inputs: HTMLInputElement[]): HTMLInputElement | null => {
		if (inputs.length === 0) return null;
		if (options?.preferEmpty) {
			const empty = inputs.find((input) => !fileInputHasChosenFile(input));
			return empty ?? null;
		}
		if (options?.index !== undefined && inputs[options.index]) {
			return inputs[options.index];
		}
		return inputs[0] ?? null;
	};

	let inputs = listFileInputsInsideContainer();
	let picked = pickFrom(inputs);
	if (picked) return picked;

	if (!options?.prime) return null;
	clickScreenshotUploadAffordance(container);
	inputs = listFileInputsInsideContainer();
	picked = pickFrom(inputs);
	if (picked) return picked;
	return inputs[0] ?? null;
}

export const devhuntScreenshotsAdapter: SiteMediaAdapter = {
	id: 'devhunt-screenshots',
	matchesPage: screenshotsContainerOnPage,
	resolveGalleryReadRoot() {
		return document.querySelector(SCREENSHOTS_CONTAINER_SELECTOR);
	},
	resolveLogoReadRoot(field) {
		if (!isLogoProfileField(field)) return null;
		const input = devhuntScreenshotsAdapter.resolveLogoFileInput(field);
		return input?.closest('section, fieldset, form, div') ?? input ?? null;
	},
	resolveGalleryFileInput(field, options) {
		if (!isGalleryProfileField(field)) return null;
		const primeUpload = options?.prime !== false;
		const devhuntInput = resolveGalleryFileInput();
		if (devhuntInput) return devhuntInput;
		return fileInputInsideContainer({
			prime: primeUpload && (options?.sequentialIndex ?? 0) === 0,
			index: options?.sequentialIndex,
			preferEmpty: options?.preferEmpty ?? options?.sequentialIndex !== undefined,
		});
	},
	resolveLogoFileInput(field) {
		if (!isLogoProfileField(field)) return null;
		const fromHint = listFileInputsFromSelectorHint(field.selectorHint);
		for (const input of fromHint) {
			if (fileInputOutsideScreenshotsContainer(input)) return input;
		}
		for (const el of document.querySelectorAll('input[type="file"]')) {
			if (el instanceof HTMLInputElement && fileInputOutsideScreenshotsContainer(el)) {
				return el;
			}
		}
		return null;
	},
	isGalleryPreviewImage() {
		return true;
	},
	resolveFileInput(field, fillMode, options, ctx) {
		if (!screenshotsContainerOnPage()) return undefined;
		const primeUpload = options?.prime !== false;
		if (isGalleryProfileField(field)) {
			const devhuntInput = resolveGalleryFileInput();
			if (devhuntInput) return devhuntInput;
			const inContainer = fileInputInsideContainer({
				prime: primeUpload && (options?.sequentialIndex ?? 0) === 0,
				index: options?.sequentialIndex,
				preferEmpty: options?.preferEmpty ?? options?.sequentialIndex !== undefined,
			});
			if (inContainer) return inContainer;
		}
		if (isLogoProfileField(field)) {
			const logo = devhuntScreenshotsAdapter.resolveLogoFileInput(field);
			if (logo) return logo;
		}

		const index = ctx.defaultFileInputIndex(field, fillMode);
		const fromHint = ctx.queryFileInputs(field.selectorHint);
		const scopedFromHint = isGalleryProfileField(field)
			? fromHint.filter((input) => Boolean(input.closest(SCREENSHOTS_CONTAINER_SELECTOR)))
			: isLogoProfileField(field)
				? fromHint.filter((input) => fileInputOutsideScreenshotsContainer(input))
				: fromHint;
		if (scopedFromHint[index]) return scopedFromHint[index];
		if (index === 0 && scopedFromHint[0]) return scopedFromHint[0];

		const all = Array.from(document.querySelectorAll('input[type="file"]')).filter(
			(el): el is HTMLInputElement => el instanceof HTMLInputElement
		);
		if (isGalleryProfileField(field)) {
			const inContainer = all.filter((input) =>
				Boolean(input.closest(SCREENSHOTS_CONTAINER_SELECTOR))
			);
			const slot = options?.sequentialIndex;
			if (slot !== undefined && inContainer[slot]) return inContainer[slot];
			if (options?.preferEmpty) {
				const empty = inContainer.find((input) => !fileInputHasChosenFile(input));
				if (empty) return empty;
			}
			return inContainer[0] ?? null;
		}
		if (isLogoProfileField(field)) {
			return all.find((input) => fileInputOutsideScreenshotsContainer(input)) ?? null;
		}
		return undefined;
	},
	async fillGalleryFiles(field, files) {
		if (!isGalleryProfileField(field)) return null;
		const container = document.querySelector(SCREENSHOTS_CONTAINER_SELECTOR);
		const devhuntInput = resolveGalleryFileInput();
		if (!container || !devhuntInput) {
			return {
				key: field.key,
				label: field.label,
				status: 'not_found',
				message: 'Screenshot upload control not found on this page.',
			};
		}
		let attached = 0;
		for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
			const file = files[fileIndex];
			while (screenshotUploadBusy(container)) {
				await new Promise((resolve) => setTimeout(resolve, 100));
			}
			devhuntInput.value = '';
			if (!assignFilesToInput(devhuntInput, [file])) break;
			const ready = await waitForScreenshotPreviews(container, fileIndex + 1);
			if (!ready) break;
			attached += 1;
		}
		if (attached === files.length) {
			return { key: field.key, label: field.label, status: 'found' };
		}
		if (attached > 0) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message: `Only ${attached} of ${files.length} screenshots uploaded. Wait for the gallery to finish loading, then fill again.`,
			};
		}
		return {
			key: field.key,
			label: field.label,
			status: 'error',
			message: 'Could not upload screenshots to the gallery control.',
		};
	},
};

function listFileInputsFromSelectorHint(selectorHint?: string): HTMLInputElement[] {
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