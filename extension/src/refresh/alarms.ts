import { REFRESH_ALARM_PREFIX, REFRESH_PERIOD_MINUTES } from '../constants.js';
import { postExtensionRefresh } from './extensionRefresh.js';
import {
	listRefreshRegistrations,
	type StoredRefreshRegistration,
} from '../storage/refreshTokenStorage.js';

export function refreshAlarmName(providerId: string, integrationId: string): string {
	return `${REFRESH_ALARM_PREFIX}${providerId}:${integrationId}`;
}

export function parseRefreshAlarmName(
	alarmName: string
): { providerId: string; integrationId: string } | null {
	if (!alarmName.startsWith(REFRESH_ALARM_PREFIX)) return null;
	const rest = alarmName.slice(REFRESH_ALARM_PREFIX.length);
	const sep = rest.indexOf(':');
	if (sep <= 0) return null;
	const providerId = rest.slice(0, sep);
	const integrationId = rest.slice(sep + 1);
	if (!providerId || !integrationId) return null;
	return { providerId, integrationId };
}

export async function scheduleRefreshAlarm(
	providerId: string,
	integrationId: string
): Promise<void> {
	const name = refreshAlarmName(providerId, integrationId);
	await chrome.alarms.create(name, { periodInMinutes: REFRESH_PERIOD_MINUTES });
}

export async function clearRefreshAlarm(providerId: string, integrationId: string): Promise<void> {
	await chrome.alarms.clear(refreshAlarmName(providerId, integrationId));
}

export async function ensureRefreshAlarms(): Promise<void> {
	const entries = await listRefreshRegistrations();
	for (const entry of entries) {
		await scheduleRefreshAlarm(entry.providerId, entry.integrationId);
	}
}

export async function runRefreshForEntry(entry: StoredRefreshRegistration): Promise<void> {
	const result = await postExtensionRefresh(entry);
	if (result.ok) return;
	console.warn('[OpenQuok extension] Session refresh failed:', result.error);
	if (result.refreshNeeded) {
		console.warn(
			'[OpenQuok extension] Reconnect this channel in the OpenQuok dashboard.',
			entry.integrationId
		);
	}
}

export async function handleRefreshAlarm(alarmName: string): Promise<void> {
	const parsed = parseRefreshAlarmName(alarmName);
	if (!parsed) return;

	const entries = await listRefreshRegistrations();
	const entry = entries.find(
		(e) => e.providerId === parsed.providerId && e.integrationId === parsed.integrationId
	);
	if (!entry) {
		await chrome.alarms.clear(alarmName);
		return;
	}

	await runRefreshForEntry(entry);
}
