import type { FieldFillResult, LaunchStepField } from 'openquok-common';

import { assignFilesToInput } from '../fileInputAssign.js';
import { isGalleryProfileField, isLogoProfileField } from './profileMediaFields.js';
import type { SiteMediaAdapter, SiteMediaFileInputOptions } from './types.js';

/** Product gallery block headed by an `Images` section (preview thumbnails, optional empty slot). */
const PRODUCT_IMAGES_HEADING = 'Images';

export function productImagesSectionOnPage(): boolean {
	return Boolean(productImagesSectionElement());
}

export function productImagesSectionElement(): HTMLElement | null {
	for (const heading of document.querySelectorAll('h3')) {
		if (heading.textContent?.trim() !== PRODUCT_IMAGES_HEADING) continue;
		const parent = heading.parentElement;
		return parent instanceof HTMLElement ? parent : null;
	}
	return null;
}

function logoUploadBlock(): HTMLElement | null {
	for (const label of document.querySelectorAll('label[data-slot="label"], label')) {
		const text = label.textContent?.trim() ?? '';
		if (!/^Logo\b/i.test(text)) continue;
		const block = label.closest('section, fieldset, form, div') ?? label.parentElement;
		return block instanceof HTMLElement ? block : null;
	}
	return null;
}

function logoFileInput(): HTMLInputElement | null {
	const block = logoUploadBlock();
	const input = block?.querySelector('input[type="file"]');
	return input instanceof HTMLInputElement ? input : null;
}

export function countProductGalleryImagesInSection(
	section: HTMLElement = productImagesSectionElement()!
): number {
	if (!section) return 0;
	let count = 0;
	for (const img of section.querySelectorAll('img[alt^="Image"]')) {
		if (!(img instanceof HTMLImageElement)) continue;
		if (!isProductGalleryPreviewImage(img)) continue;
		count += 1;
	}
	return count;
}

export function isProductGalleryPreviewImage(img: HTMLImageElement): boolean {
	const alt = img.getAttribute('alt') ?? '';
	if (!/^Image(\s|\d|$)/.test(alt.trim())) return false;
	const src = img.getAttribute('src')?.trim() ?? '';
	if (!src || src.startsWith('data:image/svg')) return false;
	return true;
}

function galleryFileInput(): HTMLInputElement | null {
	const section = productImagesSectionElement();
	if (!section) return null;
	const direct = section.querySelector('input[type="file"]');
	if (direct instanceof HTMLInputElement) return direct;
	for (const zone of section.querySelectorAll('.cursor-pointer, [class*="cursor-pointer"]')) {
		const nested = zone.querySelector('input[type="file"]');
		if (nested instanceof HTMLInputElement) return nested;
	}
	return null;
}

function gallerySlotsAvailable(field: LaunchStepField): number {
	const section = productImagesSectionElement();
	if (!section) return 0;
	const cap = typeof field.maxItems === 'number' && field.maxItems > 0 ? field.maxItems : 3;
	return Math.max(0, cap - countProductGalleryImagesInSection(section));
}

async function waitForGalleryImageCount(
	section: HTMLElement,
	expectedMinimum: number,
	timeoutMs = 20_000
): Promise<boolean> {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		if (countProductGalleryImagesInSection(section) >= expectedMinimum) return true;
		await new Promise((resolve) => setTimeout(resolve, 200));
	}
	return false;
}

function pageHasLogoAndProductImagesSections(): boolean {
	return Boolean(logoUploadBlock() && productImagesSectionElement());
}

export const headingSectionGalleryAdapter: SiteMediaAdapter = {
	id: 'heading-section-product-gallery',
	matchesPage: pageHasLogoAndProductImagesSections,
	resolveGalleryReadRoot() {
		return productImagesSectionElement();
	},
	resolveLogoReadRoot() {
		const block = logoUploadBlock();
		return block ?? logoFileInput();
	},
	resolveGalleryFileInput(field, _options) {
		if (!isGalleryProfileField(field)) return null;
		return galleryFileInput();
	},
	resolveLogoFileInput(field) {
		if (!isLogoProfileField(field)) return null;
		return logoFileInput();
	},
	isGalleryPreviewImage(img, galleryReadRoot) {
		if (!galleryReadRoot) return isProductGalleryPreviewImage(img);
		return galleryReadRoot.contains(img) && isProductGalleryPreviewImage(img);
	},
	resolveFileInput(field) {
		if (!pageHasLogoAndProductImagesSections()) return undefined;
		if (isGalleryProfileField(field)) return galleryFileInput();
		if (isLogoProfileField(field)) return logoFileInput();
		return undefined;
	},
	async fillGalleryFiles(field, files) {
		if (!isGalleryProfileField(field)) return null;
		const section = productImagesSectionElement();
		if (!section) {
			return {
				key: field.key,
				label: field.label,
				status: 'not_found',
				message: 'Product images section not found on this page.',
			};
		}
		const slots = gallerySlotsAvailable(field);
		const filesToTry = files.slice(0, slots);
		if (filesToTry.length === 0) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message:
					'The gallery is full. Remove an image in the Images block to add more from your profile.',
			};
		}
		let attached = 0;
		for (const file of filesToTry) {
			const input = galleryFileInput();
			if (!input) break;
			input.value = '';
			const beforeCount = countProductGalleryImagesInSection(section);
			if (!assignFilesToInput(input, [file])) break;
			const ready = await waitForGalleryImageCount(section, beforeCount + 1);
			if (!ready) break;
			attached += 1;
			await new Promise((resolve) => setTimeout(resolve, 300));
		}
		if (attached === filesToTry.length) {
			return { key: field.key, label: field.label, status: 'found' };
		}
		if (attached > 0) {
			return {
				key: field.key,
				label: field.label,
				status: 'error',
				message: `Only ${attached} of ${filesToTry.length} images uploaded. Wait for autosave, then fill again.`,
			};
		}
		return {
			key: field.key,
			label: field.label,
			status: 'error',
			message: 'Could not upload images to the product gallery.',
		};
	},
};