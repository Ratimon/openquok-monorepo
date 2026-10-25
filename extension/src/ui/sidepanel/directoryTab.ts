import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	getDirectoryLaunchProvider,
	listDirectoryLaunchProviderSummaries,
} from 'openquok-common';

import { POPUP_UI_MESSAGE } from '../../directory/auto-launch/popupMessages.js';
import type { StoredAutoLaunchState } from '../../directory/auto-launch/sessionStorage.js';
import { isReadyPage, pageMatchesConfig } from '../../directory/directory-launch/stepRail.js';

import { el, escapeHtml, runtimeSendMessage } from './uiHelpers.js';

const directoryChannels = listDirectoryLaunchProviderSummaries();

let lastProgress: string | null = null;
let selectedChannelId =
	directoryChannels[0]?.identifier ?? 'peerpush-standard-launch';

function statusForState(state: StoredAutoLaunchState | null): string {
	if (!state) {
		return 'No active launch. Start from OpenQuok (Build backlinks or My Products).';
	}
	const config = state.session.extensionConfig;
	if (!pageMatchesConfig(config)) {
		return `Open ${state.session.startUrl} and continue on the directory site.`;
	}
	if (!isReadyPage(config)) {
		return config.readyUrlHint
			? `Navigate to a page that includes "${config.readyUrlHint}".`
			: 'Navigate to the submission page on this site.';
	}
	return 'Ready on this tab — use Fill all steps or the on-page panel.';
}

async function fetchState(): Promise<{
	state: StoredAutoLaunchState | null;
	backgroundUnreachable: boolean;
}> {
	try {
		const response = (await runtimeSendMessage({ type: 'OPENQUOK_AUTO_LAUNCH_GET_STATE' })) as {
			state?: StoredAutoLaunchState | null;
		};
		return { state: response?.state ?? null, backgroundUnreachable: false };
	} catch {
		return { state: null, backgroundUnreachable: true };
	}
}

async function sendRuntime(message: Record<string, unknown>): Promise<Record<string, unknown>> {
	try {
		const response = await runtimeSendMessage(message);
		return (response ?? {}) as Record<string, unknown>;
	} catch (error) {
		const messageText = error instanceof Error ? error.message : 'Could not reach extension background.';
		return { ok: false, error: messageText };
	}
}

function channelSelectHtml(activeSlug: string | null, locked: boolean): string {
	const options = directoryChannels
		.map((ch) => {
			const selected =
				(activeSlug ?? selectedChannelId) === ch.identifier ? ' selected' : '';
			return `<option value="${escapeHtml(ch.identifier)}"${selected}>${escapeHtml(ch.name)}</option>`;
		})
		.join('');
	return `
		<label class="field-label" for="channel-select">Directory channel</label>
		<select id="channel-select" class="channel-select" ${locked ? 'disabled' : ''}>${options}</select>
	`;
}

export type DirectoryTabController = {
	refresh: () => Promise<void>;
	destroy: () => void;
};

export function mountDirectoryTab(root: HTMLElement): DirectoryTabController {
	function render(state: StoredAutoLaunchState | null, error?: string): void {
		const hasSession = Boolean(state);
		const product = state?.session.profileSnapshot.name ?? '—';
		const sessionSlug = state?.session.providerSlug ?? null;
		if (sessionSlug) {
			selectedChannelId = sessionSlug;
		}

		root.replaceChildren(
			el(`
			<div class="wrap tab-wrap">
				<p class="muted tab-lead">Human submits on the directory site — OpenQuok never clicks Submit.</p>
				${channelSelectHtml(sessionSlug, hasSession)}
				<div class="card">
					<strong>${escapeHtml(product)}</strong>
					<p class="status">${escapeHtml(statusForState(state))}</p>
					${lastProgress ? `<p class="progress">${escapeHtml(lastProgress)}</p>` : ''}
					${hasSession ? `<p class="muted session-hint">Active launch: ${escapeHtml(sessionSlug ?? '')}</p>` : ''}
				</div>
				<div class="actions">
					<button id="fill-all" ${hasSession ? '' : 'disabled'}>Fill all on directory tab</button>
					<button id="focus-tab" class="secondary" ${hasSession ? '' : 'disabled'}>Focus directory tab</button>
					<button id="open-start" class="secondary">Open directory page</button>
					<button id="mark-done" class="secondary" ${hasSession ? '' : 'disabled'}>Mark submitted in OpenQuok</button>
					<button id="clear" class="secondary" ${hasSession ? '' : 'disabled'}>Clear session</button>
				</div>
				${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
			</div>
		`)
		);

		const channelSelect = root.querySelector('#channel-select') as HTMLSelectElement | null;
		channelSelect?.addEventListener('change', () => {
			selectedChannelId = channelSelect.value;
		});

		root.querySelector('#fill-all')?.addEventListener('click', async () => {
			const result = await sendRuntime({ type: AUTO_LAUNCH_MESSAGE_TYPE.FILL_ALL });
			if (result.ok === false) {
				render(state, String(result.error ?? 'Fill failed.'));
			}
		});

		root.querySelector('#focus-tab')?.addEventListener('click', async () => {
			const result = await sendRuntime({ type: 'OPENQUOK_AUTO_LAUNCH_FOCUS_TAB' });
			if (result.ok === false) {
				render(state, String(result.error ?? 'Could not focus directory tab.'));
			}
		});

		root.querySelector('#open-start')?.addEventListener('click', async () => {
			const slug = sessionSlug ?? selectedChannelId;
			const provider = getDirectoryLaunchProvider(slug);
			const url = hasSession ? state?.session.startUrl : provider?.defaultStartUrl;
			if (!url) return;
			await chrome.tabs.create({ url, active: true });
		});

		root.querySelector('#mark-done')?.addEventListener('click', async () => {
			const result = await sendRuntime({ type: 'OPENQUOK_AUTO_LAUNCH_COMPLETE' });
			if (result.ok === false) {
				render(state, String(result.error ?? 'Could not mark complete.'));
				return;
			}
			lastProgress = null;
			await refresh();
		});

		root.querySelector('#clear')?.addEventListener('click', async () => {
			await sendRuntime({ type: 'OPENQUOK_AUTO_LAUNCH_CLEAR' });
			lastProgress = null;
			await refresh();
		});
	}

	async function refresh(): Promise<void> {
		const { state, backgroundUnreachable } = await fetchState();
		render(
			state,
			backgroundUnreachable
				? 'Extension background is not running. On chrome://extensions, open OpenQuok → Service worker (or Reload), then try again.'
				: undefined
		);
	}

	const onRuntimeMessage = (message: unknown): void => {
		if (!message || typeof message !== 'object') return;
		const record = message as Record<string, unknown>;
		if (record.type === POPUP_UI_MESSAGE.STATE_CHANGED) {
			void refresh();
		}
		if (record.type === POPUP_UI_MESSAGE.PROGRESS && record.progress) {
			const p = record.progress as {
				stepLabel?: string;
				stepId?: string;
				filledCount?: number;
				totalFields?: number;
			};
			lastProgress = `${p.stepLabel ?? p.stepId}: ${p.filledCount}/${p.totalFields} fields`;
			void refresh();
		}
	};

	chrome.runtime.onMessage.addListener(onRuntimeMessage);
	void refresh();

	return {
		refresh,
		destroy: () => {
			chrome.runtime.onMessage.removeListener(onRuntimeMessage);
		},
	};
}
