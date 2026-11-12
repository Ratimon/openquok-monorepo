import type { StepRailCompareFieldRow } from './launchCompareState.js';
import {
	buildCompareIssueBannerParts,
	buildStatusLine,
	computeFillProgressPercent,
	formatFillProgressMessage,
	compareRowProfileCellClass,
	compareRowRightCellClass,
	countCompareIssueFields,
	countCompareManualAttentionFields,
	DirectoryLaunchStepRail,
	isCompareRowManualAttention,
	profileSourcePathLabel,
	syncRichCompareHeights,
} from './stepRail.js';
import type { StepRailViewState } from './stepRail.js';
import { describe, expect, it } from 'vitest';

function mockCompareRow(
	overrides: Partial<StepRailCompareFieldRow> = {}
): StepRailCompareFieldRow {
	return {
		fieldKey: 'tags',
		label: 'Tags',
		syncStatus: 'match',
		showRequiredWarning: false,
		showDiffWarning: false,
		profileNorm: { kind: 'tags', present: true, items: ['AI', 'Automation'] },
		formNorm: { kind: 'tags', present: true, items: ['AI', 'Automation'] },
		touched: false,
		controlOnPage: true,
		profileDisplay: 'AI, Automation',
		formDisplay: 'AI, Automation',
		hasSourcePicker: false,
		profileSourcePaths: [],
		selectedSourcePaths: [],
		...overrides,
	};
}

describe('fill progress helpers', () => {
	it('computes percent across steps and fields', () => {
		expect(
			computeFillProgressPercent({
				kind: 'all',
				stepIndex: 0,
				stepCount: 4,
				fieldIndex: 1,
				fieldCount: 4,
			})
		).toBe(9);
		expect(
			computeFillProgressPercent({
				kind: 'step',
				fieldIndex: 3,
				fieldCount: 5,
			})
		).toBe(70);
	});

	it('formats a human progress message', () => {
		const text = formatFillProgressMessage({
			kind: 'all',
			stepLabel: 'Discovery',
			stepIndex: 1,
			stepCount: 4,
			fieldLabel: 'Categories',
		});
		expect(text).toContain('Discovery');
		expect(text).toContain('Categories');
	});
});

describe('buildStatusLine', () => {
	it('guides users on the ready page', () => {
		expect(buildStatusLine({}, true)).toContain('Fill all steps');
		expect(buildStatusLine({}, true)).toContain('review');
	});

	it('mentions readyUrlHint when not on the submission page', () => {
		const line = buildStatusLine({ readyUrlHint: 'waiting-line' }, false);
		expect(line).toContain('waiting-line');
		expect(line).toContain('Fill');
	});
});

describe('profileSourcePathLabel', () => {
	it('humanizes profile_data paths', () => {
		expect(profileSourcePathLabel('profile_data.use_cases')).toBe('Use Cases');
		expect(profileSourcePathLabel('profile_data.tech_stack')).toBe('Tech Stack');
	});
});

describe('compare issue banner', () => {
	it('counts out-of-sync rows for the warning banner', () => {
		const state: StepRailViewState = {
			providerName: 'Uneed',
			productName: 'Acme',
			statusLine: 'Ready',
			steps: [{ id: 'general', label: 'General', fields: [] }],
			fieldResultsByStep: {},
			compareRowsByStep: {
				general: [
					mockCompareRow({ fieldKey: 'a', syncStatus: 'match' }),
					mockCompareRow({
						fieldKey: 'category',
						syncStatus: 'diff',
						showDiffWarning: true,
					}),
				],
			},
		};
		expect(countCompareIssueFields(state)).toBe(1);
	});

	it('counts diffs and fill failures', () => {
		const state: StepRailViewState = {
			providerName: 'Uneed',
			productName: 'Acme',
			statusLine: 'Ready',
			steps: [{ id: 'general', label: 'General', fields: [] }],
			fieldResultsByStep: {
				general: [{ key: 'category', status: 'not_found', label: 'Category' }],
			},
			compareRowsByStep: {
				general: [
					mockCompareRow({
						fieldKey: 'category',
						label: 'Category',
						syncStatus: 'diff',
						showDiffWarning: true,
						profileDisplay: 'SaaS',
						formDisplay: 'Marketing',
					}),
					mockCompareRow({ fieldKey: 'name', label: 'Name' }),
				],
			},
		};
		expect(countCompareManualAttentionFields(state)).toBe(1);
		expect(isCompareRowManualAttention(state.compareRowsByStep!.general[0]!)).toBe(true);
	});

	it('writes singular and plural banner copy', () => {
		expect(buildCompareIssueBannerParts(0)).toBeNull();
		expect(buildCompareIssueBannerParts(1)?.headline).toBe('1 field is not in sync.');
		expect(buildCompareIssueBannerParts(3)?.headline).toBe('3 fields are not in sync.');
		expect(buildCompareIssueBannerParts(1)?.detail).toContain('yourself.');
	});
});

describe('compare row cell classes', () => {
	it('flags required empty on the right', () => {
		const classes = compareRowRightCellClass(
			mockCompareRow({
				syncStatus: 'form_empty',
				showRequiredWarning: true,
				formDisplay: '—',
				formNorm: { kind: 'text', present: false },
			})
		);
		expect(classes).toContain('cell--required-empty');
	});

	it('flags touched edits on the right', () => {
		const classes = compareRowRightCellClass(
			mockCompareRow({
				syncStatus: 'diff',
				showDiffWarning: true,
				touched: true,
			})
		);
		expect(classes).toContain('cell--touched');
	});

	it('marks missing profile on the left', () => {
		const classes = compareRowProfileCellClass(
			mockCompareRow({
				profileDisplay: 'Not in profile',
				profileNorm: { kind: 'text', present: false },
			})
		);
		expect(classes).toContain('cell--profile-missing');
	});
});

describe('syncRichCompareHeights', () => {
	it('matches textarea height to profile rich pre', () => {
		document.body.replaceChildren();
		const row = document.createElement('div');
		row.className = 'compare-row';
		row.innerHTML = `
			<div class="compare-col compare-col--profile">
				<div class="cell cell--rich">
					<pre class="cell-rich-content" style="padding:8px;min-height:200px">Long profile copy</pre>
				</div>
			</div>
			<div class="compare-col compare-col--form">
				<div class="cell cell--form-editable cell--rich-editable">
					<textarea class="cell-input cell-input--rich" rows="3">Short</textarea>
				</div>
			</div>
		`;
		document.body.append(row);
		syncRichCompareHeights(document.body);
		const textarea = row.querySelector('textarea') as HTMLTextAreaElement;
		expect(parseInt(textarea.style.minHeight, 10)).toBeGreaterThanOrEqual(120);
	});
});

describe('DirectoryLaunchStepRail panel position', () => {
	it('resetPosition moves the panel to the default top-left anchor', () => {
		document.body.replaceChildren();
		const rail = new DirectoryLaunchStepRail({
			onFillStep: () => {},
			onFillAll: () => {},
			onResetPosition: () => {},
		});
		rail.mount();
		rail.resetPosition();
		const panel = document
			.getElementById('openquok-directory-launch-host')
			?.shadowRoot?.querySelector('.panel') as HTMLElement | null;
		expect(panel?.style.top).toBe('96px');
		expect(panel?.style.left).toBe('16px');
		rail.unmount();
	});
});

describe('DirectoryLaunchStepRail compare UI', () => {
	it('renders Profile and On page columns for compare rows', () => {
		document.body.replaceChildren();

		const rail = new DirectoryLaunchStepRail({
			onFillStep: () => {},
			onFillAll: () => {},
			onResetPosition: () => {},
			onFillField: () => {},
			onApplyFormValue: () => {},
		});
		rail.mount();

		rail.render({
			providerName: 'Uneed',
			productName: 'Acme',
			statusLine: 'Ready',
			steps: [
				{
					id: 'general',
					label: 'General',
					fields: [{ key: 'name', label: 'Name', profilePath: 'name' }],
				},
			],
			fieldResultsByStep: {},
			compareRowsByStep: {
				general: [
					mockCompareRow({
						fieldKey: 'name',
						label: 'Name',
						profileDisplay: 'Acme',
						formDisplay: 'Acme Co',
						syncStatus: 'diff',
						showDiffWarning: true,
						profileNorm: { kind: 'text', present: true, scalar: 'Acme' },
						formNorm: { kind: 'text', present: true, scalar: 'Acme Co' },
					}),
				],
			},
		});

		const host = document.getElementById('openquok-directory-launch-host');
		expect(host).not.toBeNull();
		const shadow = host?.shadowRoot;
		expect(shadow?.textContent).toContain('Profile');
		expect(shadow?.textContent).toContain('On page');
		expect(shadow?.querySelector('.compare-row-grid .cell--profile')?.textContent).toContain('Acme');
		const onPageInput = shadow?.querySelector('.cell-input') as HTMLTextAreaElement | null;
		expect(onPageInput?.value).toContain('Acme Co');
		expect(shadow?.querySelector('.compare-warning-banner')).not.toBeNull();
		expect(shadow?.querySelector('.cell-input')).not.toBeNull();
		const profileCol = shadow?.querySelector('.compare-col--profile');
		const formCol = shadow?.querySelector('.compare-col--form');
		const fillBtn = profileCol?.querySelector('button.fill-field-btn');
		expect(fillBtn?.textContent).toContain('Fill');
		expect(fillBtn?.querySelector('.fill-field-btn__arrow')?.textContent).toBe('→');
		expect(formCol?.querySelector('button.secondary')?.textContent).toBe('Update');

		rail.unmount();
	});

	it('renders tag chips on the On page column instead of a textarea', () => {
		document.body.replaceChildren();

		const rail = new DirectoryLaunchStepRail({
			onFillStep: () => {},
			onFillAll: () => {},
			onResetPosition: () => {},
			onFillField: () => {},
			onApplyFormValue: () => {},
		});
		rail.mount();

		rail.render({
			providerName: 'Uneed',
			productName: 'Acme',
			statusLine: 'Ready',
			steps: [
				{
					id: 'general',
					label: 'General',
					fields: [{ key: 'tags', label: 'Tags', profilePath: 'tags', fillMode: 'tags' }],
				},
			],
			fieldResultsByStep: {},
			compareRowsByStep: {
				general: [mockCompareRow()],
			},
		});

		const shadow = document.getElementById('openquok-directory-launch-host')?.shadowRoot;
		const formCol = shadow?.querySelector('.compare-col--form');
		expect(formCol?.querySelector('.chips .chip')?.textContent).toBe('AI');
		expect(formCol?.querySelector('.cell-input')).toBeNull();

		rail.unmount();
	});
});
