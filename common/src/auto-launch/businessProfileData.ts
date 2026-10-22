/** Max product tags stored in `profile_data.tags` (directory listing forms). */
export const BUSINESS_PROFILE_MAX_TAGS = 3;

/** Max product categories in `profile_data.categories` (discovery / product type). */
export const BUSINESS_PROFILE_MAX_CATEGORIES = 3;

/** Max use cases in `profile_data.use_cases`. */
export const BUSINESS_PROFILE_MAX_USE_CASES = 3;

/** Max target audiences in `profile_data.target_audiences`. */
export const BUSINESS_PROFILE_MAX_TARGET_AUDIENCES = 3;

/** Max platforms in `profile_data.platforms` (where the product is available). */
export const BUSINESS_PROFILE_MAX_PLATFORMS = 5;

/** Max similar products in `profile_data.alternatives`. */
export const BUSINESS_PROFILE_MAX_ALTERNATIVES = 5;

/** Max gallery image storage paths in `profile_data.gallery_urls`. */
export const BUSINESS_PROFILE_MAX_GALLERY_URLS = 3;

/** Minimum characters for `profile_data.selling_reason` when provided or when listed for acquisition. */
export const BUSINESS_PROFILE_SELLING_REASON_MIN_LENGTH = 20;

export const BUSINESS_PROFILE_PRICING_TYPES = ['free', 'freemium', 'paid'] as const;
export type BusinessProfilePricingType = (typeof BUSINESS_PROFILE_PRICING_TYPES)[number];

/** Slugs for `profile_data.included_assets` (acquisition listing checkboxes). */
export const BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS = [
	'domain',
	'source_code',
	'social_accounts',
	'customer_list',
	'brand_assets',
	'intellectual_property',
	'contracts',
	'inventory',
] as const;
export type BusinessProfileIncludedAssetSlug = (typeof BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS)[number];

/**
 * JSON shape for `auto_launch_product_profiles.profile_data`.
 * All keys are optional; unset keys are omitted after normalization.
 */
export type BusinessProfileData = {
	slug?: string | null;
	category?: string | null;
	categories?: string[] | null;
	use_cases?: string[] | null;
	target_audiences?: string[] | null;
	platforms?: string[] | null;
	alternatives?: string[] | null;
	pricing_type?: BusinessProfilePricingType | null;
	tags?: string[] | null;
	is_open_source?: boolean | null;
	repository_url?: string | null;
	launch_video_url?: string | null;
	gallery_urls?: string[] | null;
	social_x?: string | null;
	social_github?: string | null;
	social_instagram?: string | null;
	social_linkedin?: string | null;
	social_tiktok?: string | null;
	social_facebook?: string | null;
	social_youtube?: string | null;
	social_bluesky?: string | null;
	acquisition_listed?: boolean | null;
	asking_price_usd?: number | null;
	ttm_revenue_usd?: number | null;
	monthly_revenue_usd?: number | null;
	ttm_profit_usd?: number | null;
	monthly_profit_usd?: number | null;
	selling_reason?: string | null;
	included_assets?: BusinessProfileIncludedAssetSlug[] | null;
};

const INCLUDED_ASSET_SET = new Set<string>(BUSINESS_PROFILE_INCLUDED_ASSET_SLUGS);

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Shallow merge for PATCH: patch keys overlay stored `profile_data`. */
export function mergeBusinessProfileData(
	existing: Record<string, unknown> | BusinessProfileData | null | undefined,
	patch: Record<string, unknown> | BusinessProfileData
): BusinessProfileData {
	const base = isPlainObject(existing) ? { ...existing } : {};
	const next = { ...base, ...patch };
	return normalizeBusinessProfileData(next);
}

/**
 * Drop unknown keys and coerce empty strings to null for stable API storage.
 * Does not enforce business limits (use API Zod validation before persisting).
 */
export function normalizeBusinessProfileData(
	value: Record<string, unknown> | BusinessProfileData
): BusinessProfileData {
	const out: BusinessProfileData = {};

	const slug = trimToNull(value.slug);
	if (slug !== undefined) out.slug = slug;

	const category = trimToNull(value.category);
	if (category !== undefined) out.category = category;

	if (value.categories !== undefined) {
		out.categories = normalizeStringArray(value.categories);
	}

	if (value.use_cases !== undefined) {
		out.use_cases = normalizeStringArray(value.use_cases);
	}

	if (value.target_audiences !== undefined) {
		out.target_audiences = normalizeStringArray(value.target_audiences);
	}

	if (value.platforms !== undefined) {
		out.platforms = normalizeStringArray(value.platforms);
	}

	if (value.alternatives !== undefined) {
		out.alternatives = normalizeStringArray(value.alternatives);
	}

	if (value.pricing_type !== undefined) {
		const pt = value.pricing_type;
		if (pt === null) out.pricing_type = null;
		else if (typeof pt === 'string' && (BUSINESS_PROFILE_PRICING_TYPES as readonly string[]).includes(pt)) {
			out.pricing_type = pt as BusinessProfilePricingType;
		}
	}

	if (value.tags !== undefined) {
		out.tags = normalizeStringArray(value.tags);
	}

	if (value.is_open_source !== undefined) {
		out.is_open_source = value.is_open_source === null ? null : Boolean(value.is_open_source);
	}

	const repositoryUrl = trimToNull(value.repository_url);
	if (repositoryUrl !== undefined) out.repository_url = repositoryUrl;

	const launchVideoUrl = trimToNull(value.launch_video_url);
	if (launchVideoUrl !== undefined) out.launch_video_url = launchVideoUrl;

	if (value.gallery_urls !== undefined) {
		out.gallery_urls = normalizeStringArray(value.gallery_urls);
	}

	for (const key of [
		'social_x',
		'social_github',
		'social_instagram',
		'social_linkedin',
		'social_tiktok',
		'social_facebook',
		'social_youtube',
		'social_bluesky',
	] as const) {
		if (value[key] !== undefined) {
			out[key] = trimToNull(value[key]) ?? null;
		}
	}

	if (value.acquisition_listed !== undefined) {
		out.acquisition_listed =
			value.acquisition_listed === null ? null : Boolean(value.acquisition_listed);
	}

	for (const key of [
		'asking_price_usd',
		'ttm_revenue_usd',
		'monthly_revenue_usd',
		'ttm_profit_usd',
		'monthly_profit_usd',
	] as const) {
		if (value[key] !== undefined) {
			out[key] = normalizeUsdAmount(value[key]);
		}
	}

	const sellingReason = trimToNull(value.selling_reason);
	if (sellingReason !== undefined) out.selling_reason = sellingReason;

	if (value.included_assets !== undefined) {
		out.included_assets = normalizeIncludedAssets(value.included_assets);
	}

	return out;
}

function trimToNull(value: unknown): string | null | undefined {
	if (value === undefined) return undefined;
	if (value === null) return null;
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length === 0 ? null : trimmed;
}

function normalizeStringArray(value: unknown): string[] | null {
	if (value === null) return null;
	if (!Array.isArray(value)) return [];
	return value
		.filter((item): item is string => typeof item === 'string')
		.map((item) => item.trim())
		.filter((item) => item.length > 0);
}

function normalizeUsdAmount(value: unknown): number | null {
	if (value === null) return null;
	if (typeof value !== 'number' || !Number.isFinite(value)) return null;
	if (value < 0) return null;
	return value;
}

function normalizeIncludedAssets(value: unknown): BusinessProfileIncludedAssetSlug[] | null {
	if (value === null) return null;
	if (!Array.isArray(value)) return [];
	const slugs: BusinessProfileIncludedAssetSlug[] = [];
	for (const item of value) {
		if (typeof item !== 'string') continue;
		const slug = item.trim();
		if (!INCLUDED_ASSET_SET.has(slug)) continue;
		if (!slugs.includes(slug as BusinessProfileIncludedAssetSlug)) {
			slugs.push(slug as BusinessProfileIncludedAssetSlug);
		}
	}
	return slugs;
}

export const EMPTY_BUSINESS_PROFILE_DATA: BusinessProfileData = {};
