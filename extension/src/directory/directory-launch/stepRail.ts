import {
	type AutoLaunchExtensionConfig,
	type AutoLaunchProfileSnapshot,
	type FieldFillResult,
	type LaunchStep,
	type LaunchStepFieldFillMode,
	type NormalizedFieldValue,
	richHtmlToPlainText,
	sanitizeRichHtmlBeforeCompare,
} from 'openquok-common';

import { AUTO_LAUNCH_PANEL_POSITION_KEY } from '../auto-launch/constants.js';
import type { DirectoryProfileSourceOption } from '../auto-launch/profileSourceOptions.js';
import { isFormFieldUserEditable } from './fillEngine.js';
import {
	buildCompareRowsForSteps,
	refreshCompareRowFromDom,
	type StepRailCompareFieldRow,
} from './launchCompareState.js';
import { coerceTagDisplayItems } from './readFormField.js';

export const PANEL_HOST_ID = 'openquok-directory-launch-host';

/** True while the member is typing in an On page compare cell (defer full re-render). */
export function isStepRailOnPageEditActive(): boolean {
	const host = document.getElementById(PANEL_HOST_ID);
	const active = host?.shadowRoot?.activeElement;
	return active instanceof HTMLTextAreaElement && active.classList.contains('cell-input');
}

export type StepRailCallbacks = {
	onFillStep: (stepId: string) => void;
	onFillAll: () => void;
	onResetPosition: () => void;
	onFillField?: (stepId: string, fieldKey: string) => void;
	onToggleSourcePath?: (fieldKey: string, profilePath: string, selected: boolean) => void;
	/** Pick an official select preset for profile compare + fill (Uneed categories). */
	onSelectProfilePreset?: (fieldKey: string, value: string) => void;
	/** Push an edited On page value into the directory form control. */
	onApplyFormValue?: (
		stepId: string,
		fieldKey: string,
		value: string,
		opts?: { richAsHtml?: boolean }
	) => void;
	/** Panel became visible — host may schedule a DOM re-read for compare rows. */
	onPanelRevealed?: () => void;
	/** Switch compare/fill source between main product profile and directory variants. */
	onProfileSourceChange?: (profileId: string) => void;
};

/** Live autofill progress for the on-page step rail (circular indicator + status). */
export type StepRailFillProgress = {
	kind: 'all' | 'step' | 'field';
	stepLabel?: string;
	/** Current step (0-based) when filling multiple steps. */
	stepIndex?: number;
	stepCount?: number;
	fieldLabel?: string;
	/** Field being filled (0-based index within the step). */
	fieldIndex?: number;
	fieldCount?: number;
};

export function computeFillProgressPercent(progress: StepRailFillProgress): number | null {
	const fieldCount = progress.fieldCount ?? 0;
	const fieldIndex = progress.fieldIndex;
	if (fieldCount > 0 && typeof fieldIndex === 'number') {
		const fieldFraction = Math.min(1, Math.max(0, (fieldIndex + 0.5) / fieldCount));
		const stepCount = progress.stepCount ?? 0;
		const stepIndex = progress.stepIndex;
		if (stepCount > 0 && typeof stepIndex === 'number') {
			return Math.round(((stepIndex + fieldFraction) / stepCount) * 100);
		}
		return Math.round(fieldFraction * 100);
	}
	const stepCount = progress.stepCount ?? 0;
	if (stepCount > 0 && typeof progress.stepIndex === 'number') {
		return Math.round(((progress.stepIndex + 1) / stepCount) * 100);
	}
	return null;
}

export function formatFillProgressMessage(progress: StepRailFillProgress): string {
	const parts: string[] = [];
	if (progress.stepLabel && (progress.stepCount ?? 0) > 1) {
		const stepNum = (progress.stepIndex ?? 0) + 1;
		parts.push(`${progress.stepLabel} (${stepNum}/${progress.stepCount})`);
	} else if (progress.stepLabel) {
		parts.push(progress.stepLabel);
	}
	if (progress.fieldLabel) {
		parts.push(progress.fieldLabel);
	}
	if (parts.length === 0) return 'Autofill in progress…';
	return `Filling ${parts.join(' · ')}…`;
}

export type StepRailViewState = {
	providerName: string;
	productName: string;
	statusLine: string;
	steps: LaunchStep[];
	activeStepId?: string;
	fieldResultsByStep: Record<string, FieldFillResult[]>;
	compareRowsByStep?: Record<string, StepRailCompareFieldRow[]>;
	/** Rebuild compare rows in the rail when `compareRowsByStep` is missing (stale content script). */
	profileSnapshot?: AutoLaunchProfileSnapshot;
	fillBaselinesByField?: ReadonlyMap<string, NormalizedFieldValue>;
	selectedSourcePathsByField?: ReadonlyMap<string, readonly string[]>;
	readyUrlHint?: string;
	fillDisabled?: boolean;
	fillGateMessage?: string;
	profileSourceOptions?: DirectoryProfileSourceOption[];
	activeProfileSourceId?: string;
	fillProgress?: StepRailFillProgress | null;
};

const FILL_FAILURE_STATUSES = new Set<FieldFillResult['status']>([
	'not_found',
	'not_in_profile',
	'error',
]);

/** Field needs a manual edit on the directory form or a profile fix before autofill works. */
export function isCompareRowManualAttention(
	row: StepRailCompareFieldRow,
	fillResult?: FieldFillResult
): boolean {
	if (row.showRequiredWarning) return true;
	if (row.syncStatus === 'diff') return true;
	if (row.syncStatus === 'profile_empty' && row.controlOnPage) return true;
	if (!row.controlOnPage && row.profileNorm.present) return true;
	if (fillResult && FILL_FAILURE_STATUSES.has(fillResult.status)) return true;
	return false;
}

/** Rows that are not in sync (matches step headers like “7/10 in sync”). */
export function countOutOfSyncCompareFields(state: StepRailViewState): number {
	let count = 0;
	for (const step of state.steps) {
		for (const row of resolveCompareRowsForStep(state, step)) {
			if (row.syncStatus !== 'match') count += 1;
		}
	}
	return count;
}

/** Warning banner count — rows that are not in sync (same basis as “X/Y in sync”). */
export function countCompareIssueFields(state: StepRailViewState): number {
	return countOutOfSyncCompareFields(state);
}

/** Count unique fields (by key) that need manual attention across all steps. */
export function countCompareManualAttentionFields(state: StepRailViewState): number {
	const seen = new Set<string>();
	let count = 0;
	for (const step of state.steps) {
		const compareRows = resolveCompareRowsForStep(state, step);
		const results = state.fieldResultsByStep[step.id] ?? [];
		for (const row of compareRows) {
			if (seen.has(row.fieldKey)) continue;
			const fillResult = results.find((entry) => entry.key === row.fieldKey);
			if (!isCompareRowManualAttention(row, fillResult)) continue;
			seen.add(row.fieldKey);
			count += 1;
		}
	}
	return count;
}

/** Warning banner copy when profile values cannot fully drive the directory form. */
export function buildCompareIssueBannerParts(issueCount: number): {
	headline: string;
	detail: string;
} | null {
	if (issueCount <= 0) return null;
	const noun = issueCount === 1 ? 'field' : 'fields';
	const headline =
		issueCount === 1
			? '1 field is not in sync.'
			: `${issueCount} fields are not in sync.`;
	return {
		headline,
		detail:
			'Profile and on-page values differ. Edit the On page column or fix the directory form yourself.',
	};
}

/** Prefer pre-built rows; otherwise build from snapshot when the session supplies one. */
export function resolveCompareRowsForStep(
	state: StepRailViewState,
	step: LaunchStep
): StepRailCompareFieldRow[] {
	const prebuilt = state.compareRowsByStep?.[step.id];
	if (prebuilt && prebuilt.length > 0) return prebuilt;
	if (!step.fields?.length || !state.profileSnapshot) return [];
	return (
		buildCompareRowsForSteps(state.profileSnapshot, [step], {
			fillBaselinesByField: state.fillBaselinesByField ?? new Map(),
			selectedSourcePathsByField: state.selectedSourcePathsByField ?? new Map(),
		})[step.id] ?? []
	);
}

type PanelPosition = { top: number; left: number };

/** Human label for alternate `profileSourcePaths` checkboxes. */
export function profileSourcePathLabel(profilePath: string): string {
	const segment = profilePath.split('.').pop() ?? profilePath;
	if (!segment) return profilePath;
	return segment
		.split('_')
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

/** CSS classes for the on-page (right) compare cell — exported for unit tests. */
export function compareRowRightCellClass(row: StepRailCompareFieldRow): string {
	const classes = ['cell', 'cell--form'];
	if (!row.controlOnPage) {
		classes.push('cell--missing-control');
	} else if (row.showRequiredWarning) {
		classes.push('cell--required-empty');
	} else if (row.touched) {
		classes.push('cell--touched');
	} else if (row.showDiffWarning) {
		classes.push('cell--diff');
	} else if (row.syncStatus === 'match') {
		classes.push('cell--match');
	}
	return classes.join(' ');
}

/** CSS classes for the profile (left) compare cell — exported for unit tests. */
export function compareRowProfileCellClass(row: StepRailCompareFieldRow): string {
	const classes = ['cell', 'cell--profile'];
	if (!row.profileNorm.present) {
		classes.push('cell--profile-missing');
	} else if (
		row.profileScalarTooLong ||
		row.profileSelectInvalid ||
		row.profileTagsNotFillable ||
		(row.invalidProfileTags?.length ?? 0) > 0
	) {
		classes.push('cell--profile-invalid');
	}
	return classes.join(' ');
}

function loadPosition(): PanelPosition {
	try {
		const raw = localStorage.getItem(AUTO_LAUNCH_PANEL_POSITION_KEY);
		if (!raw) return { top: 96, left: 16 };
		const parsed = JSON.parse(raw) as PanelPosition;
		if (typeof parsed.top === 'number' && typeof parsed.left === 'number') return parsed;
	} catch {
		/* ignore */
	}
	return { top: 96, left: 16 };
}

function savePosition(position: PanelPosition): void {
	localStorage.setItem(AUTO_LAUNCH_PANEL_POSITION_KEY, JSON.stringify(position));
}

function statusIcon(status: FieldFillResult['status']): string {
	switch (status) {
		case 'found':
			return '✓';
		case 'skipped':
			return '○';
		case 'not_in_profile':
			return '—';
		case 'not_found':
			return '!';
		default:
			return '×';
	}
}

export class DirectoryLaunchStepRail {
	private host: HTMLElement | null = null;
	private shadow: ShadowRoot | null = null;
	private bodyEl: HTMLElement | null = null;
	private callbacks: StepRailCallbacks;
	private expandedFieldKeys = new Set<string>();
	private richHtmlViewByField = new Map<string, 'text' | 'html'>();
	private lastViewState: StepRailViewState | null = null;
	private pendingViewState: StepRailViewState | null = null;

	constructor(callbacks: StepRailCallbacks) {
		this.callbacks = callbacks;
	}

	mount(): void {
		if (document.getElementById(PANEL_HOST_ID)) return;

		const host = document.createElement('div');
		host.id = PANEL_HOST_ID;
		host.style.all = 'initial';
		document.documentElement.appendChild(host);

		const shadow = host.attachShadow({ mode: 'open' });
		const style = document.createElement('style');
		style.textContent = `
			:host, * { box-sizing: border-box; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
			.body {
				position: relative;
			}
			.panel {
				position: fixed;
				z-index: 2147483646;
				width: min(94vw, 640px);
				max-height: min(80vh, 560px);
				overflow: auto;
				background: #0f172a;
				color: #e2e8f0;
				border: 1px solid #334155;
				border-radius: 12px;
				box-shadow: 0 12px 40px rgba(0,0,0,.35);
				font-size: 12px;
				line-height: 1.4;
			}
			.header {
				padding: 12px 12px 8px;
				border-bottom: 1px solid #334155;
				cursor: move;
				user-select: none;
			}
			.header-row {
				display: flex;
				align-items: flex-start;
				justify-content: space-between;
				gap: 8px;
			}
			.header-copy { flex: 1; min-width: 0; }
			.title { font-weight: 600; font-size: 13px; margin: 0 0 4px; }
			.subtitle { color: #94a3b8; margin: 0; font-size: 11px; }
			.status { margin-top: 8px; color: #cbd5e1; font-size: 11px; }
			button.close-btn {
				all: unset;
				flex-shrink: 0;
				cursor: pointer;
				color: #94a3b8;
				font-size: 20px;
				line-height: 1;
				padding: 2px 8px;
				border-radius: 6px;
				font-weight: 400;
			}
			button.close-btn:hover { color: #f8fafc; background: #1e293b; }
			.rich-view-toggle {
				display: inline-flex;
				gap: 2px;
				margin-left: auto;
				flex-shrink: 0;
			}
			.toggle-chip {
				all: unset;
				cursor: pointer;
				font-size: 9px;
				font-weight: 600;
				padding: 2px 6px;
				border-radius: 4px;
				color: #94a3b8;
				background: #1e293b;
				text-transform: uppercase;
				letter-spacing: .03em;
			}
			.toggle-chip--active {
				background: #334155;
				color: #e2e8f0;
			}
			.cell--rich {
				max-height: none;
				overflow: visible;
			}
			.cell-rich-content {
				margin: 0;
				padding: 6px 8px;
				font: inherit;
				font-size: 10px;
				line-height: 1.45;
				white-space: pre-wrap;
				word-break: break-word;
				max-height: none;
				color: inherit;
				background: transparent;
			}
			.steps { padding: 8px 0; }
			.step {
				border-top: 1px solid #1e293b;
				padding: 8px 12px;
			}
			.step-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 8px;
				margin-bottom: 6px;
			}
			.profile-source-bar {
				display: flex;
				flex-direction: column;
				gap: 4px;
				margin: 0 0 8px;
				padding: 6px 8px;
				border-radius: 6px;
				border: 1px solid #1e293b;
				background: #0c1220;
			}
			.profile-source-label {
				font-size: 10px;
				font-weight: 600;
				color: #94a3b8;
				text-transform: uppercase;
				letter-spacing: 0.04em;
			}
			.profile-source-select {
				width: 100%;
				box-sizing: border-box;
				padding: 5px 8px;
				border-radius: 6px;
				border: 1px solid #334155;
				background: #111827;
				color: #e2e8f0;
				font-size: 11px;
				cursor: pointer;
			}
			.profile-source-select:focus-visible {
				outline: 2px solid #2563eb;
				outline-offset: 1px;
			}
			.step-label { font-weight: 600; color: #f1f5f9; }
			button {
				all: unset;
				cursor: pointer;
				background: #2563eb;
				color: #fff;
				padding: 4px 10px;
				border-radius: 6px;
				font-size: 11px;
				font-weight: 600;
			}
			button.secondary {
				background: #334155;
				color: #e2e8f0;
			}
			button.icon-btn {
				background: transparent;
				color: #94a3b8;
				padding: 2px 4px;
				font-size: 12px;
				line-height: 1;
				border-radius: 4px;
			}
			button.icon-btn:hover { color: #e2e8f0; background: #1e293b; }
			button.icon-btn--open { color: #38bdf8; }
			button.compact {
				padding: 3px 8px;
				font-size: 10px;
			}
			button.fill-field-btn {
				display: inline-flex;
				align-items: center;
				justify-content: center;
				gap: 4px;
				white-space: nowrap;
			}
			.fill-field-btn__arrow {
				font-size: 11px;
				line-height: 1;
				opacity: 0.92;
			}
			button:disabled { opacity: .5; cursor: not-allowed; }
			.fill-busy-overlay {
				position: absolute;
				inset: 0;
				z-index: 20;
				display: flex;
				align-items: center;
				justify-content: center;
				background: rgba(15, 23, 42, 0.82);
				backdrop-filter: blur(2px);
				border-radius: 0 0 12px 12px;
				padding: 24px 16px;
			}
			.fill-progress {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 12px;
				text-align: center;
				max-width: 240px;
			}
			.fill-progress-ring {
				width: 52px;
				height: 52px;
				transform: rotate(-90deg);
			}
			.fill-progress-ring__track {
				fill: none;
				stroke: #334155;
				stroke-width: 3.2;
			}
			.fill-progress-ring__value {
				fill: none;
				stroke: #38bdf8;
				stroke-width: 3.2;
				stroke-linecap: round;
				transition: stroke-dasharray 0.2s ease;
			}
			@keyframes fill-progress-spin {
				to { transform: rotate(-90deg) rotate(360deg); }
			}
			.fill-progress-ring--indeterminate {
				animation: fill-progress-spin 1s linear infinite;
			}
			.fill-progress-ring--indeterminate .fill-progress-ring__value {
				stroke-dasharray: 48 100;
			}
			.fill-progress-label {
				margin: 0;
				font-size: 12px;
				font-weight: 600;
				color: #f1f5f9;
				line-height: 1.35;
			}
			.fill-progress-hint {
				margin: 0;
				font-size: 10px;
				color: #94a3b8;
				line-height: 1.35;
			}
			.compare-table-head {
				display: grid;
				grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
				gap: 8px;
				position: sticky;
				top: 0;
				background: #0f172a;
				z-index: 1;
				padding: 6px 0 4px;
				margin-bottom: 4px;
				border-bottom: 1px solid #1e293b;
				font-size: 10px;
				font-weight: 600;
				color: #64748b;
				text-transform: uppercase;
				letter-spacing: .04em;
			}
			.compare-rows { display: flex; flex-direction: column; gap: 6px; }
			.compare-row { display: flex; flex-direction: column; gap: 4px; }
			.compare-row-label {
				font-size: 11px;
				font-weight: 600;
				color: #cbd5e1;
				display: flex;
				align-items: center;
				gap: 6px;
			}
			.fill-dot {
				font-size: 10px;
				color: #64748b;
				font-weight: 400;
			}
			.fill-dot--found { color: #4ade80; }
			.fill-dot--warn { color: #fbbf24; }
			.compare-row-grid {
				display: grid;
				grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
				gap: 8px;
				align-items: stretch;
			}
			.compare-col {
				display: flex;
				flex-direction: column;
				gap: 4px;
				min-width: 0;
			}
			.compare-col-actions {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				align-items: center;
				justify-content: flex-end;
				gap: 4px;
			}
			.cell {
				padding: 6px 8px;
				border-radius: 6px;
				border: 1px solid #1e293b;
				background: #111827;
				font-size: 11px;
				color: #e2e8f0;
				min-height: 28px;
				min-width: 0;
				max-width: 100%;
				word-break: break-word;
				overflow-wrap: anywhere;
			}
			.cell--profile-missing {
				color: #64748b;
				font-style: italic;
				border-color: #1e293b;
				background: #0c1220;
			}
			.cell--profile-invalid {
				border-color: #f87171;
				background: rgba(248, 113, 113, .1);
			}
			.chip--invalid {
				background: rgba(248, 113, 113, .25);
				color: #fecaca;
				border: 1px solid #f87171;
			}
			.cell--required-empty {
				border-color: #f87171;
				background: rgba(248, 113, 113, .12);
				color: #fecaca;
			}
			.cell--diff {
				border-color: #fbbf24;
				background: rgba(251, 191, 36, .1);
			}
			.cell--touched {
				border-color: #facc15;
				background: rgba(250, 204, 21, .14);
			}
			.cell--match {
				border-color: #334155;
				background: rgba(74, 222, 128, .06);
			}
			.cell--missing-control {
				color: #64748b;
				border-style: dashed;
				background: #0c1220;
			}
			.cell--form-editable {
				padding: 0;
				overflow: visible;
				display: flex;
				align-items: stretch;
				min-width: 0;
			}
			.cell--form-editable.cell--rich-editable {
				overflow: visible;
			}
			.cell--form-editable:focus-within {
				border-color: #38bdf8;
				box-shadow: 0 0 0 1px rgba(56, 189, 248, .35);
			}
			.cell-input {
				display: block;
				box-sizing: border-box;
				width: 100%;
				min-width: 0;
				max-width: 100%;
				min-height: 28px;
				max-height: 120px;
				margin: 0;
				padding: 6px 8px;
				border: none;
				background: #0f172a;
				color: #e2e8f0;
				font: inherit;
				line-height: 1.35;
				resize: vertical;
				overflow-x: hidden;
				overflow-y: auto;
				white-space: pre-wrap;
				word-break: break-word;
				outline: none;
				cursor: text;
				pointer-events: auto;
				flex: 1 1 auto;
			}
			.cell-input--rich {
				max-height: min(40vh, 320px);
				min-height: 120px;
				height: auto;
				field-sizing: content;
				resize: vertical;
				overflow-x: hidden;
				overflow-y: auto;
				font-size: 10px;
				line-height: 1.45;
			}
			.cell-input::placeholder { color: #64748b; font-style: italic; }
			.chips {
				display: flex;
				flex-wrap: wrap;
				gap: 4px;
			}
			.chip {
				display: inline-block;
				padding: 2px 6px;
				border-radius: 999px;
				background: #1e293b;
				color: #e2e8f0;
				font-size: 10px;
				line-height: 1.3;
			}
			button.chip {
				border: 1px solid #334155;
				cursor: pointer;
				font: inherit;
			}
			.chip--active {
				background: #2563eb;
				border-color: #3b82f6;
				color: #eff6ff;
			}
			.source-picker {
				margin: 0 0 0 0;
				padding: 8px;
				border-radius: 6px;
				border: 1px solid #1e293b;
				background: #0c1220;
			}
			.source-picker-hint {
				margin: 0 0 6px;
				font-size: 10px;
				color: #94a3b8;
			}
			.source-option {
				display: flex;
				align-items: center;
				gap: 6px;
				font-size: 11px;
				color: #cbd5e1;
				margin-bottom: 4px;
				cursor: pointer;
			}
			.source-option input { accent-color: #2563eb; }
			.fields { list-style: none; margin: 0; padding: 0; }
			.fields li {
				display: flex;
				gap: 6px;
				align-items: flex-start;
				color: #94a3b8;
				font-size: 11px;
				margin-bottom: 2px;
			}
			.fields .icon { width: 12px; flex-shrink: 0; }
			.compare-warning-banner {
				margin: 0 12px 8px;
				padding: 10px 12px;
				border-radius: 8px;
				border: 1px solid #f87171;
				background: rgba(248, 113, 113, .14);
				font-size: 11px;
				line-height: 1.45;
				color: #fecaca;
			}
			.compare-warning-banner strong {
				display: block;
				margin-bottom: 4px;
				font-weight: 600;
				color: #fca5a5;
			}
			.actions-top {
				padding: 10px 12px;
				border-bottom: 1px solid #334155;
				display: flex;
				flex-direction: column;
				gap: 8px;
			}
			.actions-top button {
				width: 100%;
				text-align: center;
				padding: 8px 12px;
			}
			.footer {
				padding: 10px 12px 12px;
				border-top: 1px solid #334155;
				display: flex;
				flex-direction: column;
				gap: 8px;
			}
			.disclaimer { color: #64748b; font-size: 10px; }
			.gate-hint { color: #94a3b8; font-size: 10px; margin: 0; }
			.panel.panel--revealed {
				box-shadow: 0 0 0 2px #38bdf8, 0 12px 40px rgba(0,0,0,.35);
			}
		`;

		const panel = document.createElement('div');
		panel.className = 'panel';
		const pos = loadPosition();
		panel.style.top = `${pos.top}px`;
		panel.style.left = `${pos.left}px`;

		const body = document.createElement('div');
		body.className = 'body';

		panel.appendChild(body);
		shadow.appendChild(style);
		shadow.appendChild(panel);

		this.enableDrag(panel);

		this.host = host;
		this.shadow = shadow;
		this.bodyEl = body;
	}

	unmount(): void {
		this.host?.remove();
		this.host = null;
		this.shadow = null;
		this.bodyEl = null;
	}

	resetPosition(): void {
		if (!this.host) {
			this.mount();
		}
		if (this.host) {
			this.host.style.display = 'block';
			this.host.style.visibility = 'visible';
		}
		const panel = this.shadow?.querySelector('.panel') as HTMLElement | null;
		if (!panel) return;
		panel.style.top = '96px';
		panel.style.left = '16px';
		savePosition({ top: 96, left: 16 });
		panel.classList.add('panel--revealed');
		window.setTimeout(() => panel.classList.remove('panel--revealed'), 800);
		this.callbacks.onResetPosition();
	}

	/** Ensure the on-page Fill panel is mounted and visible (e.g. after side-panel channel click). */
	hidePanel(): void {
		if (this.host) {
			this.host.style.display = 'none';
		}
	}

	revealPanel(): void {
		if (!this.host) {
			this.mount();
		}
		if (!this.host) return;
		this.host.style.display = 'block';
		this.host.style.visibility = 'visible';
		const panel = this.shadow?.querySelector('.panel') as HTMLElement | null;
		if (!panel) return;
		panel.classList.add('panel--revealed');
		window.setTimeout(() => panel.classList.remove('panel--revealed'), 800);
		this.callbacks.onPanelRevealed?.();
	}

	render(state: StepRailViewState): void {
		if (!this.bodyEl) return;

		if (isStepRailOnPageEditActive()) {
			this.pendingViewState = state;
			return;
		}
		this.pendingViewState = null;
		this.lastViewState = state;

		this.bodyEl.replaceChildren();

		const header = document.createElement('div');
		header.className = 'header';

		const headerRow = document.createElement('div');
		headerRow.className = 'header-row';

		const headerCopy = document.createElement('div');
		headerCopy.className = 'header-copy';
		const title = document.createElement('p');
		title.className = 'title';
		title.textContent = state.providerName;
		const subtitle = document.createElement('p');
		subtitle.className = 'subtitle';
		subtitle.textContent = state.productName;
		headerCopy.append(title, subtitle);

		const closeBtn = document.createElement('button');
		closeBtn.type = 'button';
		closeBtn.className = 'close-btn';
		closeBtn.setAttribute('aria-label', 'Close panel');
		closeBtn.textContent = '×';
		closeBtn.addEventListener('click', (event) => {
			event.stopPropagation();
			this.hidePanel();
		});

		headerRow.append(headerCopy, closeBtn);

		const status = document.createElement('p');
		status.className = 'status';
		status.textContent = state.statusLine;
		header.append(headerRow, status);

		const issueCount = countCompareIssueFields(state);
		const issueBannerParts = buildCompareIssueBannerParts(issueCount);
		let issueBanner: HTMLElement | null = null;
		if (issueBannerParts) {
			issueBanner = document.createElement('div');
			issueBanner.className = 'compare-warning-banner';
			issueBanner.setAttribute('role', 'alert');
			const headline = document.createElement('strong');
			headline.textContent = issueBannerParts.headline;
			const detail = document.createElement('span');
			detail.textContent = issueBannerParts.detail;
			issueBanner.append(headline, detail);
		}

		const actionsTop = document.createElement('div');
		actionsTop.className = 'actions-top';

		const fillActionsDisabled = Boolean(state.fillDisabled);
		const fillAll = document.createElement('button');
		fillAll.type = 'button';
		fillAll.textContent = 'Fill all steps';
		fillAll.disabled = fillActionsDisabled;
		fillAll.addEventListener('click', () => this.callbacks.onFillAll());

		actionsTop.append(fillAll);
		if (state.fillDisabled && state.fillGateMessage) {
			const gateHint = document.createElement('p');
			gateHint.className = 'gate-hint';
			gateHint.textContent = state.fillGateMessage;
			actionsTop.append(gateHint);
		}

		const stepsWrap = document.createElement('div');
		stepsWrap.className = 'steps';
		const firstStepId = state.steps[0]?.id;

		for (const step of state.steps) {
			const results = state.fieldResultsByStep[step.id] ?? [];
			const compareRows = resolveCompareRowsForStep(state, step);
			const fieldCount = compareRows.length || step.fields?.length || results.length;

			const stepEl = document.createElement('section');
			stepEl.className = 'step';

			const head = document.createElement('div');
			head.className = 'step-head';

			const label = document.createElement('span');
			label.className = 'step-label';
			if (compareRows.length > 0) {
				const synced = compareRows.filter((row) => row.syncStatus === 'match').length;
				label.textContent = `${step.label} (${synced}/${fieldCount} in sync)`;
			} else {
				const filled = results.filter((r) => r.status === 'found' || r.status === 'skipped').length;
				label.textContent = `${step.label} (${filled}/${fieldCount || 0} fields)`;
			}

			head.append(label);

			const stepBlocks: HTMLElement[] = [head];

			if (
				step.id === firstStepId &&
				state.profileSourceOptions &&
				state.profileSourceOptions.length > 1
			) {
				const sourceBar = document.createElement('div');
				sourceBar.className = 'profile-source-bar';
				const sourceLabel = document.createElement('span');
				sourceLabel.className = 'profile-source-label';
				sourceLabel.textContent = 'Profile source';
				const sourceSelect = document.createElement('select');
				sourceSelect.className = 'profile-source-select';
				sourceSelect.setAttribute('aria-label', 'Profile source for compare and fill');
				for (const option of state.profileSourceOptions) {
					const item = document.createElement('option');
					item.value = option.id;
					item.textContent = option.label;
					if (option.id === state.activeProfileSourceId) {
						item.selected = true;
					}
					sourceSelect.append(item);
				}
				sourceSelect.addEventListener('change', () => {
					const next = sourceSelect.value.trim();
					if (!next || next === state.activeProfileSourceId) return;
					this.callbacks.onProfileSourceChange?.(next);
				});
				sourceBar.append(sourceLabel, sourceSelect);
				stepBlocks.push(sourceBar);
			}

			if (compareRows.length > 0) {
				const tableHead = document.createElement('div');
				tableHead.className = 'compare-table-head';
				const profileHead = document.createElement('span');
				profileHead.textContent = 'Profile';
				const onPageHead = document.createElement('span');
				onPageHead.textContent = 'On page';
				tableHead.append(profileHead, onPageHead);

				const rowsWrap = document.createElement('div');
				rowsWrap.className = 'compare-rows';

				for (const row of compareRows) {
					const fieldDef = step.fields?.find((entry) => entry.key === row.fieldKey);
					const baseline = state.fillBaselinesByField?.get(row.fieldKey);
					const liveRow = fieldDef
						? refreshCompareRowFromDom(row, fieldDef, baseline)
						: row;
					rowsWrap.appendChild(
						this.buildCompareRow(
							step.id,
							liveRow,
							results,
							Boolean(state.fillDisabled),
							fieldDef
						)
					);
				}

				stepBlocks.push(tableHead, rowsWrap);
			}

			stepEl.append(...stepBlocks);
			stepsWrap.appendChild(stepEl);
		}

		const footer = document.createElement('div');
		footer.className = 'footer';

		const reset = document.createElement('button');
		reset.type = 'button';
		reset.className = 'secondary';
		reset.textContent = 'Reset panel position';
		reset.addEventListener('click', () => this.resetPosition());

		const disclaimer = document.createElement('p');
		disclaimer.className = 'disclaimer';
		disclaimer.textContent =
			'OpenQuok fills forms only. You review and submit on the directory site.';

		footer.append(reset, disclaimer);

		if (issueBanner) {
			this.bodyEl.append(header, issueBanner, actionsTop, stepsWrap, footer);
		} else {
			this.bodyEl.append(header, actionsTop, stepsWrap, footer);
		}

		if (state.fillProgress) {
			this.bodyEl.appendChild(this.buildFillProgressOverlay(state.fillProgress));
			const panel = this.shadow?.querySelector('.panel') as HTMLElement | null;
			panel?.setAttribute('aria-busy', 'true');
		} else {
			const panel = this.shadow?.querySelector('.panel') as HTMLElement | null;
			panel?.removeAttribute('aria-busy');
		}

		window.requestAnimationFrame(() => syncRichCompareHeights(stepsWrap));
	}

	private buildFillProgressOverlay(progress: StepRailFillProgress): HTMLElement {
		const overlay = document.createElement('div');
		overlay.className = 'fill-busy-overlay';
		overlay.setAttribute('role', 'status');
		overlay.setAttribute('aria-live', 'polite');

		const wrap = document.createElement('div');
		wrap.className = 'fill-progress';

		const percent = computeFillProgressPercent(progress);
		const ringWrap = document.createElement('div');
		const indeterminate = percent === null;
		ringWrap.className = indeterminate
			? 'fill-progress-ring fill-progress-ring--indeterminate'
			: 'fill-progress-ring';

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('viewBox', '0 0 36 36');
		svg.setAttribute('width', '52');
		svg.setAttribute('height', '52');
		svg.setAttribute('role', 'progressbar');
		if (percent !== null) {
			svg.setAttribute('aria-valuemin', '0');
			svg.setAttribute('aria-valuemax', '100');
			svg.setAttribute('aria-valuenow', String(percent));
		} else {
			svg.setAttribute('aria-busy', 'true');
		}

		const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		track.setAttribute('class', 'fill-progress-ring__track');
		track.setAttribute('cx', '18');
		track.setAttribute('cy', '18');
		track.setAttribute('r', '15.9155');

		const value = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		value.setAttribute('class', 'fill-progress-ring__value');
		value.setAttribute('cx', '18');
		value.setAttribute('cy', '18');
		value.setAttribute('r', '15.9155');
		const circumference = 2 * Math.PI * 15.9155;
		value.setAttribute('stroke-dasharray', `${circumference} ${circumference}`);
		if (!indeterminate && percent !== null) {
			const filled = (percent / 100) * circumference;
			value.setAttribute('stroke-dashoffset', String(circumference - filled));
		} else {
			value.setAttribute('stroke-dashoffset', '0');
		}

		svg.append(track, value);
		ringWrap.appendChild(svg);

		const label = document.createElement('p');
		label.className = 'fill-progress-label';
		label.textContent = formatFillProgressMessage(progress);

		const hint = document.createElement('p');
		hint.className = 'fill-progress-hint';
		hint.textContent =
			percent !== null
				? `${percent}% — keep this tab open until autofill finishes.`
				: 'Keep this tab open until autofill finishes.';

		wrap.append(ringWrap, label, hint);
		overlay.appendChild(wrap);
		return overlay;
	}

	private buildCompareRow(
		stepId: string,
		row: StepRailCompareFieldRow,
		results: FieldFillResult[],
		fillDisabled: boolean,
		fieldDef?: LaunchStep['fields'][number]
	): HTMLElement {
		const wrap = document.createElement('div');
		wrap.className = 'compare-row';
		wrap.dataset.fieldKey = row.fieldKey;

		const result = results.find((entry) => entry.key === row.fieldKey);
		const rowLabel = document.createElement('div');
		rowLabel.className = 'compare-row-label';
		rowLabel.append(document.createTextNode(row.label));
		if (
			row.formNorm.kind === 'rich_html' ||
			row.profileNorm.kind === 'rich_html' ||
			fieldDef?.fillMode === 'rich_html'
		) {
			rowLabel.appendChild(this.buildRichViewToggle(row.fieldKey));
		}
		if (result) {
			const dot = document.createElement('span');
			dot.className = 'fill-dot';
			if (result.status === 'found') dot.classList.add('fill-dot--found');
			if (
				result.status === 'not_found' ||
				result.status === 'not_in_profile' ||
				result.status === 'skipped'
			) {
				dot.classList.add('fill-dot--warn');
			}
			dot.textContent = statusIcon(result.status);
			dot.title = result.message
				? `Last fill: ${result.status} — ${result.message}`
				: `Last fill: ${result.status}`;
			rowLabel.append(dot);
		}

		const grid = document.createElement('div');
		grid.className = 'compare-row-grid';

		const richView = this.getRichViewMode(row.fieldKey);

		const profileCell = document.createElement('div');
		profileCell.className = compareRowProfileCellClass(row);
		if ((row.invalidProfileTags?.length ?? 0) > 0) {
			profileCell.title = `Not on Uneed: ${row.invalidProfileTags!.join(', ')}. Fill only adds official catalog tags (red chips are not written).`;
		} else if (row.profileTagsNotFillable) {
			profileCell.title =
				'No profile tags match the Uneed catalog. Use the form to add official tags manually.';
		}
		const fieldFillMode = fieldDef?.fillMode;
		populateCompareCell(profileCell, row, 'profile', undefined, richView, fieldFillMode);

		const formCell = document.createElement('div');
		formCell.className = compareRowRightCellClass(row);
		const editableKind = fieldFillMode ?? row.formNorm.kind;
		const canEditOnPage =
			row.controlOnPage &&
			isFormFieldUserEditable(editableKind) &&
			editableKind !== 'tags' &&
			editableKind !== 'checkbox_group' &&
			Boolean(this.callbacks.onApplyFormValue);
		populateCompareCell(
			formCell,
			row,
			'form',
			canEditOnPage
				? {
						stepId,
						fieldKey: row.fieldKey,
						onApply: (value) =>
							this.callbacks.onApplyFormValue?.(stepId, row.fieldKey, value, {
								richAsHtml: richView === 'html',
							}),
						onAfterCommit: () => {
							if (this.pendingViewState) {
								this.render(this.pendingViewState);
							}
						},
					}
				: undefined,
			richView,
			fieldFillMode
		);

		const profileCol = document.createElement('div');
		profileCol.className = 'compare-col compare-col--profile';

		const profileActions = document.createElement('div');
		profileActions.className = 'compare-col-actions';

		if (row.hasSourcePicker) {
			const expandBtn = document.createElement('button');
			expandBtn.type = 'button';
			expandBtn.className = 'icon-btn';
			const expanded = this.expandedFieldKeys.has(row.fieldKey);
			if (expanded) expandBtn.classList.add('icon-btn--open');
			expandBtn.textContent = expanded ? '▾' : '▸';
			expandBtn.title = 'Profile sources and destination presets';
			expandBtn.addEventListener('click', () => {
				if (this.expandedFieldKeys.has(row.fieldKey)) {
					this.expandedFieldKeys.delete(row.fieldKey);
				} else {
					this.expandedFieldKeys.add(row.fieldKey);
				}
				// Expand/collapse without a full re-render from the parent.
				expandBtn.textContent = this.expandedFieldKeys.has(row.fieldKey) ? '▾' : '▸';
				expandBtn.classList.toggle('icon-btn--open', this.expandedFieldKeys.has(row.fieldKey));
				for (const picker of wrap.querySelectorAll('.source-picker')) {
					picker.remove();
				}
				if (this.expandedFieldKeys.has(row.fieldKey)) {
					this.appendCompareFieldExpandRows(wrap, row);
				}
			});
			profileActions.append(expandBtn);
		}

		const fillFieldBtn = document.createElement('button');
		fillFieldBtn.type = 'button';
		fillFieldBtn.className = 'compact fill-field-btn';
		const fillLabel = document.createElement('span');
		fillLabel.textContent = 'Fill';
		const fillArrow = document.createElement('span');
		fillArrow.className = 'fill-field-btn__arrow';
		fillArrow.setAttribute('aria-hidden', 'true');
		fillArrow.textContent = '→';
		fillFieldBtn.append(fillLabel, fillArrow);
		fillFieldBtn.disabled = fillDisabled || !this.callbacks.onFillField;
		fillFieldBtn.title = 'Copy profile (left) onto the directory form (right)';
		fillFieldBtn.addEventListener('click', () => {
			this.callbacks.onFillField?.(stepId, row.fieldKey);
		});
		profileActions.append(fillFieldBtn);

		profileCol.append(profileCell, profileActions);

		const formCol = document.createElement('div');
		formCol.className = 'compare-col compare-col--form';

		const formActions = document.createElement('div');
		formActions.className = 'compare-col-actions';

		const updateBtn = document.createElement('button');
		updateBtn.type = 'button';
		updateBtn.className = 'compact secondary';
		updateBtn.textContent = 'Update';
		updateBtn.disabled = !canEditOnPage;
		updateBtn.title = 'Write the On page value into the directory form';
		updateBtn.addEventListener('click', () => {
			const input = formCell.querySelector('textarea.cell-input') as HTMLTextAreaElement | null;
			if (!input || !canEditOnPage) return;
			this.callbacks.onApplyFormValue?.(stepId, row.fieldKey, input.value, {
				richAsHtml: richView === 'html',
			});
		});
		formActions.append(updateBtn);

		formCol.append(formCell, formActions);

		grid.append(profileCol, formCol);
		wrap.append(rowLabel, grid);

		if (row.hasSourcePicker && this.expandedFieldKeys.has(row.fieldKey)) {
			this.appendCompareFieldExpandRows(wrap, row);
		}

		return wrap;
	}

	private getRichViewMode(fieldKey: string): 'text' | 'html' {
		return this.richHtmlViewByField.get(fieldKey) ?? 'text';
	}

	private buildRichViewToggle(fieldKey: string): HTMLElement {
		const wrap = document.createElement('span');
		wrap.className = 'rich-view-toggle';
		const active = this.getRichViewMode(fieldKey);
		for (const mode of ['text', 'html'] as const) {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'toggle-chip';
			if (mode === active) btn.classList.add('toggle-chip--active');
			btn.textContent = mode === 'text' ? 'Text' : 'HTML';
			btn.addEventListener('click', (event) => {
				event.stopPropagation();
				this.richHtmlViewByField.set(fieldKey, mode);
				if (this.lastViewState) this.render(this.lastViewState);
			});
			wrap.append(btn);
		}
		return wrap;
	}

	private appendCompareFieldExpandRows(wrap: HTMLElement, row: StepRailCompareFieldRow): void {
		if (row.profileSourcePaths.length > 0) {
			wrap.appendChild(this.buildSourcePicker(row));
		}
		if (row.profileSelectPresets && row.profileSelectPresets.length > 0) {
			wrap.appendChild(this.buildProfileSelectPresets(row));
		}
	}

	private buildProfileSelectPresets(row: StepRailCompareFieldRow): HTMLElement {
		const picker = document.createElement('div');
		picker.className = 'source-picker';

		const hint = document.createElement('p');
		hint.className = 'source-picker-hint';
		hint.textContent = 'Official categories for this directory:';
		picker.append(hint);

		const chips = document.createElement('div');
		chips.className = 'chips';

		const active = row.selectedProfileSelectPreset ?? row.profileNorm.scalar ?? '';
		for (const option of row.profileSelectPresets ?? []) {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'chip';
			if (option === active) {
				btn.classList.add('chip--active');
			}
			btn.textContent = option;
			btn.addEventListener('click', () => {
				this.callbacks.onSelectProfilePreset?.(row.fieldKey, option);
			});
			chips.append(btn);
		}
		picker.append(chips);
		return picker;
	}

	private buildSourcePicker(row: StepRailCompareFieldRow): HTMLElement {
		const picker = document.createElement('div');
		picker.className = 'source-picker';

		const hint = document.createElement('p');
		hint.className = 'source-picker-hint';
		hint.textContent = 'Pick profile lists to use when filling this field:';
		picker.append(hint);

		const selected = new Set(row.selectedSourcePaths);
		for (const path of row.profileSourcePaths) {
			const label = document.createElement('label');
			label.className = 'source-option';
			const input = document.createElement('input');
			input.type = 'checkbox';
			input.checked = selected.has(path);
			input.addEventListener('change', () => {
				this.callbacks.onToggleSourcePath?.(row.fieldKey, path, input.checked);
			});
			const text = document.createElement('span');
			text.textContent = profileSourcePathLabel(path);
			label.append(input, text);
			picker.append(label);
		}

		return picker;
	}

	private enableDrag(panel: HTMLElement): void {
		const header = () => panel.querySelector('.header') as HTMLElement | null;
		let dragging = false;
		let startX = 0;
		let startY = 0;
		let originTop = 0;
		let originLeft = 0;

		const onMove = (event: PointerEvent) => {
			if (!dragging) return;
			const top = originTop + (event.clientY - startY);
			const left = originLeft + (event.clientX - startX);
			panel.style.top = `${Math.max(8, top)}px`;
			panel.style.left = `${Math.max(8, left)}px`;
		};

		const onUp = () => {
			if (!dragging) return;
			dragging = false;
			const top = parseInt(panel.style.top, 10) || 96;
			const left = parseInt(panel.style.left, 10) || 16;
			savePosition({ top, left });
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
		};

		panel.addEventListener('pointerdown', (event) => {
			const target = event.target as HTMLElement;
			if (!header()?.contains(target) || target.closest('button, textarea, input, select')) return;
			dragging = true;
			startX = event.clientX;
			startY = event.clientY;
			originTop = parseInt(panel.style.top, 10) || 96;
			originLeft = parseInt(panel.style.left, 10) || 16;
			window.addEventListener('pointermove', onMove);
			window.addEventListener('pointerup', onUp);
		});
	}
}

type FormCellEditContext = {
	stepId: string;
	fieldKey: string;
	onApply: (value: string) => void;
	onAfterCommit?: () => void;
};

function richCellContent(
	row: StepRailCompareFieldRow,
	side: 'profile' | 'form',
	view: 'text' | 'html'
): string {
	const norm = side === 'profile' ? row.profileNorm : row.formNorm;
	if (!norm.scalar) {
		const display = side === 'profile' ? row.profileDisplay : row.formDisplay;
		return display === '—' || display === 'Not in profile' ? '' : display;
	}
	if (view === 'html') return sanitizeRichHtmlBeforeCompare(norm.scalar);
	return richHtmlToPlainText(norm.scalar);
}

/** Match On page rich textarea height to the Profile column pre block. */
export function syncRichCompareHeights(root: ParentNode): void {
	for (const row of root.querySelectorAll<HTMLElement>('.compare-row')) {
		const profileRich =
			row.querySelector<HTMLElement>('.compare-col--profile .cell-rich-content') ??
			row.querySelector<HTMLElement>('.compare-col--profile .cell');
		const textarea = row.querySelector<HTMLTextAreaElement>(
			'.compare-col--form .cell-input--rich, .compare-col--form textarea.cell-input'
		);
		if (!profileRich || !textarea) continue;
		const height = Math.min(Math.max(profileRich.offsetHeight, 120), 320);
		textarea.style.height = `${height}px`;
		textarea.style.minHeight = `${height}px`;
	}
}

function formCellEditableText(row: StepRailCompareFieldRow, richView: 'text' | 'html'): string {
	if (!row.controlOnPage) return row.formDisplay;
	if (row.formNorm.kind === 'tags') {
		const items = row.formNorm.items ?? [];
		if (items.length > 0) return items.join(', ');
	}
	if (row.formNorm.kind === 'rich_html') {
		return richCellContent(row, 'form', richView);
	}
	const raw = row.formDisplay.trim();
	if (!raw || raw === '—') return '';
	return raw;
}

function populateCompareCell(
	cell: HTMLElement,
	row: StepRailCompareFieldRow,
	side: 'profile' | 'form',
	formEdit: FormCellEditContext | undefined,
	richView: 'text' | 'html',
	fieldFillMode?: LaunchStepFieldFillMode
): void {
	const norm = side === 'profile' ? row.profileNorm : row.formNorm;
	const display = side === 'profile' ? row.profileDisplay : row.formDisplay;

	if (side === 'profile' && !row.profileNorm.present) {
		cell.textContent = row.profileDisplay;
		return;
	}

	if (side === 'form' && !row.controlOnPage) {
		cell.textContent = row.formDisplay;
		return;
	}

	if (norm.kind === 'tags' || norm.kind === 'checkbox_group') {
		const rawItems =
			norm.items && norm.items.length > 0
				? norm.items
				: side === 'form'
					? row.formDisplay
							.split(',')
							.map((tag) => tag.trim())
							.filter(Boolean)
					: [];
		const items =
			norm.kind === 'tags' ? coerceTagDisplayItems(rawItems) : rawItems;
		if (items.length === 0) {
			cell.textContent = row.controlOnPage && side === 'form' ? '—' : display;
			return;
		}
		const chips = document.createElement('div');
		chips.className = 'chips';
		const invalidSet = new Set(
			side === 'profile' ? (row.invalidProfileTags ?? []).map((t) => t.toLowerCase()) : []
		);
		for (const item of items) {
			const chip = document.createElement('span');
			chip.className = 'chip';
			if (invalidSet.has(item.toLowerCase())) {
				chip.classList.add('chip--invalid');
			}
			chip.textContent = item;
			chips.appendChild(chip);
		}
		cell.append(chips);
		return;
	}

	if (norm.kind === 'rich_html' && !(side === 'form' && formEdit)) {
		cell.classList.add('cell--rich');
		const pre = document.createElement('pre');
		pre.className = 'cell-rich-content';
		pre.textContent = richCellContent(row, side, richView);
		cell.append(pre);
		return;
	}

	if (side === 'form' && formEdit) {
		cell.classList.add('cell--form-editable');
		const input = document.createElement('textarea');
		input.className = 'cell-input';
		const editableText = formCellEditableText(row, richView);
		const useRichTextarea =
			norm.kind === 'rich_html' ||
			fieldFillMode === 'rich_html' ||
			editableText.length > 160;
		if (useRichTextarea) {
			cell.classList.add('cell--rich-editable');
			input.classList.add('cell-input--rich');
			const lineEstimate = Math.max(10, editableText.split('\n').length + 2);
			input.rows = Math.min(lineEstimate, 40);
		} else {
			input.rows = display.length > 80 ? 3 : 1;
		}
		input.value = formCellEditableText(row, richView);
		input.placeholder = 'Edit value, then Update';
		input.title = 'Edit the value, then click Update to write it into the directory form';
		const commit = () => {
			formEdit.onApply(input.value);
			formEdit.onAfterCommit?.();
		};
		input.addEventListener('blur', commit);
		input.addEventListener('mousedown', (event) => event.stopPropagation());
		input.addEventListener('pointerdown', (event) => event.stopPropagation());
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				input.blur();
			}
		});
		cell.append(input);
		return;
	}

	cell.textContent = display;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function pageMatchesConfig(config: AutoLaunchExtensionConfig): boolean {
	const patterns = config.startUrlPatterns ?? [];
	if (patterns.length === 0) return true;
	const href = window.location.href;
	return patterns.some((pattern) => {
		try {
			const re = wildcardToRegExp(pattern);
			return re.test(href);
		} catch {
			return href.includes(pattern.replace(/\*/g, ''));
		}
	});
}

export function buildStatusLine(config: AutoLaunchExtensionConfig, onReadyPage: boolean): string {
	if (!onReadyPage && config.readyUrlHint) {
		return `Open your product edit or submission page (the URL should include “${config.readyUrlHint}”). Then use Fill all steps or Fill each field below.`;
	}
	if (!onReadyPage) {
		return 'Open the directory listing or submission form in this tab. When the fields are visible, use Fill all steps or Fill on each field row below.';
	}
	return 'You’re on the right page. Use Fill all steps or Fill on each field row—then review every field before you submit on this site.';
}

function wildcardToRegExp(pattern: string): RegExp {
	const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
	return new RegExp(`^${escaped}$`, 'i');
}

export function isReadyPage(config: AutoLaunchExtensionConfig): boolean {
	const hint = config.readyUrlHint?.toLowerCase();
	if (!hint) return pageMatchesConfig(config);
	const href = window.location.href.toLowerCase();
	if (hint === 'submit') {
		try {
			const path = new URL(window.location.href).pathname.replace(/\/+$/, '') || '/';
			if (path !== '/submit' && href.includes('submit')) {
				return true;
			}
		} catch {
			/* ignore */
		}
	}
	return href.includes(hint);
}
