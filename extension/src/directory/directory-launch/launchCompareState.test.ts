import { describe, expect, it } from 'vitest';

import type { AutoLaunchProfileSnapshot, LaunchStepField } from 'openquok-common';

import {
	buildCompareRowsForSteps,
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
