export type CrossAccountPlugSettingsBucket = 'threads' | 'x' | 'linkedin';

/** Persisted cross-account plug row (threads, x, linkedin buckets). */
export type CrossAccountPlugState = {
	plugName: string;
	enabled: boolean;
	delayMs: number;
	integrationIds: string[];
	fields: Record<string, string>;
};

export const THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME = 'threads-cross-account-comment';

/** Default delay before cross-account Threads comments (gives Meta time before the reply runs). */
export const THREADS_CROSS_ACCOUNT_DEFAULT_DELAY_MS = 2 * 60 * 1000;

export const THREADS_CROSS_ACCOUNT_DELAY_OPTIONS = [
	{ label: '2 minutes', ms: THREADS_CROSS_ACCOUNT_DEFAULT_DELAY_MS },
	{ label: '5 minutes', ms: 5 * 60 * 1000 },
	{ label: '1 hour', ms: 3600000 },
	{ label: '2 hours', ms: 7200000 },
	{ label: '3 hours', ms: 10800000 },
	{ label: '8 hours', ms: 28800000 },
	{ label: '12 hours', ms: 43200000 },
	{ label: '24 hours', ms: 86400000 }
] as const;

/** Enabled cross-account plugs with at least one acting channel selected. */
export function activeCrossAccountPlugs(
	plugs: CrossAccountPlugState[] | undefined
): CrossAccountPlugState[] {
	if (!plugs?.length) return [];
	return plugs.filter((plug) => plug.enabled && plug.integrationIds.length > 0);
}

/** Provider-settings patch for `mergeProviderSettingsPatch` (plug dialog + settings accordion). */
export function buildCrossAccountPlugsProviderPatch(
	bucket: CrossAccountPlugSettingsBucket,
	plugs: CrossAccountPlugState[] | undefined
): Record<string, unknown> {
	const active = activeCrossAccountPlugs(plugs);
	return {
		[bucket]: active.length ? { crossAccountPlugs: active } : {}
	};
}

export const GENERIC_CROSS_ACCOUNT_DELAY_OPTIONS = [
	{ label: 'Immediately', ms: 0 },
	{ label: '1 hour', ms: 3600000 },
	{ label: '2 hours', ms: 7200000 },
	{ label: '3 hours', ms: 10800000 },
	{ label: '8 hours', ms: 28800000 },
	{ label: '12 hours', ms: 43200000 },
	{ label: '24 hours', ms: 86400000 }
] as const;

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

	const normalizedThreads = normalizeThreadsCrossAccountPlugs(threads);

	const legacy = normalizedThreads.multiAccountEngagementPlug;
	if (!isPlainSettingsObject(legacy)) {
		return { ...settings, threads: normalizedThreads };
	}

	const { multiAccountEngagementPlug: _legacy, ...threadsWithoutLegacy } = normalizedThreads;
	const nextThreads: Record<string, unknown> = { ...threadsWithoutLegacy };

	if (legacy.enabled === true) {
		const integrationIds = stringIds(legacy.integrationIds);
		if (integrationIds.length > 0) {
			const existing = crossAccountPlugsFromThreadsBucket(nextThreads);
			const hasPlug = existing.some((p) => p.plugName === THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME);
			if (!hasPlug) {
				const migrated: CrossAccountPlugState = {
					plugName: THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME,
					enabled: true,
					delayMs: THREADS_CROSS_ACCOUNT_DEFAULT_DELAY_MS,
					integrationIds,
					fields: { comment: '' }
				};
				nextThreads.crossAccountPlugs = [...existing, migrated];
			}
		}
	}

	return {
		...settings,
		threads: normalizeThreadsCrossAccountPlugs(nextThreads)
	};
}

function normalizeThreadsCrossAccountPlugs(threads: Record<string, unknown>): Record<string, unknown> {
	const plugs = crossAccountPlugsFromThreadsBucket(threads);
	if (!plugs.length) return threads;
	const normalized = plugs.map((plug) =>
		plug.plugName === THREADS_CROSS_ACCOUNT_COMMENT_PLUG_NAME && plug.delayMs === 0
			? { ...plug, delayMs: THREADS_CROSS_ACCOUNT_DEFAULT_DELAY_MS }
			: plug
	);
	return { ...threads, crossAccountPlugs: normalized };
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
