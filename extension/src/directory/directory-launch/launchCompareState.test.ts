import { describe, expect, it } from 'vitest';

import type { AutoLaunchProfileSnapshot, LaunchStepField } from 'openquok-common';

import {
	buildCompareRowsForSteps,
	compareRowsVisibleOnPage,
	collectItemsFromProfilePaths,
	defaultTagProfilePathsForField,
	formatNormalizedDisplay,
	isFieldTouched,
	normalizedFromTagItems,
	refreshCompareRowFromDom,
} from './launchCompareState.js';

const snapshot: AutoLaunchProfileSnapshot = {
	name: 'Acme',
	tagline: null,
	description: null,
	website_url: null,
	logo_url: null,
	profile_data: {
		use_cases: ['Automation', 'AI'],
		platforms: ['Web'],
	},
	integration_customer_id: null,
};

describe('launchCompareState', () => {
	it('collectRawItemsFromProfilePaths merges every Discovery path', () => {
		expect(
			collectItemsFromProfilePaths(snapshot, [
				'profile_data.use_cases',
				'profile_data.platforms',
			])
		).toEqual(['Automation', 'AI', 'Web']);
		expect(
			collectItemsFromProfilePaths(
				snapshot,
				['profile_data.use_cases', 'profile_data.platforms'],
				2
			)
		).toEqual(['Automation', 'AI']);
	});

	it('collectItemsFromProfilePaths maps Uneed catalog after merging sources', () => {
		const discoverySnap: AutoLaunchProfileSnapshot = {
			...snapshot,
			profile_data: {
				use_cases: ['AI Agents', 'Social Media Automation'],
				platforms: ['Web'],
				categories: ['SaaS', 'Marketing', 'Developer Tools'],
				tags: ['Stale tag'],
			},
		};
		const tagsField: LaunchStepField = {
			key: 'tags',
			label: 'Tags',
			profilePath: 'profile_data.tags',
			fillMode: 'tags',
			tagsCatalog: 'uneed',
			maxItems: 3,
			profileSourcePaths: [
				'profile_data.use_cases',
				'profile_data.platforms',
				'profile_data.tech_stack',
				'profile_data.categories',
			],
		};
		const fillable = collectItemsFromProfilePaths(
			discoverySnap,
			defaultTagProfilePathsForField(tagsField),
			undefined,
			tagsField
		);
		expect(fillable.length).toBeGreaterThan(1);
		expect(fillable).toContain('AI Agents');
		expect(fillable.length).toBeLessThanOrEqual(3);
	});

	it('formatNormalizedDisplay renders tags', () => {
		expect(formatNormalizedDisplay(normalizedFromTagItems(['a', 'b']))).toBe('a, b');
	});

	it('formatNormalizedDisplay renders checkbox_group like tags', () => {
		expect(
			formatNormalizedDisplay({
				kind: 'checkbox_group',
				items: ['SaaS', 'Marketing'],
				present: true,
			})
		).toBe('SaaS, Marketing');
	});

	it('buildCompareRowsForSteps shows Discovery categories on the profile column', () => {
		const discoverySnap: AutoLaunchProfileSnapshot = {
			...snapshot,
			profile_data: {
				...snapshot.profile_data,
				categories: ['SaaS', 'Marketing', 'Developer Tools'],
				platforms: ['Web', 'API'],
				pricing_type: 'freemium',
			},
		};
		const rows = buildCompareRowsForSteps(
			discoverySnap,
			[
				{
					id: 'details',
					label: 'Details',
					fields: [
						{
							key: 'categories',
							label: 'Categories',
							profilePath: 'profile_data.categories',
							fillMode: 'checkbox_group',
						},
						{
							key: 'platforms',
							label: 'Platforms',
							profilePath: 'profile_data.platforms',
							fillMode: 'checkbox_group',
						},
					],
				},
			],
			{ fillBaselinesByField: new Map(), selectedSourcePathsByField: new Map() }
		);
		expect(rows.details[0]?.profileDisplay).toBe('SaaS, Marketing, Developer Tools');
		expect(rows.details[1]?.profileDisplay).toBe('Web, API');
	});

	it('isFieldTouched when form diverges from fill baseline', () => {
		const baseline = normalizedFromTagItems(['Automation', 'AI']);
		const form = normalizedFromTagItems(['Automation']);
		expect(isFieldTouched(form, baseline, 'tags')).toBe(true);
		expect(isFieldTouched(baseline, baseline, 'tags')).toBe(false);
	});

	it('buildCompareRowsForSteps prefers persisted media labels in the profile column', () => {
		const snap: AutoLaunchProfileSnapshot = {
			...snapshot,
			logo_url: 'org/profile/0.6739.png',
			profile_data: {
				logo_label: 'App icon',
				gallery_urls: ['org/profile/0.1111.png', 'org/profile/shot-b.png'],
				gallery_labels: ['Dashboard', 'Settings view'],
			},
		};
		const fields: LaunchStepField[] = [
			{
				key: 'logo',
				label: 'Tool logo',
				profilePath: 'logo_url',
				fillMode: 'file',
			},
			{
				key: 'gallery',
				label: 'Tool screenshots',
				profilePath: 'profile_data.gallery_urls',
				fillMode: 'files',
			},
		];
		const rows = buildCompareRowsForSteps(
			snap,
			[{ id: 'submit', label: 'Submit', fields }],
			{ fillBaselinesByField: new Map(), selectedSourcePathsByField: new Map() }
		);
		expect(rows.submit[0]?.profileDisplay).toBe('App icon');
		expect(rows.submit[1]?.profileDisplay).toBe('Dashboard, Settings view');
	});

	it('buildCompareRowsForSteps falls back to storage basenames when labels are unset', () => {
		const snap: AutoLaunchProfileSnapshot = {
			...snapshot,
			logo_url: 'org/profile/logo.webp',
			profile_data: {
				gallery_urls: ['org/profile/shot-a.png', 'org/profile/shot-b.png'],
			},
		};
		const fields: LaunchStepField[] = [
			{
				key: 'logo',
				label: 'Tool logo',
				profilePath: 'logo_url',
				fillMode: 'file',
			},
			{
				key: 'gallery',
				label: 'Tool screenshots',
				profilePath: 'profile_data.gallery_urls',
				fillMode: 'files',
			},
		];
		const rows = buildCompareRowsForSteps(
			snap,
			[{ id: 'submit', label: 'Submit', fields }],
			{ fillBaselinesByField: new Map(), selectedSourcePathsByField: new Map() }
		);
		expect(rows.submit[0]?.profileDisplay).toBe('logo.webp');
		expect(rows.submit[1]?.profileDisplay).toBe('shot-a.png, shot-b.png');
	});

	it('buildCompareRowsForSteps maps legacy random gallery keys to Screenshot n', () => {
		const snap: AutoLaunchProfileSnapshot = {
			...snapshot,
			profile_data: {
				gallery_urls: ['org/profile/0.6739143119534297.png'],
			},
		};
		const fields: LaunchStepField[] = [
			{
				key: 'gallery',
				label: 'Tool screenshots',
				profilePath: 'profile_data.gallery_urls',
				fillMode: 'files',
			},
		];
		const rows = buildCompareRowsForSteps(
			snap,
			[{ id: 'submit', label: 'Submit', fields }],
			{ fillBaselinesByField: new Map(), selectedSourcePathsByField: new Map() }
		);
		expect(rows.submit[0]?.profileDisplay).toBe('Screenshot 1');
	});

	it('buildCompareRowsForSteps uses main-profile media labels when the variant inherits assets', () => {
		const variant: AutoLaunchProfileSnapshot = {
			...snapshot,
			logo_url: null,
			profile_data: { gallery_urls: [] },
		};
		const main: AutoLaunchProfileSnapshot = {
			...snapshot,
			logo_url: 'org/profile/random-logo.webp',
			profile_data: {
				logo_label: 'Brand mark',
				gallery_urls: ['org/profile/a.png', 'org/profile/b.png'],
				gallery_labels: ['Hero', 'Pricing'],
			},
		};
		const fields: LaunchStepField[] = [
			{
				key: 'logo',
				label: 'Tool logo',
				profilePath: 'logo_url',
				fillMode: 'file',
			},
			{
				key: 'gallery',
				label: 'Tool screenshots',
				profilePath: 'profile_data.gallery_urls',
				fillMode: 'files',
			},
		];
		const rows = buildCompareRowsForSteps(
			variant,
			[{ id: 'submit', label: 'Submit', fields }],
			{
				fillBaselinesByField: new Map(),
				selectedSourcePathsByField: new Map(),
				mainProfileSnapshot: main,
			}
		);
		expect(rows.submit[0]?.profileDisplay).toBe('Brand mark');
		expect(rows.submit[1]?.profileDisplay).toBe('Hero, Pricing');
	});

	it('compareRowsVisibleOnPage drops rows without a resolved control', () => {
		const row = buildCompareRowsForSteps(
			snapshot,
			[{ id: 'general', label: 'General', fields: [{ key: 'name', label: 'Name', profilePath: 'name' }] }],
			{ fillBaselinesByField: new Map(), selectedSourcePathsByField: new Map() }
		).general[0]!;
		const onPage = { ...row, controlOnPage: true };
		const offPage = { ...row, controlOnPage: false };
		expect(compareRowsVisibleOnPage([onPage, offPage])).toHaveLength(1);
		expect(compareRowsVisibleOnPage([onPage, offPage])[0]?.controlOnPage).toBe(true);
	});

	it('buildCompareRowsForSteps marks missing controls', () => {
		const field: LaunchStepField = {
			key: 'name',
			label: 'Name',
			profilePath: 'name',
			required: true,
		};
		const rows = buildCompareRowsForSteps(
			snapshot,
			[{ id: 'general', label: 'General', fields: [field] }],
			{ fillBaselinesByField: new Map(), selectedSourcePathsByField: new Map() }
		);
		expect(rows.general).toHaveLength(1);
		expect(rows.general[0]?.controlOnPage).toBe(false);
		expect(rows.general[0]?.showRequiredWarning).toBe(true);
		expect(rows.general[0]?.profileDisplay).toBe('Acme');
	});

	it('refreshCompareRowFromDom picks up hydrated input values', () => {
		document.body.replaceChildren();
		const input = document.createElement('input');
		input.setAttribute('aria-label', 'Product name');
		input.value = 'OpenQuok';
		document.body.append(input);

		const field: LaunchStepField = {
			key: 'name',
			label: 'Product name',
			profilePath: 'name',
			selectorHint: '[aria-label="Product name"]',
		};
		const baseline = buildCompareRowsForSteps(
			snapshot,
			[{ id: 'general', label: 'General', fields: [field] }],
			{ fillBaselinesByField: new Map(), selectedSourcePathsByField: new Map() }
		).general[0]!;

		const refreshed = refreshCompareRowFromDom(baseline, field, undefined);
		expect(refreshed.formDisplay).toBe('OpenQuok');
		expect(refreshed.controlOnPage).toBe(true);
	});
});
