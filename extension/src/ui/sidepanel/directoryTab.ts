import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	getDirectoryLaunchProvider,
	listDirectoryLaunchProviderSummaries,
} from 'openquok-common';

import {
	OPENQUOK_AUTO_LAUNCH_FOCUS_TAB,
	OPENQUOK_AUTO_LAUNCH_OPEN_DIRECTORY_PAGE,
	OPENQUOK_AUTO_LAUNCH_REFRESH_PROFILE,
	OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION,
	OPENQUOK_AUTO_LAUNCH_SHOW_PANEL,
} from '../../directory/auto-launch/constants.js';
import { POPUP_UI_MESSAGE } from '../../directory/auto-launch/popupMessages.js';
import type { StoredAutoLaunchState } from '../../directory/auto-launch/sessionStorage.js';
import { isReadyPage, pageMatchesConfig } from '../../directory/directory-launch/stepRail.js';

import { openDashboardAddChannel } from '../../shared/openDashboardUrl.js';
import { getPreferredDashboardOrigin } from '../../shared/dashboardOriginStorage.js';

import { mountDirectoryChannelPicker } from './directoryChannelPicker.js';
import { mountDirectoryProfilePools } from './directoryProfilePools.js';
import { el, escapeHtml, runtimeSendMessage } from './uiHelpers.js';

type DirectoryTabRenderRef = {
	current: (state: StoredAutoLaunchState | null, error?: string) => void;
	refresh: () => Promise<void>;
};

async function showFillPanelForChannel(
	identifier: string,
	state: StoredAutoLaunchState | null,
	renderRef: DirectoryTabRenderRef
): Promise<void> {
	const result = await sendRuntime({
		type: OPENQUOK_AUTO_LAUNCH_SHOW_PANEL,
		providerSlug: identifier,
	});
	if (result.ok === false) {
		renderRef.current(
			state,
			String(result.error ?? 'Could not start this directory launch.')
		);
		return;
	}
	await renderRef.refresh();
}

async function handleDirectoryChannelSelect(
	identifier: string,
	state: StoredAutoLaunchState | null,
	renderRef: DirectoryTabRenderRef
): Promise<void> {
	selectedChannelId = identifier;
	directoryPickerUserSelection = identifier;
	await showFillPanelForChannel(identifier, state, renderRef);
}

const directoryChannels = listDirectoryLaunchProviderSummaries();

let lastProgress: string | null = null;
let selectedChannelId =
	directoryChannels[0]?.identifier ?? 'peerpush-standard-launch';
/** User-picked chip while a different launch may still be active. */
let directoryPickerUserSelection: string | null = null;
let lastRenderedSessionSlug: string | null = null;

function statusForState(state: StoredAutoLaunchState | null): string {
	if (!state) {
		return 'Pick a directory channel above to open that site and start filling (sign in to OpenQuok in this panel first). Or launch from My Products.';
	}
	const config = state.session.extensionConfig;
	if (!pageMatchesConfig(config)) {
		return `Open ${state.session.startUrl} and continue on the directory site.`;
	}
	if (!isReadyPage(config)) {
		return config.readyUrlHint
			? `Open your edit or submission page (URL includes “${config.readyUrlHint}”), then use Fill on the on-page OpenQuok panel.`
			: 'Open the directory listing or submission form, then use Fill on the on-page OpenQuok panel.';
	}
	return 'On the right page — use Fill on the on-page panel (each section or Fill all steps), then submit yourself on this site.';
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

function pickerSlug(
	state: StoredAutoLaunchState | null,
	fallbackSessionSlug: string | null
): string {
	return directoryPickerUserSelection ?? fallbackSessionSlug ?? selectedChannelId;
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

export type DirectoryTabController = {
	refresh: () => Promise<void>;
	destroy: () => void;
};

export function mountDirectoryTab(root: HTMLElement): DirectoryTabController {
	let destroyDirectoryPicker: (() => void) | null = null;
	let destroyProfilePools: (() => void) | null = null;
	const renderRef: DirectoryTabRenderRef = {
		current: (_state: StoredAutoLaunchState | null, _error?: string) => {},
		refresh: async () => {},
	};

	function render(state: StoredAutoLaunchState | null, error?: string): void {
		const hasSession = Boolean(state);
		const product = state?.session.profileSnapshot.name ?? '—';
		const sessionSlug = state?.session.providerSlug ?? null;
		if (sessionSlug !== lastRenderedSessionSlug) {
			directoryPickerUserSelection = null;
			lastRenderedSessionSlug = sessionSlug;
		}
		if (sessionSlug && !directoryPickerUserSelection) {
			selectedChannelId = sessionSlug;
		}
		const activeSelection =
			directoryPickerUserSelection ?? sessionSlug ?? selectedChannelId;
		const activeLaunchProvider = sessionSlug
			? getDirectoryLaunchProvider(sessionSlug)
			: undefined;
		const activeLaunchName = activeLaunchProvider?.name ?? sessionSlug ?? '—';
		const activeLaunchStartUrl = state?.session.startUrl?.trim() ?? '';

		destroyDirectoryPicker?.();
		destroyDirectoryPicker = null;
		destroyProfilePools?.();
		destroyProfilePools = null;

		root.replaceChildren(
			el(`
			<div class="wrap tab-wrap">
				<p class="muted tab-lead">Human submits on the directory site — OpenQuok never clicks Submit.</p>
				<label class="field-label">Directory channel</label>
				<div id="directory-channel-picker" class="channel-picker-host"></div>
				<div class="card">
					<strong>${escapeHtml(product)}</strong>
					<p class="status">${escapeHtml(statusForState(state))}</p>
					${lastProgress ? `<p class="progress">${escapeHtml(lastProgress)}</p>` : ''}
					${
						hasSession
							? `<div class="session-hint card-session-active">
							<p class="session-hint-kicker">Active launch (one directory at a time)</p>
							<p class="session-hint-title">${escapeHtml(activeLaunchName)}</p>
							${
								activeLaunchStartUrl
									? `<p class="muted session-hint-url">${escapeHtml(activeLaunchStartUrl)}</p>`
									: ''
							}
						</div>`
							: ''
					}
				</div>
				<div class="actions directory-actions">
					<button id="refresh-profile" class="secondary" ${hasSession ? '' : 'disabled'}>Refresh profile from OpenQuok</button>
					<button id="fill-all" ${hasSession ? '' : 'disabled'}>Fill all on directory tab</button>
					<button id="focus-tab" class="secondary" title="Switch to the browser tab for the active launch (same channel as Active launch below)." ${hasSession ? '' : 'disabled'}>Focus directory tab</button>
					<button id="reset-fill-panel" class="secondary" title="Move the on-page fill panel back to the top-left so it is not hidden behind this side panel." ${hasSession ? '' : 'disabled'}>Reset fill panel to left</button>
					<button id="open-start" class="secondary" title="Open the site for the selected channel chip above (starts a launch when it differs from the active one).">Open directory page</button>
					<button id="mark-done" class="secondary" ${hasSession ? '' : 'disabled'}>Mark submitted in OpenQuok</button>
					<button id="clear" class="secondary" ${hasSession ? '' : 'disabled'}>Clear session</button>
				</div>
				${hasSession ? '<div id="directory-profile-pools" class="profile-pools-host"></div>' : ''}
				${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
			</div>
		`)
		);

		const pickerHost = root.querySelector<HTMLElement>('#directory-channel-picker');
		if (pickerHost) {
			destroyDirectoryPicker = mountDirectoryChannelPicker(pickerHost, {
				channels: directoryChannels,
				selectedId: activeSelection,
				activeLaunchId: sessionSlug,
				onSelect: (identifier) => {
					void handleDirectoryChannelSelect(identifier, state, renderRef);
				},
				onAddChannel: () => {
					void getPreferredDashboardOrigin().then((origin) => openDashboardAddChannel(origin));
				},
			});
		}

		const poolsHost = root.querySelector<HTMLElement>('#directory-profile-pools');
		if (poolsHost && state) {
			destroyProfilePools = mountDirectoryProfilePools(poolsHost, {
				state,
				onError: (message) => render(state, message),
			});
		}

		root.querySelector('#refresh-profile')?.addEventListener('click', async () => {
			const result = await sendRuntime({ type: OPENQUOK_AUTO_LAUNCH_REFRESH_PROFILE });
			if (result.ok === false) {
				render(state, String(result.error ?? 'Could not refresh profile.'));
				return;
			}
			await refresh();
		});

		root.querySelector('#fill-all')?.addEventListener('click', async () => {
			const result = await sendRuntime({ type: AUTO_LAUNCH_MESSAGE_TYPE.FILL_ALL });
			if (result.ok === false) {
				render(state, String(result.error ?? 'Fill failed.'));
			}
		});

		root.querySelector('#focus-tab')?.addEventListener('click', async () => {
			const result = await sendRuntime({
				type: OPENQUOK_AUTO_LAUNCH_FOCUS_TAB,
				providerSlug: pickerSlug(state, sessionSlug),
			});
			if (result.ok === false) {
				render(state, String(result.error ?? 'Could not focus directory tab.'));
			}
		});

		root.querySelector('#reset-fill-panel')?.addEventListener('click', async () => {
			const result = await sendRuntime({
				type: OPENQUOK_AUTO_LAUNCH_RESET_PANEL_POSITION,
			});
			if (result.ok === false) {
				render(state, String(result.error ?? 'Could not reset fill panel.'));
			}
		});

		root.querySelector('#open-start')?.addEventListener('click', async () => {
			const result = await sendRuntime({
				type: OPENQUOK_AUTO_LAUNCH_OPEN_DIRECTORY_PAGE,
				providerSlug: pickerSlug(state, sessionSlug),
			});
			if (result.ok === false) {
				render(state, String(result.error ?? 'Could not open directory page.'));
				return;
			}
			await refresh();
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

	renderRef.current = render;

	async function refresh(): Promise<void> {
		const { state, backgroundUnreachable } = await fetchState();
		render(
			state,
			backgroundUnreachable
				? 'Extension background is not running. On chrome://extensions, open OpenQuok → Service worker (or Reload), then try again.'
				: undefined
		);
	}

	renderRef.refresh = refresh;

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
			destroyDirectoryPicker?.();
			destroyDirectoryPicker = null;
			destroyProfilePools?.();
			destroyProfilePools = null;
			chrome.runtime.onMessage.removeListener(onRuntimeMessage);
		},
	};
}
