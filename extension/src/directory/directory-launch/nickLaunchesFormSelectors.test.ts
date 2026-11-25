import {
	NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG,
	NICK_LAUNCHES_MAKER_PROFILE_EXTENSION_CONFIG,
} from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveFieldElement } from './fillEngine.js';
import { readFormFieldValue } from './readFormField.js';

/**
 * Minimal DOM shaped like nicklaunches.com/submit/new (OpenAPI `POST /submissions` fields, Nov 2026).
 * Live HTML is behind sign-in; field `name`s match the submission API (`name`, `url`, `twitterUsername`, …).
 */
function mountNickLaunchesListingForm(): void {
	document.body.innerHTML = `
		<section aria-label="AI-Powered Form Prefill">
			<p>Paste your URL and we'll fill the form automatically.</p>
			<input type="url" placeholder="https://example.com" aria-label="Paste your URL" />
		</section>
		<form id="nick-launches-submit">
			<label>Logo</label>
			<input type="file" name="logo" accept="image/*" />
			<label>Screenshots</label>
			<input type="file" name="screenshots" accept="image/*" multiple />
			<label>Name</label>
			<input name="name" placeholder="Product name" />
			<label>Tagline</label>
			<input name="tagline" />
			<label>Description</label>
			<textarea name="description"></textarea>
			<div class="ProseMirror" contenteditable="true"></div>
			<label>Website URL</label>
			<input name="url" type="url" placeholder="https://" />
			<section data-field="categories">
				<label>Categories</label>
				<input role="combobox" placeholder="Add categories" aria-label="Categories" />
			</section>
			<section data-field="useCases">
				<label>How people use your product (max 3)</label>
				<input role="combobox" placeholder="Add use cases" />
			</section>
			<label>Use cases</label>
			<textarea name="useCases" aria-label="Use cases"></textarea>
			<label>Pricing</label>
			<select name="pricing">
				<option value="free">Free</option>
				<option value="freemium">Freemium</option>
				<option value="paid">Paid</option>
				<option value="subscription">Subscription</option>
				<option value="one_time">One-time</option>
				<option value="contact">Contact</option>
			</select>
			<label>Open source</label>
			<input type="checkbox" name="openSource" />
			<label>X username</label>
			<input name="twitterUsername" placeholder="@builder" />
			<label>Demo video URL</label>
			<input name="demoVideoUrl" type="url" />
		</form>
	`;
}

/** Minimal DOM shaped like nicklaunches.com/profile (`POST /me/profile`, Nov 2026). */
function mountNickLaunchesProfileForm(): void {
	document.body.innerHTML = `
		<form id="nick-launches-profile">
			<input name="firstName" />
			<input name="lastName" />
			<label>Headline</label>
			<input name="headline" />
			<label>Bio</label>
			<textarea name="bio"></textarea>
			<label>Website</label>
			<input name="website" type="url" />
			<label>Avatar</label>
			<input type="file" name="avatarUrl" accept="image/*" />
			<label>X</label>
			<input name="socials.x" placeholder="https://x.com/builder" />
			<label>GitHub</label>
			<input name="socials.github" />
			<label>LinkedIn</label>
			<input name="socials.linkedin" />
			<label>YouTube</label>
			<input name="socials.youtube" />
		</form>
	`;
}

describe('Nick Launches submit listing selector smoke', () => {
	beforeEach(() => {
		mountNickLaunchesListingForm();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('resolves every configured listing field against the OpenAPI-shaped DOM', () => {
		const fields = NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const missing: string[] = [];
		for (const field of fields) {
			const el = resolveFieldElement(field);
			if (!el) missing.push(field.key);
		}
		expect(missing, `unresolved fields: ${missing.join(', ')}`).toEqual([]);
	});

	it('reads name from the name input, not the description textarea', () => {
		const nameInput = document.querySelector<HTMLInputElement>("input[name='name']");
		const description = document.querySelector<HTMLTextAreaElement>("textarea[name='description']");
		expect(nameInput).not.toBeNull();
		expect(description).not.toBeNull();
		nameInput!.value = 'OpenQuok';
		description!.value = 'Long product description';

		const nameField = NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'name'
		);
		expect(nameField).toBeDefined();
		const read = readFormFieldValue(nameField!);
		expect(read?.kind).toBe('text');
		expect(read?.scalar).toBe('OpenQuok');
	});

	it('resolves website on the listing url field, not the host AI prefill box', () => {
		const websiteField = NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'website'
		);
		expect(websiteField).toBeDefined();
		const el = resolveFieldElement(websiteField!);
		expect(el).not.toBeNull();
		expect((el as HTMLInputElement).getAttribute('name')).toBe('url');
	});

	it('resolves logo and screenshot file inputs', () => {
		const fields = NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const logo = fields.find((f) => f.key === 'logo');
		const gallery = fields.find((f) => f.key === 'gallery');
		expect(logo).toBeDefined();
		expect(gallery).toBeDefined();
		expect(resolveFieldElement(logo!)).not.toBeNull();
		expect(resolveFieldElement(gallery!)).not.toBeNull();
		expect(readFormFieldValue(logo!)?.kind).toBe('file');
		expect(readFormFieldValue(gallery!)?.kind).toBe('files');
	});
});

describe('Nick Launches maker profile selector smoke', () => {
	beforeEach(() => {
		mountNickLaunchesProfileForm();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('resolves autofilled profile fields (first name / last name stay manual)', () => {
		const fields = NICK_LAUNCHES_MAKER_PROFILE_EXTENSION_CONFIG.steps[0]?.fields ?? [];
		const missing: string[] = [];
		for (const field of fields) {
			if (field.key === 'name') continue;
			const el = resolveFieldElement(field);
			if (!el) missing.push(field.key);
		}
		expect(missing, `unresolved fields: ${missing.join(', ')}`).toEqual([]);
	});
});