import { DEVHUNT_TOOL_FORM_EXTENSION_CONFIG } from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AutoLaunchProfileSnapshot } from 'openquok-common';

import { fillLaunchField, resolveFieldElement } from './fillEngine.js';
import { readFormFieldValue } from './readFormField.js';

/** Minimal DOM shaped like devhunt.org/account/tools/new (verified from live page bundle, Nov 2026). */
function mountDevhuntSubmitForm(): void {
	document.body.innerHTML = `
		<div id="form-container">
			<label>Tool name</label>
			<input name="tool_name" placeholder="My Awesome Dev Tool" value="openquok" />
			<label>Catchy slogan</label>
			<input name="slogan" placeholder="Supercharge Your Development Workflow!" />
			<label>Tool website URL</label>
			<input name="tool_website" placeholder="https://myawesomedevtool.com/" type="url" />
			<label>Quick Description</label>
			<textarea name="tool_description" placeholder="Briefly explain what your tool does. HTML is supported">OpenQuok is an open-source Content OS for social scheduling.</textarea>
			<div id="pricing-container">
				<label>Tool pricing type</label>
				<input type="radio" name="pricing_type" value="1" />
				<input type="radio" name="pricing_type" value="2" />
			</div>
			<label>GitHub repo URL (optional)</label>
			<input placeholder="https://github.com/username/myawesomedevtool" />
			<label>Demo video (optional)</label>
			<input placeholder="Demo video (optional). YouTube or mp4 link" />
			<label>Tool logo</label>
			<input id="logo-upload" type="file" accept="image/png,image/jpeg" style="opacity:0;position:absolute;width:1px;height:1px" />
			<div id="tool-screenshots-container">
				<label>Tool screenshots</label>
				<div class="mt-4 flex flex-wrap gap-3" id="devhunt-images-uploader">
					<label for="image-upload" id="devhunt-upload-label" class="border-dashed">Upload</label>
					<input id="image-upload" type="file" accept="image/*" class="sr-only" />
				</div>
			</div>
		</div>
	`;
}

describe('DevHunt submit form selector smoke', () => {
	beforeEach(() => {
		mountDevhuntSubmitForm();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('resolves every configured field against the live-shaped DOM', () => {
		const fields = DEVHUNT_TOOL_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		expect(fields[0]?.key).toBe('logo');
		expect(fields[1]?.key).toBe('gallery');
		const missing: string[] = [];
		for (const field of fields) {
			if (field.key === 'categories') continue;
			const el = resolveFieldElement(field);
			if (!el) missing.push(field.key);
		}
		expect(missing, `unresolved fields: ${missing.join(', ')}`).toEqual([]);
	});

	it('resolves logo and gallery controls when file inputs are hidden', () => {
		const fields = DEVHUNT_TOOL_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const logo = fields.find((f) => f.key === 'logo');
		const gallery = fields.find((f) => f.key === 'gallery');
		expect(logo).toBeDefined();
		expect(gallery).toBeDefined();
		expect(resolveFieldElement(logo!)).not.toBeNull();
		expect(resolveFieldElement(gallery!)).not.toBeNull();
		const logoRead = readFormFieldValue(logo!);
		const galleryRead = readFormFieldValue(gallery!);
		expect(logoRead).not.toBeNull();
		expect(galleryRead).not.toBeNull();
		expect(logoRead?.kind).toBe('file');
		expect(galleryRead?.kind).toBe('files');
	});

	it('reads multiple screenshot slots when DevHunt exposes several file inputs', () => {
		const container = document.getElementById('tool-screenshots-container');
		expect(container).not.toBeNull();
		const extra = document.createElement('input');
		extra.type = 'file';
		extra.accept = 'image/*';
		container?.appendChild(extra);
		const gallery = DEVHUNT_TOOL_FORM_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'gallery'
		);
		expect(gallery).toBeDefined();
		const galleryRead = readFormFieldValue(gallery!);
		expect(galleryRead?.kind).toBe('files');
		expect(galleryRead?.present).toBe(false);
	});

	it('fills two screenshots through DevHunt single shared image-upload input', async () => {
		const container = document.getElementById('tool-screenshots-container');
		const uploaderRoot = document.getElementById('devhunt-images-uploader');
		const uploadLabel = document.getElementById('devhunt-upload-label');
		const sharedInput = document.getElementById('image-upload') as HTMLInputElement;
		expect(container).not.toBeNull();
		expect(uploaderRoot).not.toBeNull();
		expect(sharedInput).not.toBeNull();

		let previewCount = 0;
		sharedInput.addEventListener('change', () => {
			uploadLabel?.classList.add('pointer-events-none');
			previewCount += 1;
			const item = document.createElement('div');
			item.innerHTML = `<img src="https://mars-images.imgix.net/shot-${previewCount}.png" class="object-cover w-full h-full" />`;
			uploaderRoot?.insertBefore(item, uploadLabel);
			uploadLabel?.classList.remove('pointer-events-none');
			sharedInput.value = '';
		});

		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValueOnce({
					ok: true,
					blob: async () => new Blob(['one'], { type: 'image/png' }),
				})
				.mockResolvedValueOnce({
					ok: true,
					blob: async () => new Blob(['two'], { type: 'image/png' }),
				})
		);

		const gallery = DEVHUNT_TOOL_FORM_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'gallery'
		);
		expect(gallery).toBeDefined();
		const snapshot: AutoLaunchProfileSnapshot = {
			name: 'OpenQuok',
			profile_data: {
				gallery_urls: ['org/a.png', 'org/b.png'],
				gallery_labels: ['Screenshot 1', 'install-extension.png'],
			},
		};
		const result = await fillLaunchField(snapshot, gallery!, {
			dashboardOrigin: 'https://app.openquok.com',
		});
		expect(result.status).toBe('found');
		expect(container?.querySelectorAll('img[src]').length).toBe(2);
		vi.unstubAllGlobals();
	});

	it('reads tool_name input for Tool name, not the description textarea', () => {
		const nameField = DEVHUNT_TOOL_FORM_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'name'
		);
		expect(nameField).toBeDefined();
		const result = readFormFieldValue(nameField!);
		expect(result?.kind).toBe('text');
		expect(result?.scalar).toBe('openquok');
		expect(result?.scalar).not.toContain('Content OS');
	});
});