import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	getDirectoryLaunchProvider,
	getDirectoryLaunchSiteKeyFromLocation,
	type AutoLaunchFocusedFillMode,
	type AutoLaunchHandoffSession,
	type AutoLaunchExtensionConfig,
	type AutoLaunchProfileSnapshot,
	type FieldFillResult,
	type LaunchStep,
	type LaunchStepField,
	type NormalizedFieldValue,
} from 'openquok-common';

import {
	isExtensionRuntimeAvailable,
	sendRuntimeMessage,
} from '../../shared/extensionRuntime.js';
import {
	buildFillGateMessage,
	DIRECTORY_GATE_CHANGE_EVENT,
	isDirectoryFillAllowed,
	readGateStateFromEvent,
	resolveDirectoryGateState,
	type DirectoryGateState,
} from './directoryGate.js';
import {
	OPENQUOK_AUTO_LAUNCH_DISMISS_PANEL,
	OPENQUOK_AUTO_LAUNCH_PROFILE_SOURCES,
	OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION,
	OPENQUOK_AUTO_LAUNCH_SHOW_IDLE_PANEL,
	OPENQUOK_AUTO_LAUNCH_PEEK_PROFILE_SNAPSHOT,
	OPENQUOK_AUTO_LAUNCH_SWITCH_PROFILE_SOURCE,
} from '../auto-launch/constants.js';
import type { DirectoryProfileSourceOption } from '../auto-launch/profileSourceOptions.js';
import { executeFillFocused } from './fillFocused.js';
import {
	applyUserValueToFormField,
	countFilled,
	fillableTagListForField,
	fillLaunchField,
} from './fillEngine.js';
import { wireLaunchFormWatchers } from './formFieldWatchers.js';
import {
	buildCompareRowsForSteps,
	collectItemsFromProfilePaths,
	defaultTagProfilePathsForField,
	normalizedFromFillOverride,
	resolveEffectiveProfileNorm,
} from './launchCompareState.js';
import { mergeExtensionConfigWithShippedFixture } from './shippedExtensionConfig.js';
import { resolveProfileValue } from './profileValues.js';
import {
	buildStatusLine,
	DirectoryLaunchStepRail,
	type StepRailFillProgress,
	isReadyPage,
	isStepRailOnPageEditActive,
	pageMatchesConfig,
} from './stepRail.js';

const AUTO_LAUNCH_ATTACH_TAB = 'OPENQUOK_AUTO_LAUNCH_ATTACH_TAB';
const COMPARE_RENDER_DEBOUNCE_MS = 200;
/** Staggered re-reads while SPA directory forms hydrate (value props appear after first paint). */
const COMPARE_DOM_SYNC_DELAYS_MS = [0, 50, 150, 400, 800, 1500] as const;

type ContentCommandMessage = {
	type: string;
	session?: AutoLaunchHandoffSession;
	stepId?: string;
	providerSlug?: string;
	dashboardOrigin?: string;
	values?: string[];
	fillMode?: AutoLaunchFocusedFillMode;
	profilePath?: string;
};

export function registerDirectoryLaunchProvider(providerSlug: string): void {
	const providerMeta = getDirectoryLaunchProvider(providerSlug);
	if (!providerMeta) {
		console.warn(`[OpenQuok] Unknown directory launch provider "${providerSlug}".`);
		return;
	}
	const provider = providerMeta;

	let activeSession: AutoLaunchHandoffSession | null = null;
	let activeDashboardOrigin: string | null = null;
	const fieldResultsByStep: Record<string, FieldFillResult[]> = {};
	const fillBaselinesByField = new Map<string, NormalizedFieldValue>();
	const selectedSourcePathsByField = new Map<string, string[]>();
	const profileSelectPresetByField = new Map<string, string>();
	const directorySiteKey = getDirectoryLaunchSiteKeyFromLocation(window.location.hostname);
	let gateState: DirectoryGateState | null = null;
	let teardownFormWatchers: (() => void) | null = null;
	let compareRenderTimer: ReturnType<typeof setTimeout> | null = null;
	let compareDomSyncGeneration = 0;
	let profileSourceOptions: DirectoryProfileSourceOption[] = [];
	let activeProfileSourceId: string | undefined;
	let mainProfileSnapshotForCompare: AutoLaunchProfileSnapshot | null = null;
	let fillProgress: StepRailFillProgress | null = null;

	function setFillProgress(next: StepRailFillProgress | null): void {
		fillProgress = next;
		renderRail();
	}

	async function fillStepFieldsWithProgress(
		step: LaunchStep,
		ctx: { stepIndex: number; stepCount: number; kind: StepRailFillProgress['kind'] }
	): Promise<FieldFillResult[]> {
		if (!activeSession) return [];
		const fields = step.fields ?? [];
		const results: FieldFillResult[] = [];
		for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
			const field = fields[fieldIndex];
			setFillProgress({
				kind: ctx.kind,
				stepLabel: step.label,
				stepIndex: ctx.stepIndex,
				stepCount: ctx.stepCount,
				fieldLabel: field.label,
				fieldIndex,
				fieldCount: fields.length,
			});
			results.push(
				await fillLaunchField(
					activeSession.profileSnapshot,
					field,
					fillContext(),
					fillOptionsForField(field)
				)
			);
		}
		return results;
	}

	function fillGateBlocked(): { blocked: boolean; error?: string } {
		if (!directorySiteKey || isDirectoryFillAllowed(gateState)) {
			return { blocked: false };
		}
		return {
			blocked: true,
			error: gateState ? buildFillGateMessage(gateState) : 'Sign in to use autofill.',
		};
	}

	function wireDirectoryGate(): void {
		if (!directorySiteKey) return;

		const onGateChange = (event: Event) => {
			const next = readGateStateFromEvent(event);
			if (!next || next.siteKey !== directorySiteKey) return;
			const becameFillReady = !isDirectoryFillAllowed(gateState) && isDirectoryFillAllowed(next);
			gateState = next;
			renderRail();
			if (becameFillReady && activeSession) {
				scheduleInitialCompareDomSync();
			}
		};
		window.addEventListener(DIRECTORY_GATE_CHANGE_EVENT, onGateChange);

		void resolveDirectoryGateState(directorySiteKey).then((state) => {
			gateState = state;
			renderRail();
		});
	}

	const rail = new DirectoryLaunchStepRail({
		onFillStep: (stepId) => void runFillStep(stepId),
		onFillAll: () => void runFillAll(),
		onResetPosition: () => {
			/* position persisted in stepRail */
		},
		onFillField: (stepId, fieldKey) => void runFillField(stepId, fieldKey),
		onToggleSourcePath: (fieldKey, profilePath, selected) => {
			toggleSourcePathSelection(fieldKey, profilePath, selected);
		},
		onSelectProfilePreset: (fieldKey, value) => {
			profileSelectPresetByField.set(fieldKey, value);
			scheduleCompareRender();
		},
		onApplyFormValue: (stepId, fieldKey, value, opts) => {
			void applyFormFieldUserEdit(stepId, fieldKey, value, opts);
		},
		onPanelRevealed: () => scheduleInitialCompareDomSync(),
		onProfileSourceChange: (profileId) => void switchProfileSource(profileId),
	});

	async function loadProfileSourceOptions(): Promise<void> {
		if (!isExtensionRuntimeAvailable() || !activeSession) {
			profileSourceOptions = [];
			activeProfileSourceId = activeSession?.productProfileId;
			return;
		}
		try {
			const response = (await sendRuntimeMessage({
				type: OPENQUOK_AUTO_LAUNCH_PROFILE_SOURCES,
			})) as {
				ok?: boolean;
				options?: DirectoryProfileSourceOption[];
				activeId?: string;
				error?: string;
			};
			if (response?.ok === false) {
				profileSourceOptions = [];
				return;
			}
			profileSourceOptions = Array.isArray(response?.options) ? response.options : [];
			void loadMainProfileSnapshotForCompare();
			activeProfileSourceId =
				typeof response?.activeId === 'string'
					? response.activeId
					: activeSession.productProfileId;
		} catch {
			profileSourceOptions = [];
		}
	}

	async function loadMainProfileSnapshotForCompare(): Promise<void> {
		if (!isExtensionRuntimeAvailable()) return;
		const mainOption = profileSourceOptions.find((entry) => entry.kind === 'main');
		if (!mainOption || mainOption.id === activeProfileSourceId) {
			mainProfileSnapshotForCompare = null;
			return;
		}
		try {
			const response = (await sendRuntimeMessage({
				type: OPENQUOK_AUTO_LAUNCH_PEEK_PROFILE_SNAPSHOT,
				productProfileId: mainOption.id,
			})) as { ok?: boolean; profileSnapshot?: AutoLaunchProfileSnapshot };
			if (response?.ok && response.profileSnapshot) {
				mainProfileSnapshotForCompare = response.profileSnapshot;
				scheduleCompareRender();
			}
		} catch {
			mainProfileSnapshotForCompare = null;
		}
	}

	async function switchProfileSource(profileId: string): Promise<void> {
		if (!profileId || !isExtensionRuntimeAvailable()) return;
		try {
			const response = (await sendRuntimeMessage({
				type: OPENQUOK_AUTO_LAUNCH_SWITCH_PROFILE_SOURCE,
				productProfileId: profileId,
			})) as { ok?: boolean; error?: string };
			if (response?.ok === false) {
				console.warn('[OpenQuok] Profile source switch failed:', response.error);
			}
		} catch (error) {
			console.warn('[OpenQuok] Profile source switch failed:', error);
		}
	}

	function resetCompareSessionState(): void {
		compareDomSyncGeneration += 1;
		fillBaselinesByField.clear();
		selectedSourcePathsByField.clear();
		teardownFormWatchers?.();
		teardownFormWatchers = null;
		if (compareRenderTimer !== null) {
			clearTimeout(compareRenderTimer);
			compareRenderTimer = null;
		}
	}

	function scheduleInitialCompareDomSync(): void {
		if (!activeSession) return;
		compareDomSyncGeneration += 1;
		const generation = compareDomSyncGeneration;
		const lastDelay = COMPARE_DOM_SYNC_DELAYS_MS[COMPARE_DOM_SYNC_DELAYS_MS.length - 1];
		for (const delay of COMPARE_DOM_SYNC_DELAYS_MS) {
			window.setTimeout(() => {
				if (generation !== compareDomSyncGeneration || !activeSession) return;
				if (delay === lastDelay) {
					wireFormWatchersForSession(activeSession.extensionConfig);
				}
				renderRail();
			}, delay);
		}
	}

	function scheduleCompareRender(): void {
		if (compareRenderTimer !== null) {
			clearTimeout(compareRenderTimer);
		}
		compareRenderTimer = setTimeout(() => {
			compareRenderTimer = null;
			renderRail();
		}, COMPARE_RENDER_DEBOUNCE_MS);
	}

	function wireFormWatchersForSession(config: AutoLaunchExtensionConfig): void {
		teardownFormWatchers?.();
		teardownFormWatchers = wireLaunchFormWatchers(config, () => scheduleCompareRender());
	}

	function toggleSourcePathSelection(fieldKey: string, profilePath: string, selected: boolean): void {
		const path = profilePath.trim();
		if (!path) return;
		const current = selectedSourcePathsByField.get(fieldKey) ?? [];
		const next = selected
			? [...new Set([...current, path])]
			: current.filter((entry) => entry !== path);
		if (next.length === 0) {
			selectedSourcePathsByField.delete(fieldKey);
		} else {
			selectedSourcePathsByField.set(fieldKey, next);
		}
		renderRail();
	}

	async function applyFormFieldUserEdit(
		stepId: string,
		fieldKey: string,
		value: string,
		opts?: { richAsHtml?: boolean }
	): Promise<void> {
		const field = findLaunchField(stepId, fieldKey);
		if (!field) return;
		const applied = await applyUserValueToFormField(field, value, opts);
		if (applied) {
			scheduleCompareRender();
		}
	}

	function findLaunchField(stepId: string, fieldKey: string): LaunchStepField | null {
		if (!activeSession) return null;
		const step = activeSession.extensionConfig.steps?.find((entry) => entry.id === stepId);
		return step?.fields?.find((field) => field.key === fieldKey) ?? null;
	}

	function fillOptionsForField(field: LaunchStepField): {
		valuesOverride?: string[];
		valueOverride?: string;
	} | undefined {
		if (!activeSession) return undefined;
		const selectedPaths = selectedSourcePathsByField.get(field.key);
		const preset = profileSelectPresetByField.get(field.key);
		if (preset?.trim()) {
			return { valueOverride: preset };
		}
		const paths =
			(selectedPaths?.length ?? 0) > 0
				? selectedPaths!
				: field.fillMode === 'tags' && field.profileSourcePaths?.length
					? defaultTagProfilePathsForField(field)
					: undefined;
		if (!paths?.length) return undefined;
		const items = collectItemsFromProfilePaths(
			activeSession.profileSnapshot,
			paths,
			field.maxItems,
			field
		);
		if (items.length === 0) return undefined;
		if (field.fillMode === 'tags') {
			return { valuesOverride: items };
		}
		if (field.fillMode === 'checkbox_group') {
			return { valueOverride: items.join(', ') };
		}
		return undefined;
	}

	function recordFillBaseline(field: LaunchStepField, options?: {
		valuesOverride?: string[];
		valueOverride?: string;
	}): void {
		if (!activeSession) return;
		let norm: NormalizedFieldValue;
		if (options?.valuesOverride?.length) {
			norm = normalizedFromFillOverride(field, options.valuesOverride);
		} else if (options?.valueOverride !== undefined) {
			norm = normalizedFromFillOverride(field, [options.valueOverride]);
		} else {
			norm = resolveEffectiveProfileNorm(
				activeSession.profileSnapshot,
				field,
				selectedSourcePathsByField.get(field.key) ?? [],
				profileSelectPresetByField.get(field.key),
				mainProfileSnapshotForCompare
			);
		}
		if (norm.present) {
			fillBaselinesByField.set(field.key, norm);
		}
	}

	function recordFillBaselinesFromResults(
		stepFields: LaunchStepField[],
		results: FieldFillResult[]
	): void {
		for (const result of results) {
			if (result.status !== 'found' && result.status !== 'skipped') continue;
			const field = stepFields.find((entry) => entry.key === result.key);
			if (!field) continue;
			recordFillBaseline(field, fillOptionsForField(field));
		}
	}

	function renderRail(): void {
		if (!activeSession) return;
		if (isStepRailOnPageEditActive()) return;
		const config = activeSession.extensionConfig;
		const steps = config.steps ?? [];
		const gate = fillGateBlocked();
		const compareRowsByStep = buildCompareRowsForSteps(activeSession.profileSnapshot, steps, {
			fillBaselinesByField,
			selectedSourcePathsByField,
			profileSelectPresetByField,
			mainProfileSnapshot: mainProfileSnapshotForCompare,
		});
		rail.render({
			providerName: provider.name,
			productName: activeSession.profileSnapshot.name || 'Product profile',
			statusLine: buildStatusLine(config, isReadyPage(config)),
			steps,
			fieldResultsByStep,
			compareRowsByStep,
			profileSnapshot: activeSession.profileSnapshot,
			fillBaselinesByField,
			selectedSourcePathsByField,
			readyUrlHint: config.readyUrlHint,
			fillDisabled: gate.blocked || fillProgress !== null,
			fillGateMessage: gate.error,
			profileSourceOptions,
			activeProfileSourceId,
			fillProgress,
		});
	}

	function showIdleLaunchPanel(): void {
		rail.mount();
		rail.render({
			providerName: provider.name,
			productName: '—',
			statusLine:
				'Start a directory launch from OpenQuok (My Products → Fill with extension). This panel lists each section with Fill once a launch is active.',
			steps: [],
			fieldResultsByStep: {},
			fillDisabled: true,
			fillGateMessage:
				'No active launch yet. Fill buttons appear after you use Fill with extension on My Products.',
		});
		rail.revealPanel();
	}

	function sendProgress(
		stepId: string,
		stepLabel: string,
		stepIndex: number,
		stepCount: number,
		results: FieldFillResult[]
	): void {
		const { filled, total } = countFilled(results);
		void sendRuntimeMessage({
			type: AUTO_LAUNCH_MESSAGE_TYPE.PROGRESS,
			providerSlug,
			stepId,
			stepLabel,
			stepIndex,
			stepCount,
			filledCount: filled,
			totalFields: total,
			fieldResults: results,
		});
	}

	async function runFillStep(stepId: string): Promise<{ ok: boolean; error?: string }> {
		const gate = fillGateBlocked();
		if (gate.blocked) {
			return { ok: false, error: gate.error };
		}
		if (!activeSession) {
			return { ok: false, error: 'No launch session for this tab.' };
		}
		const steps = activeSession.extensionConfig.steps ?? [];
		const step = steps.find((s) => s.id === stepId);
		if (!step) {
			return { ok: false, error: `Unknown step "${stepId}".` };
		}
		const index = steps.findIndex((s) => s.id === stepId);
		try {
			const results = await fillStepFieldsWithProgress(step, {
				stepIndex: index,
				stepCount: steps.length,
				kind: 'step',
			});
			fieldResultsByStep[stepId] = results;
			recordFillBaselinesFromResults(step.fields ?? [], results);
			sendProgress(stepId, step.label, index, steps.length, results);
			return { ok: true };
		} finally {
			setFillProgress(null);
		}
	}

	async function runFillField(
		stepId: string,
		fieldKey: string
	): Promise<{ ok: boolean; error?: string }> {
		const gate = fillGateBlocked();
		if (gate.blocked) {
			return { ok: false, error: gate.error };
		}
		if (!activeSession) {
			return { ok: false, error: 'No launch session for this tab.' };
		}
		const field = findLaunchField(stepId, fieldKey);
		if (!field) {
			return { ok: false, error: `Unknown field "${fieldKey}".` };
		}
		const fillOptions = fillOptionsForField(field);
		try {
			setFillProgress({
				kind: 'field',
				fieldLabel: field.label,
				fieldIndex: 0,
				fieldCount: 1,
			});
			const result = await fillLaunchField(
				activeSession.profileSnapshot,
				field,
				fillContext(),
				fillOptions
			);
			const prior = fieldResultsByStep[stepId] ?? [];
			fieldResultsByStep[stepId] = [
				...prior.filter((entry) => entry.key !== fieldKey),
				result,
			];
			if (result.status === 'found') {
				const baselineOptions =
					field.fillMode === 'tags'
						? {
								valuesOverride: fillableTagListForField(
									activeSession.profileSnapshot,
									field,
									fillOptions
								),
							}
						: fillOptions;
				recordFillBaseline(field, baselineOptions);
				scheduleCompareDomSync();
			}
			return { ok: result.status === 'found' || result.status === 'skipped' };
		} finally {
			setFillProgress(null);
		}
	}

	async function runFillFocused(message: ContentCommandMessage): Promise<{ ok: boolean; error?: string }> {
		const gate = fillGateBlocked();
		if (gate.blocked) {
			return { ok: false, error: gate.error };
		}
		if (!activeSession) {
			return { ok: false, error: 'No launch session for this tab.' };
		}
		if (typeof message.fillMode !== 'string') {
			return { ok: false, error: 'Missing fill mode for focused fill.' };
		}
		const profilePath = typeof message.profilePath === 'string' ? message.profilePath.trim() : '';
		let values = Array.isArray(message.values)
			? message.values.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
			: [];
		if (profilePath) {
			const resolved = resolveProfileValue(activeSession.profileSnapshot, profilePath);
			if (resolved) {
				values = [resolved];
			}
		}
		if (values.length === 0) {
			return { ok: false, error: 'No values selected to fill.' };
		}
		return await executeFillFocused({
			values,
			fillMode: message.fillMode,
			...(profilePath ? { profilePath } : {}),
		});
	}

	async function runFillAll(): Promise<{ ok: boolean; error?: string }> {
		const gate = fillGateBlocked();
		if (gate.blocked) {
			return { ok: false, error: gate.error };
		}
		if (!activeSession) {
			return { ok: false, error: 'No launch session for this tab.' };
		}
		const steps = activeSession.extensionConfig.steps ?? [];
		try {
			for (let i = 0; i < steps.length; i++) {
				const step = steps[i];
				const results = await fillStepFieldsWithProgress(step, {
					stepIndex: i,
					stepCount: steps.length,
					kind: 'all',
				});
				fieldResultsByStep[step.id] = results;
				recordFillBaselinesFromResults(step.fields ?? [], results);
				sendProgress(step.id, step.label, i, steps.length, results);
			}
			return { ok: true };
		} finally {
			setFillProgress(null);
		}
	}

	function fillContext() {
		const dashboardOrigin = activeDashboardOrigin?.trim();
		if (!dashboardOrigin && !mainProfileSnapshotForCompare) return undefined;
		return {
			...(dashboardOrigin ? { dashboardOrigin } : {}),
			mainProfileSnapshot: mainProfileSnapshotForCompare,
		};
	}

	function rememberDashboardOrigin(origin?: string): void {
		if (typeof origin === 'string' && origin.trim()) {
			activeDashboardOrigin = origin.trim();
		}
	}

	function withShippedExtensionConfig(session: AutoLaunchHandoffSession): AutoLaunchHandoffSession {
		const extensionConfig = mergeExtensionConfigWithShippedFixture(
			session.providerSlug,
			session.extensionConfig
		);
		if (extensionConfig === session.extensionConfig) return session;
		return { ...session, extensionConfig };
	}

	function activateSession(session: AutoLaunchHandoffSession): void {
		if (session.providerSlug !== providerSlug) return;
		session = withShippedExtensionConfig(session);
		if (!pageMatchesConfig(session.extensionConfig)) return;
		resetCompareSessionState();
		activeSession = session;
		rail.mount();
		wireFormWatchersForSession(session.extensionConfig);
		activeProfileSourceId = session.productProfileId;
		renderRail();
		rail.revealPanel();
		void loadProfileSourceOptions().then(() => renderRail());
	}

	function requestAttachFromBackground(): void {
		if (!pageMatchesConfig({ startUrlPatterns: provider.hostPatterns })) return;
		if (!isExtensionRuntimeAvailable()) return;
		void sendRuntimeMessage({ type: AUTO_LAUNCH_ATTACH_TAB, providerSlug });
	}

	requestAttachFromBackground();
	wireDirectoryGate();

	if (!isExtensionRuntimeAvailable()) {
		return;
	}

	chrome.runtime.onMessage.addListener((message: ContentCommandMessage, _sender, sendResponse) => {
		if (!isExtensionRuntimeAvailable()) {
			return false;
		}
		if (!message || typeof message !== 'object') return false;

		const session = message.session;
		if (session && session.providerSlug !== providerSlug) {
			return false;
		}

		if (message.type === AUTO_LAUNCH_MESSAGE_TYPE.START && session) {
			rememberDashboardOrigin(message.dashboardOrigin);
			activateSession(withShippedExtensionConfig(session));
			sendResponse({ ok: true });
			return false;
		}

		if (message.type === OPENQUOK_AUTO_LAUNCH_SHOW_IDLE_PANEL) {
			if (typeof message.providerSlug === 'string' && message.providerSlug !== providerSlug) {
				return false;
			}
			showIdleLaunchPanel();
			sendResponse({ ok: true });
			return false;
		}

		if (message.type === OPENQUOK_AUTO_LAUNCH_DISMISS_PANEL) {
			activeSession = null;
			activeProfileSourceId = undefined;
			teardownFormWatchers?.();
			teardownFormWatchers = null;
			resetCompareSessionState();
			rail.hidePanel();
			sendResponse({ ok: true });
			return false;
		}

		if (message.type === OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION) {
			rail.resetPosition();
			sendResponse({ ok: true });
			return false;
		}

		rememberDashboardOrigin(message.dashboardOrigin);

		if (session) {
			const merged = withShippedExtensionConfig(session);
			const configChanged =
				activeSession?.extensionConfig !== merged.extensionConfig ||
				activeSession?.profileSnapshot !== merged.profileSnapshot;
			if (configChanged) {
				resetCompareSessionState();
			}
			activeSession = merged;
			activeProfileSourceId = session.productProfileId;
			if (pageMatchesConfig(session.extensionConfig)) {
				rail.mount();
				if (configChanged || !teardownFormWatchers) {
					wireFormWatchersForSession(session.extensionConfig);
				}
				renderRail();
				scheduleInitialCompareDomSync();
				void loadProfileSourceOptions().then(() => renderRail());
			}
		}

		if (message.type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_STEP && message.stepId) {
			void runFillStep(message.stepId)
				.then((result) => sendResponse(result))
				.catch((error: unknown) => {
					sendResponse({
						ok: false,
						error: error instanceof Error ? error.message : 'Fill step failed.',
					});
				});
			return true;
		}

		if (message.type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_ALL) {
			void runFillAll()
				.then((result) => sendResponse(result))
				.catch((error: unknown) => {
					sendResponse({
						ok: false,
						error: error instanceof Error ? error.message : 'Fill all failed.',
					});
				});
			return true;
		}

		if (message.type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_FOCUSED) {
			void runFillFocused(message)
				.then((result) => sendResponse(result))
				.catch((error: unknown) => {
					sendResponse({
						ok: false,
						error: error instanceof Error ? error.message : 'Focused fill failed.',
					});
				});
			return true;
		}

		return false;
	});
}
