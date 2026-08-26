/** Persisted cross-account plug row (threads, x, linkedin buckets). */
export type CrossAccountPlugState = {
	plugName: string;
	enabled: boolean;
	delayMs: number;
	integrationIds: string[];
	fields: Record<string, string>;
};

export const THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME = 'threads-cross-account-comment';

function isPlainSettingsObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringIds(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
}

function crossAccountPlugsFromThreadsBucket(
	threads: Record<string, unknown>
): CrossAccountPlugState[] {
	const raw = threads.crossAccountPlugs;
	if (!Array.isArray(raw)) return [];
	return raw.filter((item): item is CrossAccountPlugState => {
		return (
			isPlainSettingsObject(item) &&
			typeof item.plugName === 'string' &&
			typeof item.enabled === 'boolean' &&
			typeof item.delayMs === 'number' &&
			Array.isArray(item.integrationIds) &&
			isPlainSettingsObject(item.fields)
		);
	});
}

/**
 * Load-path migration: legacy `threads.multiAccountEngagementPlug` → `threads.crossAccountPlugs`.
 * Same-account delayed reply stays on `threads.internalEngagementPlug`.
 */
export function migrateIntegrationProviderSettingsOnLoad(
	settings: Record<string, unknown> | undefined
): Record<string, unknown> {
	if (!isPlainSettingsObject(settings)) return {};

	const threads = settings.threads;
	if (!isPlainSettingsObject(threads)) return { ...settings };

	const legacy = threads.multiAccountEngagementPlug;
	if (!isPlainSettingsObject(legacy)) return { ...settings };

	const { multiAccountEngagementPlug: _legacy, ...threadsWithoutLegacy } = threads;
	const nextThreads: Record<string, unknown> = { ...threadsWithoutLegacy };

	if (legacy.enabled === true) {
		const integrationIds = stringIds(legacy.integrationIds);
		if (integrationIds.length > 0) {
			const existing = crossAccountPlugsFromThreadsBucket(threads);
			const hasPlug = existing.some((p) => p.plugName === THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME);
			if (!hasPlug) {
				const migrated: CrossAccountPlugState = {
					plugName: THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME,
					enabled: true,
					delayMs: 0,
					integrationIds,
					fields: { comment: '' }
				};
				nextThreads.crossAccountPlugs = [...existing, migrated];
			}
		}
	}

	return {
		...settings,
		threads: nextThreads
	};
}

/** Apply per-integration load migrations across the composer provider-settings map. */
export function migrateProviderSettingsByIntegrationIdOnLoad(
	source: Record<string, Record<string, unknown>> | undefined
): Record<string, Record<string, unknown>> {
	const input = source ?? {};
	const out: Record<string, Record<string, unknown>> = {};
	for (const [integrationId, settings] of Object.entries(input)) {
		out[integrationId] = migrateIntegrationProviderSettingsOnLoad(settings);
	}
	return out;
}
