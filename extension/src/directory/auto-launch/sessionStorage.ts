import type { AutoLaunchHandoffSession } from 'openquok-common';

import { AUTO_LAUNCH_STORAGE_KEY } from './constants.js';

export type StoredAutoLaunchState = {
	session: AutoLaunchHandoffSession;
	/** Dashboard origin that sent the handoff (used for API auth cookies). */
	dashboardOrigin: string;
	receivedAt: number;
	/** Tab receiving START / fill commands (survives in-tab and same-tab navigations). */
	handoffTabId?: number | null;
};

export async function loadAutoLaunchState(): Promise<StoredAutoLaunchState | null> {
	const result = await chrome.storage.local.get(AUTO_LAUNCH_STORAGE_KEY);
	const raw = result[AUTO_LAUNCH_STORAGE_KEY];
	if (!raw || typeof raw !== 'object') return null;
	const record = raw as StoredAutoLaunchState;
	if (!record.session?.submissionId || !record.dashboardOrigin) return null;
	return record;
}

export async function saveAutoLaunchState(state: StoredAutoLaunchState): Promise<void> {
	await chrome.storage.local.set({ [AUTO_LAUNCH_STORAGE_KEY]: state });
}

export async function clearAutoLaunchState(): Promise<void> {
	await chrome.storage.local.remove(AUTO_LAUNCH_STORAGE_KEY);
}
