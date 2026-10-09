import { REFRESH_STORAGE_PREFIX } from '../constants.js';

export type StoredRefreshRegistration = {
	providerId: string;
	integrationId: string;
	backendUrl: string;
	refreshToken: string;
};

export function refreshStorageKey(providerId: string, integrationId: string): string {
	return `${REFRESH_STORAGE_PREFIX}${providerId}:${integrationId}`;
}

export async function saveRefreshRegistration(
	entry: StoredRefreshRegistration
): Promise<void> {
	const key = refreshStorageKey(entry.providerId, entry.integrationId);
	await chrome.storage.local.set({ [key]: entry });
}

export async function removeRefreshRegistration(
	providerId: string,
	integrationId: string
): Promise<void> {
	const key = refreshStorageKey(providerId, integrationId);
	await chrome.storage.local.remove(key);
}

export async function listRefreshRegistrations(): Promise<StoredRefreshRegistration[]> {
	const all = await chrome.storage.local.get(null);
	const entries: StoredRefreshRegistration[] = [];
	for (const [key, value] of Object.entries(all)) {
		if (!key.startsWith(REFRESH_STORAGE_PREFIX) || !value || typeof value !== 'object') continue;
		const record = value as StoredRefreshRegistration;
		if (
			typeof record.providerId === 'string' &&
			typeof record.integrationId === 'string' &&
			typeof record.backendUrl === 'string' &&
			typeof record.refreshToken === 'string'
		) {
			entries.push(record);
		}
	}
	return entries;
}

export async function getRefreshRegistration(
	providerId: string,
	integrationId: string
): Promise<StoredRefreshRegistration | undefined> {
	const key = refreshStorageKey(providerId, integrationId);
	const result = await chrome.storage.local.get(key);
	const value = result[key];
	if (!value || typeof value !== 'object') return undefined;
	const record = value as StoredRefreshRegistration;
	if (
		typeof record.providerId !== 'string' ||
		typeof record.integrationId !== 'string' ||
		typeof record.backendUrl !== 'string' ||
		typeof record.refreshToken !== 'string'
	) {
		return undefined;
	}
	return record;
}
