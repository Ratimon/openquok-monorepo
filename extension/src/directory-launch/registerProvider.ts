import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	getDirectoryLaunchProvider,
	type AutoLaunchHandoffSession,
	type FieldFillResult,
} from 'openquok-common';

import { countFilled, fillLaunchStep } from './fillEngine.js';
import {
	buildStatusLine,
	DirectoryLaunchStepRail,
	isReadyPage,
	pageMatchesConfig,
} from './stepRail.js';

type ContentCommandMessage = {
	type: string;
	session?: AutoLaunchHandoffSession;
	stepId?: string;
};

export function registerDirectoryLaunchProvider(providerSlug: string): void {
	const providerMeta = getDirectoryLaunchProvider(providerSlug);
	if (!providerMeta) {
		console.warn(`[OpenQuok] Unknown directory launch provider "${providerSlug}".`);
		return;
	}
	const provider = providerMeta;

	let activeSession: AutoLaunchHandoffSession | null = null;
	const fieldResultsByStep: Record<string, FieldFillResult[]> = {};

	const rail = new DirectoryLaunchStepRail({
		onFillStep: (stepId) => void runFillStep(stepId),
		onFillAll: () => void runFillAll(),
		onResetPosition: () => {
			/* position persisted in stepRail */
		},
	});

	function renderRail(): void {
		if (!activeSession) return;
		const config = activeSession.extensionConfig;
		const steps = config.steps ?? [];
		rail.render({
			providerName: provider.name,
			productName: activeSession.profileSnapshot.name || 'Product profile',
			statusLine: buildStatusLine(config, isReadyPage(config)),
			steps,
			fieldResultsByStep,
			readyUrlHint: config.readyUrlHint,
		});
	}

	function sendProgress(
		stepId: string,
		stepLabel: string,
		stepIndex: number,
		stepCount: number,
		results: FieldFillResult[]
	): void {
		const { filled, total } = countFilled(results);
		void chrome.runtime
			.sendMessage({
				type: AUTO_LAUNCH_MESSAGE_TYPE.PROGRESS,
				providerSlug,
				stepId,
				stepLabel,
				stepIndex,
				stepCount,
				filledCount: filled,
				totalFields: total,
				fieldResults: results,
			})
			.catch(() => {
				/* background may be unavailable */
			});
	}

	async function runFillStep(stepId: string): Promise<{ ok: boolean; error?: string }> {
		if (!activeSession) {
			return { ok: false, error: 'No launch session for this tab.' };
		}
		const steps = activeSession.extensionConfig.steps ?? [];
		const step = steps.find((s) => s.id === stepId);
		if (!step) {
			return { ok: false, error: `Unknown step "${stepId}".` };
		}
		const results = fillLaunchStep(activeSession.profileSnapshot, step);
		fieldResultsByStep[stepId] = results;
		const index = steps.findIndex((s) => s.id === stepId);
		sendProgress(stepId, step.label, index, steps.length, results);
		renderRail();
		return { ok: true };
	}

	async function runFillAll(): Promise<{ ok: boolean; error?: string }> {
		if (!activeSession) {
			return { ok: false, error: 'No launch session for this tab.' };
		}
		const steps = activeSession.extensionConfig.steps ?? [];
		for (let i = 0; i < steps.length; i++) {
			const step = steps[i];
			const results = fillLaunchStep(activeSession.profileSnapshot, step);
			fieldResultsByStep[step.id] = results;
			sendProgress(step.id, step.label, i, steps.length, results);
		}
		renderRail();
		return { ok: true };
	}

	function activateSession(session: AutoLaunchHandoffSession): void {
		if (session.providerSlug !== providerSlug) return;
		if (!pageMatchesConfig(session.extensionConfig)) return;
		activeSession = session;
		rail.mount();
		renderRail();
	}

	chrome.runtime.onMessage.addListener((message: ContentCommandMessage, _sender, sendResponse) => {
		if (!message || typeof message !== 'object') return;

		if (message.type === AUTO_LAUNCH_MESSAGE_TYPE.START && message.session) {
			activateSession(message.session);
			sendResponse({ ok: true });
			return true;
		}

		if (message.session && message.session.providerSlug !== providerSlug) {
			return;
		}

		if (message.session) {
			activeSession = message.session;
			rail.mount();
			renderRail();
		}

		if (message.type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_STEP && message.stepId) {
			void runFillStep(message.stepId).then(sendResponse);
			return true;
		}

		if (message.type === AUTO_LAUNCH_MESSAGE_TYPE.FILL_ALL) {
			void runFillAll().then(sendResponse);
			return true;
		}

		return undefined;
	});
}
