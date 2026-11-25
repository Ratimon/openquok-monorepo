import {
	DIRECTORY_EXTENSION_CONFIG_FIXTURES,
	INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG,
} from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveFieldElement } from './fillEngine.js';
import { readFormFieldValue } from './readFormField.js';

/**
 * Minimal DOM shaped like indiehub.best/submit step 1 (Details) after sign-in.
 * Logged-out `/submit` redirects to `/auth/login?callbackUrl=%2Fsubmit` (manual smoke Nov 2026).
 * Label/combobox markup follows shadcn patterns seen on the live auth shell.
 */
function mountIndiehubSubmitDetailsForm(): void {
	document.body.innerHTML = `
		<nav aria-label="Submit steps">
			<ol>
				<li>Details</li>
				<li>Payment</li>
				<li>Publish</li>
			</ol>
		</nav>
		<section aria-label="AI AutoFill">
			<p>Paste your link to auto-fill the form</p>
			<input type="url" placeholder="https://example.com" aria-label="Website for autofill" />
		</section>
		<form id="indiehub-submit-details" class="space-y-8">
			<div class="space-y-2">
				<label class="text-sm font-medium leading-none">Link</label>
				<input type="url" name="link" placeholder="https://" class="flex h-10 w-full rounded-md border" />
			</div>
			<div class="space-y-2">
				<label class="text-sm font-medium leading-none">Name</label>
				<input name="name" placeholder="Product name" class="flex h-10 w-full rounded-md border" />
			</div>
			<section data-field="categories" class="space-y-2">
				<label class="text-sm font-medium leading-none">Categories</label>
				<input role="combobox" placeholder="Select categories" aria-label="Categories" aria-expanded="false" />
			</section>
			<section data-field="tags" class="space-y-2">
				<label class="text-sm font-medium leading-none">Tags</label>
				<input role="combobox" placeholder="Add tags" aria-label="Tags" aria-expanded="false" />
			</section>
			<div class="space-y-2">
				<label class="text-sm font-medium leading-none">Description</label>
				<textarea name="shortDescription" placeholder="Short description" class="min-h-[80px] w-full rounded-md border"></textarea>
			</div>
			<div class="space-y-2">
				<label class="text-sm font-medium leading-none">Introduction (Markdown supported)</label>
				<div class="ProseMirror tiptap" contenteditable="true"></div>
			</div>
			<div class="space-y-2">
				<label class="text-sm font-medium leading-none">Icon</label>
				<input type="file" name="icon" accept="image/*" />
			</div>
			<div class="space-y-2">
				<label class="text-sm font-medium leading-none">Image</label>
				<input type="file" name="banner" accept="image/*" />
			</div>
		</form>
	`;
}

describe('IndieHub submit details selector smoke', () => {
	beforeEach(() => {
		mountIndiehubSubmitDetailsForm();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('resolves every configured field against the Details-shaped DOM', () => {
		const fields = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const missing: string[] = [];
		for (const field of fields) {
			const el = resolveFieldElement(field);
			if (!el) missing.push(field.key);
		}
		expect(missing, `unresolved fields: ${missing.join(', ')}`).toEqual([]);
	});

	it('resolves website on the form link field, not the AI autofill box', () => {
		const websiteField = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'website'
		);
		expect(websiteField).toBeDefined();
		const el = resolveFieldElement(websiteField!);
		const formLink = document.querySelector<HTMLInputElement>(
			'#indiehub-submit-details input[name="link"]'
		);
		expect(formLink).not.toBeNull();
		expect(el).toBe(formLink);
	});

	it('binds Icon vs Image when both file inputs share one flex row', () => {
		document.body.innerHTML = `
			<form>
				<div class="flex gap-4">
					<label class="text-sm font-medium leading-none">Icon</label>
					<input type="file" accept="image/*" data-testid="icon-file" />
					<label class="text-sm font-medium leading-none">Image</label>
					<input type="file" accept="image/*" data-testid="image-file" />
				</div>
			</form>
		`;
		const fields = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const logo = fields.find((f) => f.key === 'logo');
		const cover = fields.find((f) => f.key === 'cover');
		expect(logo).toBeDefined();
		expect(cover).toBeDefined();
		const iconInput = document.querySelector<HTMLInputElement>('input[data-testid="icon-file"]');
		const imageInput = document.querySelector<HTMLInputElement>('input[data-testid="image-file"]');
		expect(resolveFieldElement(logo!)).toBe(iconInput);
		expect(resolveFieldElement(cover!)).toBe(imageInput);
	});

	it('binds Icon vs Image with shadcn form-item columns and leading label tokens', () => {
		document.body.innerHTML = `
			<form>
				<div class="grid grid-cols-2 gap-4">
					<div data-slot="form-item" class="space-y-2">
						<input type="file" class="hidden" name="icon" />
						<div class="flex gap-2">
							<label data-slot="form-label" class="text-sm font-medium">Icon</label>
							<span class="text-muted-foreground">(1:1, PNG or JPEG, max 1MB)</span>
						</div>
						<div class="rounded-lg border border-dashed p-4">Drag & drop</div>
					</div>
					<div data-slot="form-item" class="space-y-2">
						<input type="file" class="hidden" name="banner" />
						<div class="flex gap-2">
							<span data-slot="form-label" class="text-sm font-medium">Image</span>
							<span class="text-muted-foreground">(16:9, PNG or JPEG, max 1MB)</span>
						</div>
						<div class="rounded-lg border border-dashed p-4">Drag & drop or select image to upload</div>
					</div>
				</div>
			</form>
		`;
		const fields = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const logo = fields.find((f) => f.key === 'logo');
		const cover = fields.find((f) => f.key === 'cover');
		expect(resolveFieldElement(logo!)).toBe(document.querySelector('input[name="icon"]'));
		expect(resolveFieldElement(cover!)).toBe(document.querySelector('input[name="banner"]'));
	});

	it('binds Icon vs Image when the file input appears before the label (dropzone)', () => {
		document.body.innerHTML = `
			<form>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-2">
						<input type="file" name="icon" accept="image/*" />
						<label class="text-sm font-medium">Icon (1:1, PNG or JPEG, max 1MB)</label>
					</div>
					<div class="space-y-2">
						<input type="file" name="banner" accept="image/*" />
						<label class="text-sm font-medium">Image</label>
					</div>
				</div>
			</form>
		`;
		const fields = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const logo = fields.find((f) => f.key === 'logo');
		const cover = fields.find((f) => f.key === 'cover');
		const iconInput = document.querySelector<HTMLInputElement>('input[name="icon"]');
		const bannerInput = document.querySelector<HTMLInputElement>('input[name="banner"]');
		expect(resolveFieldElement(logo!)).toBe(iconInput);
		expect(resolveFieldElement(cover!)).toBe(bannerInput);
	});

	it('binds file inputs by Icon vs Image labels when both accept image/*', () => {
		document.body.innerHTML = `
			<form>
				<div class="space-y-2">
					<label>Icon</label>
					<input type="file" accept="image/*" />
				</div>
				<div class="space-y-2">
					<label>Image</label>
					<input type="file" accept="image/*" />
				</div>
			</form>
		`;
		const fields = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const logo = fields.find((f) => f.key === 'logo');
		const cover = fields.find((f) => f.key === 'cover');
		expect(logo).toBeDefined();
		expect(cover).toBeDefined();
		const logoEl = resolveFieldElement(logo!);
		const coverEl = resolveFieldElement(cover!);
		expect(logoEl).not.toBeNull();
		expect(coverEl).not.toBeNull();
		expect(logoEl).not.toBe(coverEl);
		const labels = [...document.querySelectorAll('label')].map((l) => l.textContent?.trim());
		const iconIdx = labels.indexOf('Icon');
		const imageIdx = labels.indexOf('Image');
		expect(iconIdx).toBeGreaterThanOrEqual(0);
		expect(imageIdx).toBeGreaterThanOrEqual(0);
		const fileInputs = document.querySelectorAll('input[type="file"]');
		expect(logoEl).toBe(fileInputs[iconIdx]);
		expect(coverEl).toBe(fileInputs[imageIdx]);
	});

	it('resolves distinct icon and cover file inputs', () => {
		const fields = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const logo = fields.find((f) => f.key === 'logo');
		const cover = fields.find((f) => f.key === 'cover');
		expect(logo).toBeDefined();
		expect(cover).toBeDefined();
		const logoEl = resolveFieldElement(logo!);
		const coverEl = resolveFieldElement(cover!);
		expect(logoEl).not.toBeNull();
		expect(coverEl).not.toBeNull();
		expect(logoEl).not.toBe(coverEl);
		expect(readFormFieldValue(logo!)?.kind).toBe('file');
		expect(readFormFieldValue(cover!)?.kind).toBe('files');
	});

	it('reads tagline from Description, not the Introduction editor', () => {
		const taglineField = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'tagline'
		);
		const introField = INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'description'
		);
		expect(taglineField).toBeDefined();
		expect(introField).toBeDefined();

		const short = document.querySelector<HTMLTextAreaElement>('textarea[name="shortDescription"]');
		const editor = document.querySelector<HTMLElement>('.ProseMirror');
		expect(short).not.toBeNull();
		expect(editor).not.toBeNull();
		short!.value = 'Ship faster';
		editor!.textContent = 'Long markdown body';

		const taglineRead = readFormFieldValue(taglineField!);
		const introRead = readFormFieldValue(introField!);
		expect(taglineRead?.kind).toBe('text');
		expect(taglineRead?.scalar).toBe('Ship faster');
		expect(introRead?.kind).toBe('rich_html');
	});

	it('keeps Basic and Pro fixtures on one Details step (no Payment fields)', () => {
		for (const config of [
			DIRECTORY_EXTENSION_CONFIG_FIXTURES['indiehub-basic-launch'],
			DIRECTORY_EXTENSION_CONFIG_FIXTURES['indiehub-pro-launch'],
		]) {
			expect(config).toBeDefined();
			const steps = config!.steps;
			expect(steps).toBeDefined();
			expect(steps).toHaveLength(1);
			expect(steps![0]?.id).toBe('submit_details');
			expect(config!.readyUrlHint).toBe('submit');
			expect(config!.readyStatusHint).toMatch(/payment/i);
			expect(config!.readyStatusHint).toMatch(/publish/i);
		}
		expect(DIRECTORY_EXTENSION_CONFIG_FIXTURES['indiehub-basic-launch']?.readyStatusHint).toMatch(
			/basic/i
		);
		expect(DIRECTORY_EXTENSION_CONFIG_FIXTURES['indiehub-pro-launch']?.readyStatusHint).toMatch(
			/pro/i
		);
	});
});