import type { AutoLaunchProfileSnapshot, LaunchStepField } from 'openquok-common';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { countFilled, fillLaunchField, fillLaunchStep } from './fillEngine.js';

function snapshot(
	overrides: Partial<AutoLaunchProfileSnapshot> = {}
): AutoLaunchProfileSnapshot {
	return {
		name: 'Acme',
		tagline: null,
		description: null,
		website_url: null,
		logo_url: null,
		profile_data: {},
		integration_customer_id: null,
		...overrides
	};
}

function field(overrides: Partial<LaunchStepField> & Pick<LaunchStepField, 'key' | 'label'>): LaunchStepField {
	return {
		profilePath: 'name',
		...overrides
	};
}

describe('fillLaunchField', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('returns not_in_profile when the profile path is empty', () => {
		const result = fillLaunchField(
			snapshot({ name: '   ' }),
			field({ key: 'name', label: 'Name', profilePath: 'name' })
		);
		expect(result.status).toBe('not_in_profile');
	});

	it('returns not_found when selectorHint does not match', () => {
		const result = fillLaunchField(
			snapshot(),
			field({
				key: 'name',
				label: 'Name',
				profilePath: 'name',
				selectorHint: '#missing-field'
			})
		);
		expect(result.status).toBe('not_found');
	});

	it('fills text inputs by default', () => {
		const input = document.createElement('input');
		input.id = 'product-name';
		document.body.appendChild(input);

		const result = fillLaunchField(
			snapshot(),
			field({
				key: 'name',
				label: 'Name',
				profilePath: 'name',
				selectorHint: '#product-name'
			})
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('Acme');
	});

	it('fills native select controls when fillMode is select', () => {
		const select = document.createElement('select');
		select.id = 'pricing';
		const free = document.createElement('option');
		free.value = 'free';
		free.textContent = 'Free';
		const paid = document.createElement('option');
		paid.value = 'paid';
		paid.textContent = 'Paid';
		select.append(free, paid);
		document.body.appendChild(select);

		const result = fillLaunchField(
			snapshot({ profile_data: { pricing_type: 'paid' } }),
			field({
				key: 'pricing',
				label: 'Pricing',
				profilePath: 'profile_data.pricing_type',
				selectorHint: '#pricing',
				fillMode: 'select'
			})
		);

		expect(result.status).toBe('found');
		expect(select.value).toBe('paid');
	});

	it('toggles checkbox inputs when fillMode is boolean', () => {
		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = 'open-source';
		document.body.appendChild(checkbox);

		const result = fillLaunchField(
			snapshot({ profile_data: { is_open_source: true } }),
			field({
				key: 'open_source',
				label: 'Open source',
				profilePath: 'profile_data.is_open_source',
				selectorHint: '#open-source',
				fillMode: 'boolean'
			})
		);

		expect(result.status).toBe('found');
		expect(checkbox.checked).toBe(true);
	});

	it('sets rich HTML on contenteditable targets when fillMode is rich_html', () => {
		const editor = document.createElement('div');
		editor.className = 'ProseMirror';
		editor.id = 'description';
		document.body.appendChild(editor);

		const html = '<p>Ship <strong>faster</strong></p>';
		const result = fillLaunchField(
			snapshot({ description: html }),
			field({
				key: 'description',
				label: 'Description',
				profilePath: 'description',
				selectorHint: '#description',
				fillMode: 'rich_html'
			})
		);

		expect(result.status).toBe('found');
		expect(editor.innerHTML).toBe(html);
	});

	it('enters tag chips when fillMode is tags', () => {
		const input = document.createElement('input');
		input.id = 'tags';
		document.body.appendChild(input);

		const result = fillLaunchField(
			snapshot({ profile_data: { tags: ['devtools', 'saas'] } }),
			field({
				key: 'tags',
				label: 'Tags',
				profilePath: 'profile_data.tags',
				selectorHint: '#tags',
				fillMode: 'tags'
			})
		);

		expect(result.status).toBe('found');
		expect(input.value).toBe('saas');
	});

	it('skips file inputs', () => {
		const file = document.createElement('input');
		file.type = 'file';
		file.id = 'logo';
		document.body.appendChild(file);

		const result = fillLaunchField(
			snapshot({ logo_url: 'org/profile/logo.png' }),
			field({
				key: 'logo',
				label: 'Logo',
				profilePath: 'logo_url',
				selectorHint: '#logo'
			})
		);

		expect(result.status).toBe('skipped');
	});
});

describe('fillLaunchStep', () => {
	it('aggregates per-field results and counts filled rows', () => {
		const input = document.createElement('input');
		input.id = 'name';
		document.body.appendChild(input);

		const results = fillLaunchStep(snapshot(), {
			id: 'general',
			label: 'General',
			fields: [
				{
					key: 'name',
					label: 'Name',
					profilePath: 'name',
					selectorHint: '#name'
				},
				{
					key: 'tagline',
					label: 'Tagline',
					profilePath: 'tagline',
					selectorHint: '#tagline'
				}
			]
		});

		expect(results).toHaveLength(2);
		expect(countFilled(results)).toEqual({ filled: 1, total: 2 });
	});
});
