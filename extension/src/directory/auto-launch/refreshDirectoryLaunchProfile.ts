import {
	AUTO_LAUNCH_MESSAGE_TYPE,
	coerceAutoLaunchHandoffRequestFields,
	toAutoLaunchHandoffSession,
	type AutoLaunchHandoffRequestFields,
} from 'openquok-common';

import { resolveApiOriginForDashboard } from '../../shared/dashboardApiOrigin.js';
import { readAccessTokenCookie } from '../../shared/dashboardAuth.js';
import {
	AUTO_LAUNCH_REFRESH_INTENT_PATH,
	OPENQUOK_AUTO_LAUNCH_REFRESH_PROFILE,
} from './constants.js';
import { POPUP_UI_MESSAGE, type PopupUiMessage } from './popupMessages.js';
import {
	loadAutoLaunchState,
	saveAutoLaunchState,
	type StoredAutoLaunchState,
} from './sessionStorage.js';

type SubmissionIntentRow = {
	submissionId: string;
	launchToken: string;
	startUrl: string;
	providerSlug: string;
	productProfileId?: string;
	profileSnapshot: Record<string, unknown>;
	extensionConfig: Record<string, unknown>;
};

function apiRoot(origin: string): string {
	return `${origin.replace(/\/+$/, '')}/api/v1`;
}

export async function postRefreshSubmissionIntent(
	dashboardOrigin: string,
	launchToken: string,
	productProfileId?: string
): Promise<
	| { ok: true; fields: AutoLaunchHandoffRequestFields }
	| { ok: false; error: string }
> {
	const tokenResult = await readAccessTokenCookie(dashboardOrigin);
	if (!tokenResult) {
		return {
			ok: false,
			error: 'Sign in to OpenQuok in your browser, then try again.',
		};
	}
	if ('error' in tokenResult) {
		return { ok: false, error: tokenResult.error };
	}

	const apiOrigin = await resolveApiOriginForDashboard(dashboardOrigin);
	const url = `${apiRoot(apiOrigin)}${AUTO_LAUNCH_REFRESH_INTENT_PATH}`;
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${tokenResult.accessToken}`,
		},
		body: JSON.stringify({
			launchToken,
			...(productProfileId ? { productProfileId } : {}),
		}),
	});

	let body: unknown = null;
	try {
		body = await response.json();
	} catch {
		body = null;
	}

	const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
	if (!response.ok) {
		const message =
			(typeof record.message === 'string' && record.message) ||
			(typeof record.error === 'string' && record.error) ||
			`Refresh failed (${response.status}).`;
		return { ok: false, error: message };
	}

	const data =
		record.data && typeof record.data === 'object'
			? (record.data as SubmissionIntentRow)
			: (record as SubmissionIntentRow);

	const fields = coerceAutoLaunchHandoffRequestFields({
		submissionId: data.submissionId,
		launchToken: data.launchToken,
		providerSlug: data.providerSlug,
		startUrl: data.startUrl,
		...(data.productProfileId ? { productProfileId: data.productProfileId } : {}),
		profileSnapshot: data.profileSnapshot,
		extensionConfig: data.extensionConfig,
		skipStartUrlTabOpen: true,
	});
	if (!fields) {
		return { ok: false, error: 'Could not read launch data from OpenQuok.' };
	}

	return { ok: true, fields };
}

function broadcastPopup(message: PopupUiMessage): void {
	void chrome.runtime.sendMessage(message).catch(() => {
		/* popup may be closed */
	});
}

async function sendStartToTab(
	tabId: number,
	state: StoredAutoLaunchState
): Promise<void> {
	try {
		await chrome.tabs.sendMessage(tabId, {
			type: AUTO_LAUNCH_MESSAGE_TYPE.START,
			session: state.session,
			dashboardOrigin: state.dashboardOrigin,
		});
	} catch {
		/* content script may not be ready */
	}
}

export async function applyStoredDirectoryLaunchProfileRefresh(
	productProfileId?: string
): Promise<{ ok: true; state: StoredAutoLaunchState } | { ok: false; error: string }> {
	const state = await loadAutoLaunchState();
	if (!state?.session?.launchToken) {
		return { ok: false, error: 'No active directory launch session.' };
	}

	const refreshed = await postRefreshSubmissionIntent(
		state.dashboardOrigin,
		state.session.launchToken,
		productProfileId
	);
	if (!refreshed.ok) {
		return refreshed;
	}

	const session = toAutoLaunchHandoffSession(refreshed.fields);
	const next: StoredAutoLaunchState = {
		...state,
		session,
		receivedAt: Date.now(),
	};
	await saveAutoLaunchState(next);
	broadcastPopup({ type: POPUP_UI_MESSAGE.STATE_CHANGED, state: next });

	const tabId = next.handoffTabId;
	if (typeof tabId === 'number') {
		await sendStartToTab(tabId, next);
	}

	return { ok: true, state: next };
}

/** Reload profile snapshot from the API after dashboard edits (My Products). */
export async function refreshStoredDirectoryLaunchProfile(): Promise<
	{ ok: true; state: StoredAutoLaunchState } | { ok: false; error: string }
> {
	return applyStoredDirectoryLaunchProfileRefresh();
}

export const REFRESH_PROFILE_MESSAGE_TYPE = OPENQUOK_AUTO_LAUNCH_REFRESH_PROFILE;
