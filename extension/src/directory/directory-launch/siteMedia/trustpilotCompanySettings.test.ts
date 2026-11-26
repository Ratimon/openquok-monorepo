import { TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG } from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveFieldElement } from '../fillEngine.js';
import {
	isTrustpilotAccordionExpanded,
	trustpilotFillAllBlocker,
	trustpilotStepFillBlocker,
	TRUSTPILOT_ABOUT_SECTION_HEADING,
	TRUSTPILOT_DESCRIPTION_SECTION_HEADING,
} from './trustpilotCompanySettings.js';

function withCompanySettingsPath(): void {
	Object.defineProperty(document, 'defaultView', {
		value: { location: { pathname: '/company-settings/' } },
		configurable: true,
	});
}

describe('Trustpilot company settings accordions', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		withCompanySettingsPath();
	});

	afterEach(() => {
		document.body.innerHTML = '';
		Object.defineProperty(document, 'defaultView', {
			value: window,
			configurable: true,
		});
	});

	it('blocks fill when About your business is collapsed', () => {
		document.body.innerHTML = `
			<button type="button" aria-expanded="false" aria-controls="about-panel">About your business</button>
			<div id="about-panel" hidden></div>
			<button type="button" aria-expanded="true" aria-controls="desc-panel">Company description</button>
			<div id="desc-panel">
				<label>Describe your company</label>
				<textarea aria-label="Describe your company"></textarea>
			</div>
		`;
		expect(isTrustpilotAccordionExpanded(TRUSTPILOT_ABOUT_SECTION_HEADING)).toBe(false);
		expect(trustpilotStepFillBlocker('company_settings')).toMatch(/About your business/);
	});

	it('allows fill when the matching section is expanded', () => {
		document.body.innerHTML = `
			<button type="button" aria-expanded="true" aria-controls="about-panel">About your business</button>
			<div id="about-panel">
				<label>Company name</label>
				<input aria-label="Company name" name="company_name" />
				<label>Company domain</label>
				<input aria-label="Company domain" type="url" name="domain" />
			</div>
		`;
		expect(trustpilotStepFillBlocker('company_settings')).toBeNull();
	});

	it('lists collapsed sections for fill-all', () => {
		document.body.innerHTML = `
			<button aria-expanded="true">About your business</button>
			<button aria-expanded="false">Company description</button>
		`;
		expect(
			trustpilotFillAllBlocker(['company_settings', 'company_description'])
		).toMatch(/Company description/);
	});

	it('resolves company name only inside the expanded About panel', () => {
		document.body.innerHTML = `
			<div class="preview">
				<p>OpenQuok is an open-source Content OS for social scheduling…</p>
				<textarea>OpenQuok is an open-source Content OS for social scheduling…</textarea>
			</div>
			<button aria-expanded="true" aria-controls="about-panel">About your business</button>
			<div id="about-panel">
				<label>Company name</label>
				<input aria-label="Company name" name="company_name" value="OpenQuok" />
			</div>
			<button aria-expanded="false" aria-controls="desc-panel">Company description</button>
			<div id="desc-panel" hidden>
				<textarea aria-label="Describe your company"></textarea>
			</div>
		`;
		const nameField = TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG.steps[0]?.fields.find(
			(f) => f.key === 'name'
		);
		expect(nameField).toBeDefined();
		const el = resolveFieldElement(nameField!);
		expect(el).toBeInstanceOf(HTMLInputElement);
		expect((el as HTMLInputElement).name).toBe('company_name');
		expect(trustpilotStepFillBlocker('company_description')).toMatch(
			TRUSTPILOT_DESCRIPTION_SECTION_HEADING
		);
	});
});