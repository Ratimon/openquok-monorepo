import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	activateStartupinspireWizardStepSync,
	fillStartupinspireTechnologyStack,
	readStartupinspireMultiselectChipLabels,
	resolveStartupinspireFieldElement,
	resolveStartupinspireLogoFileInput,
	resolveStartupinspireScreenshotFileInput,
	resolveStartupinspireTechnologyControl,
} from './startupinspireStartupForm.js';

describe('startupinspireStartupForm', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		Object.defineProperty(window, 'location', {
			value: { pathname: '/dashboard/startup/edit/24269' },
			configurable: true,
		});
	});

	afterEach(() => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	});

	it('activates wizard steps by label', () => {
		document.body.innerHTML = `
			<p-step><button type="button">Logo</button></p-step>
			<p-step><button type="button">Screenshots</button></p-step>
		`;
		const logo = document.querySelector('p-step button');
		const clickSpy = vi.spyOn(logo as HTMLButtonElement, 'click');
		expect(activateStartupinspireWizardStepSync('Logo')).toBe(true);
		expect(clickSpy).toHaveBeenCalled();
	});

	it('resolves the technology multiselect near the label', () => {
		document.body.innerHTML = `
			<div>
				<label>Technology Stack <span>*</span></label>
				<p-multiselect formcontrolname="startup_technology" class="p-multiselect">
					<div class="p-multiselect-label-container"></div>
					<div class="p-multiselect-dropdown"></div>
				</p-multiselect>
			</div>
		`;
		expect(resolveStartupinspireTechnologyControl()).not.toBeNull();
	});

	it('reads selected chip labels from a PrimeNG multiselect', () => {
		document.body.innerHTML = `
			<p-multiselect class="p-multiselect">
				<div class="p-multiselect-label-container">
					<div class="p-multiselect-chip-item">
						<span class="p-chip-label">ClickUp</span>
					</div>
				</div>
			</p-multiselect>
		`;
		expect(readStartupinspireMultiselectChipLabels(document.body)).toEqual(['ClickUp']);
	});

	it('fills options in the multiselect overlay', async () => {
		document.body.innerHTML = `
			<p-multiselect formcontrolname="startup_technology" class="p-multiselect">
				<div class="p-multiselect-dropdown"></div>
			</p-multiselect>
		`;
		const ms = document.querySelector('p-multiselect') as HTMLElement;
		const overlay = document.createElement('div');
		overlay.className = 'p-multiselect-overlay';
		overlay.innerHTML = `
			<input type="text" />
			<ul>
				<li role="option" class="p-multiselect-option">Notion</li>
				<li role="option" class="p-multiselect-option">ClickUp</li>
			</ul>
		`;
		Object.defineProperty(ms, 'offsetParent', { value: document.body, configurable: true });
		Object.defineProperty(overlay, 'offsetParent', { value: document.body, configurable: true });
		Object.defineProperty(overlay, 'getClientRects', {
			value: () => [{ width: 100, height: 24 }],
			configurable: true,
		});
		document.body.appendChild(overlay);

		const ok = await fillStartupinspireTechnologyStack(['Notion']);
		expect(ok).toBe(true);
	});

	it('clears existing chips before filling new tags', async () => {
		document.body.innerHTML = `
			<p-step><button type="button">Informations</button></p-step>
			<label>Technology Stack</label>
			<p-multiselect formcontrolname="startup_technology" class="p-multiselect">
				<div class="p-multiselect-label-container">
					<div class="p-multiselect-chip-item">
						<span class="p-chip-label">ClickUp</span>
						<span class="p-multiselect-chip-icon"></span>
					</div>
				</div>
				<div class="p-multiselect-dropdown"></div>
			</p-multiselect>
		`;
		const ms = document.querySelector('p-multiselect') as HTMLElement;
		const chipIcon = ms.querySelector('.p-multiselect-chip-icon') as HTMLElement;
		const clickSpy = vi.spyOn(chipIcon, 'click');
		const overlay = document.createElement('div');
		overlay.className = 'p-multiselect-overlay';
		overlay.innerHTML = `
			<input class="p-multiselect-filter" type="text" />
			<ul>
				<li role="option" class="p-multiselect-option" aria-selected="false">
					<span class="p-multiselect-option-label">TypeScript</span>
				</li>
			</ul>
		`;
		Object.defineProperty(ms, 'offsetParent', { value: document.body, configurable: true });
		Object.defineProperty(overlay, 'offsetParent', { value: document.body, configurable: true });
		Object.defineProperty(overlay, 'getClientRects', {
			value: () => [{ width: 200, height: 120 }],
			configurable: true,
		});
		document.body.appendChild(overlay);

		const ok = await fillStartupinspireTechnologyStack(['TypeScript']);
		expect(clickSpy).toHaveBeenCalled();
		expect(ok).toBe(true);
	});

	it('can pick options using collapsed technology names', async () => {
		document.body.innerHTML = `
			<p-step><button type="button">Informations</button></p-step>
			<p-multiselect formcontrolname="startup_technology" class="p-multiselect">
				<div class="p-multiselect-dropdown"></div>
			</p-multiselect>
		`;
		const ms = document.querySelector('p-multiselect') as HTMLElement;
		const overlay = document.createElement('div');
		overlay.className = 'p-multiselect-overlay';
		overlay.innerHTML = `
			<input class="p-multiselect-filter" type="text" />
			<ul>
				<li role="option" class="p-multiselect-option" aria-selected="false">
					<span class="p-multiselect-option-label">SvelteKit</span>
				</li>
			</ul>
		`;
		Object.defineProperty(ms, 'offsetParent', { value: document.body, configurable: true });
		Object.defineProperty(overlay, 'offsetParent', { value: document.body, configurable: true });
		Object.defineProperty(overlay, 'getClientRects', {
			value: () => [{ width: 200, height: 120 }],
			configurable: true,
		});
		document.body.appendChild(overlay);

		const ok = await fillStartupinspireTechnologyStack(['svelte kit']);
		expect(ok).toBe(true);
	});

	it('fills several catalog options while the overlay stays open', async () => {
		document.body.innerHTML = `
			<p-step><button type="button">Informations</button></p-step>
			<p-multiselect formcontrolname="startup_technology" class="p-multiselect">
				<div class="p-multiselect-dropdown"></div>
			</p-multiselect>
		`;
		const ms = document.querySelector('p-multiselect') as HTMLElement;
		const overlay = document.createElement('div');
		overlay.className = 'p-multiselect-overlay';
		overlay.innerHTML = `
			<input class="p-multiselect-filter" type="text" />
			<ul>
				<li role="option" class="p-multiselect-option" aria-selected="false">
					<span class="p-multiselect-option-label">TypeScript</span>
				</li>
				<li role="option" class="p-multiselect-option" aria-selected="false">
					<span class="p-multiselect-option-label">PostgreSQL</span>
				</li>
				<li role="option" class="p-multiselect-option" aria-selected="false">
					<span class="p-multiselect-option-label">SvelteKit</span>
				</li>
			</ul>
		`;
		Object.defineProperty(ms, 'offsetParent', { value: document.body, configurable: true });
		Object.defineProperty(overlay, 'offsetParent', { value: document.body, configurable: true });
		Object.defineProperty(overlay, 'getClientRects', {
			value: () => [{ width: 200, height: 180 }],
			configurable: true,
		});
		document.body.appendChild(overlay);

		const clickSpy = vi.spyOn(HTMLElement.prototype, 'click');
		const ok = await fillStartupinspireTechnologyStack([
			'TypeScript',
			'PostgreSQL',
			'SvelteKit',
		]);
		expect(ok).toBe(true);
		expect(clickSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
		clickSpy.mockRestore();
	});

	it('resolves Informations text controls inside the visible wizard panel', () => {
		document.body.innerHTML = `
			<p-step-panel>
				<input formcontrolname="startup_name" value="OpenQuok" />
				<input formcontrolname="startup_headline" value="Tagline" />
				<input formcontrolname="startup_url" value="https://openquok.com" />
				<textarea formcontrolname="startup_description">Hello</textarea>
			</p-step-panel>
		`;
		expect(
			resolveStartupinspireFieldElement({
				key: 'name',
				label: 'Startup name',
				profilePath: 'name',
			})
		).not.toBeNull();
		expect(
			resolveStartupinspireFieldElement({
				key: 'tagline',
				label: 'Headline',
				profilePath: 'tagline',
			})
		).not.toBeNull();
	});

	it('finds logo and screenshot file inputs on wizard panels', () => {
		document.body.innerHTML = `
			<p-step>Logo</p-step>
			<p-step>Screenshots</p-step>
			<p-step-panel>
				<app-upload-single>
					<input id="logo-file" type="file" accept="image/*" />
				</app-upload-single>
				<img src="https://cdn.example/favicon-512.png" alt="logo" />
			</p-step-panel>
			<p-step-panel>
				<h3>Add Screenshots</h3>
				<app-upload>
					<div class="upload-trigger">
						<label>
							<span>Upload Screenshots</span>
							<input id="shot-file" type="file" accept="image/*" multiple />
						</label>
					</div>
				</app-upload>
			</p-step-panel>
		`;
		expect(resolveStartupinspireLogoFileInput()?.id).toBe('logo-file');
		expect(resolveStartupinspireScreenshotFileInput()?.id).toBe('shot-file');
	});
});