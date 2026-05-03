import type { PostMediaProgrammerModel, RepeatIntervalKey } from '$lib/posts';

/** Persisted JSON schema for `/sets` `content` column (workspace presets). */
export type SetSnapshotV1 = {
	v: 1;
	selectedIntegrationIds: string[];
	selectedGroupId: string | null;
	mode: 'global' | 'custom';
	focusedIntegrationId: string | null;
	globalBody: string;
	bodiesByIntegrationId: Record<string, string>;
	providerSettingsByIntegrationId: Record<string, Record<string, unknown>>;
	postMediaItems: PostMediaProgrammerModel[];
	selectedTagNames: string[];
	repeatInterval: RepeatIntervalKey | null;
};

export function stringifySetSnapshot(snapshot: SetSnapshotV1): string {
	return JSON.stringify(snapshot);
}

export function parseSetContent(raw: string): SetSnapshotV1 | null {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!parsed || typeof parsed !== 'object') return null;
		const o = parsed as Record<string, unknown>;
		if (o.v !== 1) return null;
		if (!Array.isArray(o.selectedIntegrationIds)) return null;
		const ids = o.selectedIntegrationIds.filter((x): x is string => typeof x === 'string');
		const mode = o.mode === 'custom' || o.mode === 'global' ? o.mode : null;
		if (!mode) return null;

		const bodiesRaw = o.bodiesByIntegrationId;
		const bodiesByIntegrationId =
			bodiesRaw && typeof bodiesRaw === 'object' && !Array.isArray(bodiesRaw)
				? (bodiesRaw as Record<string, string>)
				: {};
		const settingsRaw = o.providerSettingsByIntegrationId;
		const providerSettingsByIntegrationId =
			settingsRaw && typeof settingsRaw === 'object' && !Array.isArray(settingsRaw)
				? (settingsRaw as Record<string, Record<string, unknown>>)
				: {};

		let repeatInterval: RepeatIntervalKey | null = null;
		if (o.repeatInterval === null) repeatInterval = null;
		else if (typeof o.repeatInterval === 'string') repeatInterval = o.repeatInterval as RepeatIntervalKey;

		return {
			v: 1,
			selectedIntegrationIds: ids,
			selectedGroupId: typeof o.selectedGroupId === 'string' ? o.selectedGroupId : null,
			mode,
			focusedIntegrationId: typeof o.focusedIntegrationId === 'string' ? o.focusedIntegrationId : null,
			globalBody: typeof o.globalBody === 'string' ? o.globalBody : '',
			bodiesByIntegrationId,
			providerSettingsByIntegrationId,
			postMediaItems: Array.isArray(o.postMediaItems) ? (o.postMediaItems as PostMediaProgrammerModel[]) : [],
			selectedTagNames: Array.isArray(o.selectedTagNames)
				? o.selectedTagNames.filter((x): x is string => typeof x === 'string')
				: [],
			repeatInterval
		};
	} catch {
		return null;
	}
}
