import { TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG } from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveFieldElement } from './fillEngine.js';
import { readFormFieldValue } from './readFormField.js';

/**
 * Minimal DOM shaped like Trustpilot Business company settings after sign-in.
 * Refine selectors after a live DOM pass on businessapp.b2b.trustpilot.com (manual smoke).
 */
function mountTrustpilotCompanySettingsForm(): void {
	Object.defineProperty(document, 'defaultView', {
		value: { location: { pathname: '/company-settings/' } },
		configurable: true,
	});
	document.body.innerHTML = `
		<main aria-label="Company settings">
			<h1>Company settings</h1>
			<button type="button" aria-expanded="true" aria-controls="about-panel">About your business</button>
			<div id="about-panel" data-step="company_settings">
				<div class="space-y-2">
					<label for="company-name">Company name</label>
					<input id="company-name" name="company_name" type="text" placeholder="Company name" />
				</div>
				<div class="space-y-2">
					<label for="company-domain">Company domain</label>
					<input id="company-domain" name="companyDomain" type="url" placeholder="https://example.com" />
				</div>
				<div class="space-y-2">
					<label for="company-logo">Upload logo</label>
					<input id="company-logo" type="file" name="logo" accept="image/jpeg,image/png" />
				</div>
			</div>
			<button type="button" aria-expanded="true" aria-controls="desc-panel">Company description</button>
			<div id="desc-panel" data-step="company_description">
				<label for="company-description">Describe your company</label>
				<textarea id="company-description" name="companyDescription" placeholder="Describe your company"></textarea>
			</div>
			<section data-step="contact_info" aria-label="Contact info">
				<p>Email, phone, and address — complete on Trustpilot</p>
			</section>
		</main>
	`;
}

describe('Trustpilot company settings selector smoke', () => {
	beforeEach(() => {
		mountTrustpilotCompanySettingsForm();
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('exposes three autofill steps and an empty contact info step', () => {
		const steps = TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.steps;
		expect(steps).toHaveLength(3);
		expect(steps.map((s) => s.id)).toEqual([
			'company_settings',
			'company_description',
			'contact_info',
		]);
		expect(steps[2]?.fields).toHaveLength(0);
	});

	it('resolves every configured field against the company-settings-shaped DOM', () => {
		const fields = [
			...(TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.steps[0]?.fields ?? []),
			...(TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.steps[1]?.fields ?? []),
		];
		const missing: string[] = [];
		for (const field of fields) {
			const el = resolveFieldElement(field);
			if (!el) missing.push(field.key);
		}
		expect(missing, `unresolved fields: ${missing.join(', ')}`).toEqual([]);
	});

	it('reads company name, domain, description, and logo from distinct controls', () => {
		const nameInput = document.querySelector<HTMLInputElement>('input[name="company_name"]');
		const domainInput = document.querySelector<HTMLInputElement>('input[name="companyDomain"]');
		const description = document.querySelector<HTMLTextAreaElement>('textarea[name="companyDescription"]');
		expect(nameInput).not.toBeNull();
		expect(domainInput).not.toBeNull();
		expect(description).not.toBeNull();

		nameInput!.value = 'Acme Corp';
		domainInput!.value = 'https://acme.example';
		description!.value = 'We build tools for makers.';

		const nameField = TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'name'
		);
		const domainField = TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'website'
		);
		const descriptionField = TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.steps[1]?.fields.find(
			(f) => f.key === 'description'
		);
		const logoField = TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'logo'
		);

		expect(readFormFieldValue(nameField!)?.kind).toBe('text');
		expect(readFormFieldValue(nameField!)?.scalar).toBe('Acme Corp');
		expect(readFormFieldValue(domainField!)?.scalar).toBe('https://acme.example');
		expect(readFormFieldValue(descriptionField!)?.scalar).toBe('We build tools for makers.');
		expect(readFormFieldValue(logoField!)?.kind).toBe('file');
	});

	it('documents manual verification and nofollow in readyStatusHint', () => {
		const hint = TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.readyStatusHint ?? '';
		expect(hint).toMatch(/business-email/i);
		expect(hint).toMatch(/Contact info/i);
		expect(hint).toMatch(/nofollow/i);
		expect(TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.readyUrlHint).toBe('company-settings');
		const proofPattern = TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.proof?.successPathRegex;
		expect(proofPattern).toBeTruthy();
		expect(new RegExp(proofPattern!).test('https://www.trustpilot.com/review/acme')).toBe(true);
	});
});