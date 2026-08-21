import type {
	DevtoLaunchProviderSettings,
	DevtoTagOption,
	LaunchProviderCheckContext,
	LaunchProviderConfig
} from '$lib/ui/components/posts/providers/provider.types';

/** Dev.to article body limit (matches backend `DevToProvider.maxLength`). */
export const DEVTO_MAX_CHARACTERS = 100_000;
export const DEVTO_TITLE_MIN_LENGTH = 2;
export const DEVTO_MAX_TAGS = 4;

function isValidHttpUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

function tagOptionsFromUnknown(raw: unknown): DevtoTagOption[] {
	if (!Array.isArray(raw)) return [];
	const out: DevtoTagOption[] = [];
	const seen = new Set<string>();
	for (const item of raw) {
		if (typeof item === 'string') {
			const name = item.trim();
			if (!name) continue;
			const key = name.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			out.push({ value: name, label: name });
			continue;
		}
		if (!item || typeof item !== 'object') continue;
		const rec = item as { value?: unknown; label?: unknown };
		const label =
			typeof rec.label === 'string'
				? rec.label.trim()
				: typeof rec.value === 'string'
					? rec.value.trim()
					: '';
		if (!label) continue;
		const value = typeof rec.value === 'string' && rec.value.trim() ? rec.value.trim() : label;
		const key = label.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push({ value, label });
	}
	return out.slice(0, DEVTO_MAX_TAGS);
}

function readOrganizationId(source: Record<string, unknown>): number | undefined {
	const raw = source.organization ?? source.organization_id ?? source.organizationId;
	if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return Math.trunc(raw);
	if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
		const n = Number.parseInt(raw.trim(), 10);
		return n > 0 ? n : undefined;
	}
	if (raw && typeof raw === 'object') {
		const rec = raw as { id?: unknown; value?: unknown };
		return readOrganizationId({ organization: rec.id ?? rec.value });
	}
	return undefined;
}

function readMainImage(source: Record<string, unknown>): { path: string } | undefined {
	const main = source.mainImage ?? source.main_image;
	if (typeof main === 'string' && main.trim()) return { path: main.trim() };
	if (main && typeof main === 'object' && typeof (main as { path?: unknown }).path === 'string') {
		const path = (main as { path: string }).path.trim();
		return path ? { path } : undefined;
	}
	return undefined;
}

/** Reads Dev.to settings from per-integration provider settings (flat CLI + nested bucket). */
export function readDevtoLaunchSettings(settings: Record<string, unknown>): DevtoLaunchProviderSettings {
	const bucket = (settings as { devto?: Partial<DevtoLaunchProviderSettings> & Record<string, unknown> })
		.devto;
	const source: Record<string, unknown> = {
		...settings,
		...(bucket && typeof bucket === 'object' ? bucket : {})
	};

	const nestedTitle = typeof bucket?.title === 'string' ? bucket.title.trim() : '';
	const flatTitle = typeof settings.title === 'string' ? settings.title.trim() : '';
	const title = nestedTitle || flatTitle;

	const nestedCanonical = typeof bucket?.canonical === 'string' ? bucket.canonical.trim() : '';
	const flatCanonical =
		typeof settings.canonical === 'string'
			? settings.canonical.trim()
			: typeof settings.canonical_url === 'string'
				? settings.canonical_url.trim()
				: typeof settings.canonicalUrl === 'string'
					? settings.canonicalUrl.trim()
					: '';
	const canonical = nestedCanonical || flatCanonical;

	const nestedSeries = typeof bucket?.series === 'string' ? bucket.series.trim() : '';
	const flatSeries = typeof settings.series === 'string' ? settings.series.trim() : '';
	const series = nestedSeries || flatSeries;

	const nestedTags = Array.isArray(bucket?.tags) ? bucket.tags : [];
	const tags = tagOptionsFromUnknown(nestedTags.length > 0 ? nestedTags : source.tags);

	const organization = readOrganizationId(source);
	const mainImage = readMainImage(source);

	return {
		title,
		tags,
		...(canonical ? { canonical } : {}),
		...(organization ? { organization } : {}),
		...(series ? { series } : {}),
		...(mainImage ? { mainImage } : {})
	};
}

export function checkDevtoLaunchValidity(settings: DevtoLaunchProviderSettings): true | string {
	const titleLen = settings.title.trim().length;
	if (titleLen < DEVTO_TITLE_MIN_LENGTH) {
		return 'Dev.to title must be at least 2 characters';
	}
	if (settings.tags.length > DEVTO_MAX_TAGS) {
		return 'Dev.to allows at most 4 tags';
	}
	const canonical = settings.canonical?.trim();
	if (canonical && !isValidHttpUrl(canonical)) {
		return 'Canonical URL must be a valid http(s) URL';
	}
	return true;
}

function devtoCheckContext(ctx: LaunchProviderCheckContext) {
	return readDevtoLaunchSettings(ctx.settings);
}

export const devtoProvider: LaunchProviderConfig = {
	id: 'devto',
	maximumCharacters: DEVTO_MAX_CHARACTERS,
	minimumCharacters: 0,
	postComment: 'NONE',
	comments: false,
	checkValidity: (ctx) => checkDevtoLaunchValidity(devtoCheckContext(ctx))
};
