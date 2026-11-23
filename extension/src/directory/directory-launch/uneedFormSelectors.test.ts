import { UNEED_JOIN_LINE_EXTENSION_CONFIG } from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveFieldElement } from './fillEngine.js';
import { readFormFieldValue } from './readFormField.js';

/** Minimal DOM shaped like uneed.best edit waiting-line media tab (Nov 2026). */
function mountUneedMediaTab(options?: { gallerySlots?: number; showGalleryUpload?: boolean }): void {
	const slots = options?.gallerySlots ?? 2;
	const root = document.createElement('div');

	const logoLabel = document.createElement('label');
	logoLabel.textContent = 'Logo *';
	logoLabel.setAttribute('data-slot', 'label');
	root.append(logoLabel);

	const logoZone = document.createElement('div');
	logoZone.className = 'cursor-pointer';
	const logoInput = document.createElement('input');
	logoInput.type = 'file';
	logoInput.id = 'single';
	logoInput.accept = 'image/png';
	logoInput.className = 'hidden';
	logoZone.append(logoInput);
	root.append(logoZone);

	const launchVideoHeading = document.createElement('h3');
	launchVideoHeading.textContent = 'Launch Video';
	root.append(launchVideoHeading);

	const imagesBlock = document.createElement('div');
	const imagesHeading = document.createElement('h3');
	imagesHeading.textContent = 'Images';
	imagesBlock.append(imagesHeading);

	const row = document.createElement('div');
	row.className = 'flex flex-col gap-4 sm:flex-row';
	for (let index = 0; index < slots; index += 1) {
		const card = document.createElement('div');
		const img = document.createElement('img');
		img.alt = 'Image ' + String(index);
		img.src =
			'https://backend.uneed.best/storage/v1/object/public/product_medias/demo/' + String(index) + '.png';
		card.append(img);
		row.append(card);
	}
	if (options?.showGalleryUpload) {
		const uploadZone = document.createElement('div');
		uploadZone.className = 'cursor-pointer';
		const galleryInput = document.createElement('input');
		galleryInput.type = 'file';
		galleryInput.id = 'gallery-upload';
		galleryInput.accept = 'image/png';
		galleryInput.className = 'hidden';
		uploadZone.append(galleryInput);
		row.append(uploadZone);
	}
	imagesBlock.append(row);
	root.append(imagesBlock);

	document.body.append(root);
}

describe('Uneed media tab selector smoke', () => {
	beforeEach(() => {
		mountUneedMediaTab({ gallerySlots: 2 });
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('resolves logo and gallery when product images use preview thumbnails only', () => {
		const mediaStep = UNEED_JOIN_LINE_EXTENSION_CONFIG.steps.find((step) => step.id === 'media');
		const logo = mediaStep?.fields.find((field) => field.key === 'logo');
		const gallery = mediaStep?.fields.find((field) => field.key === 'gallery');
		expect(logo).toBeDefined();
		expect(gallery).toBeDefined();
		expect(resolveFieldElement(logo!)).not.toBeNull();
		expect(resolveFieldElement(gallery!)).not.toBeNull();
		expect(readFormFieldValue(logo!)).not.toBeNull();
		const galleryRead = readFormFieldValue(gallery!);
		expect(galleryRead).not.toBeNull();
		expect(galleryRead?.kind).toBe('files');
		expect(galleryRead?.items?.length).toBe(2);
	});

	it('finds gallery upload input inside the Images block when a slot is open', () => {
		document.body.innerHTML = '';
		mountUneedMediaTab({ gallerySlots: 1, showGalleryUpload: true });
		const gallery = UNEED_JOIN_LINE_EXTENSION_CONFIG.steps
			.find((step) => step.id === 'media')
			?.fields.find((field) => field.key === 'gallery');
		expect(gallery).toBeDefined();
		expect(readFormFieldValue(gallery!)).not.toBeNull();
	});
});