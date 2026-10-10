import type {
	LaunchProviderCheckContext,
	LaunchProviderConfig,
	SkoolLaunchProviderSettings
} from '$lib/ui/components/posts/providers/provider.types';

/** Skool post body limit (matches backend `SKOOL_MAX_LENGTH`). */
export const SKOOL_MAX_CHARACTERS = 5000;
export const SKOOL_TITLE_MIN_LENGTH = 1;

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, ...keys: string[]): string {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}
	return '';
}

function readGroupId(source: Record<string, unknown>): string {
	const direct = readString(source, 'group', 'group_id', 'groupId');
	if (direct) return direct;
	const group = source.group;
	if (isPlainObject(group)) {
		const nested = group.id ?? group.value;
		if (typeof nested === 'string' && nested.trim()) return nested.trim();
	}
	return '';
}

function readLabelId(source: Record<string, unknown>): string | undefined {
	const direct = readString(source, 'label', 'label_id', 'labelId');
	if (direct) return direct === 'none' ? undefined : direct;
	const label = source.label;
	if (isPlainObject(label)) {
		const nested = label.id ?? label.value;
		if (typeof nested === 'string' && nested.trim()) {
			const id = nested.trim();
			return id === 'none' ? undefined : id;
		}
	}
	return undefined;
}

/** Reads Skool settings from per-integration provider settings (flat CLI + nested bucket). */
export function readSkoolLaunchSettings(settings: Record<string, unknown>): SkoolLaunchProviderSettings {
	const bucket = (settings as { skool?: Partial<SkoolLaunchProviderSettings> & Record<string, unknown> })
		.skool;
	const source: Record<string, unknown> = {
		...settings,
		...(bucket && typeof bucket === 'object' ? bucket : {})
	};

	const nestedTitle = typeof bucket?.title === 'string' ? bucket.title.trim() : '';
	const flatTitle = typeof settings.title === 'string' ? settings.title.trim() : '';
	const title = nestedTitle || flatTitle;

	const group = readGroupId(source);
	const groupLabel = readString(source, 'groupLabel', 'group_label');
	const label = readLabelId(source);
	const labelLabel = readString(source, 'labelLabel', 'label_label');

	return {
		title,
		group,
		...(groupLabel ? { groupLabel } : {}),
		...(label ? { label } : {}),
		...(labelLabel ? { labelLabel } : {})
	};
}

export function checkSkoolLaunchValidity(settings: SkoolLaunchProviderSettings): true | string {
	if (settings.title.trim().length < SKOOL_TITLE_MIN_LENGTH) {
		return 'Skool posts require a title';
	}
	if (!settings.group.trim()) {
		return 'Select a Skool group';
	}
	if (!settings.label?.trim()) {
		return 'Select a Skool category';
	}
	return true;
}

function skoolCheckContext(ctx: LaunchProviderCheckContext) {
	return readSkoolLaunchSettings(ctx.settings);
}

export const skoolProvider: LaunchProviderConfig = {
	id: 'skool',
	maximumCharacters: SKOOL_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'COMMENT',
	checkValidity: (ctx) => checkSkoolLaunchValidity(skoolCheckContext(ctx))
};
