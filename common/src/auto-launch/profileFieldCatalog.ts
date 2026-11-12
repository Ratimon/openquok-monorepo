import type {
	AutoLaunchExtensionConfig,
	AutoLaunchProfileSnapshot,
} from '../browser-extension/pageAssist.js';

import {
	BUSINESS_PROFILE_MAX_CATEGORIES,
	BUSINESS_PROFILE_MAX_GALLERY_URLS,
	BUSINESS_PROFILE_MAX_PLATFORMS,
	BUSINESS_PROFILE_MAX_TARGET_AUDIENCES,
	BUSINESS_PROFILE_MAX_TECH_STACK,
	BUSINESS_PROFILE_MAX_USE_CASES,
} from './businessProfileData.js';
import { collectProfilePathsFromExtensionConfig } from './listingProfileFingerprint.js';

export type ProfilePoolSectionId = 'main' | 'discovery' | 'media' | 'socials' | 'sell';

export type ProfilePoolFieldKind = 'scalar' | 'string_array' | 'boolean' | 'rich_text' | 'url';

export type ProfilePoolFieldDefinition = {
	id: string;
	label: string;
	profilePath: string;
	kind: ProfilePoolFieldKind;
	maxItems?: number;
};

export type ProfilePoolFieldResolved = ProfilePoolFieldDefinition & {
	/** Set when `kind` is `string_array` (empty when unset). */
	items: string[];
	/** Set when `kind` is `scalar`, `url`, or `rich_text`. */
	value: string | null;
	/** Set when `kind` is `boolean`. */
	booleanValue: boolean | null;
	/** True when this path appears in the active destination `extension_config`. */
	highlighted: boolean;
};

export type ProfilePoolSection = {
	id: ProfilePoolSectionId;
	label: string;
	fields: ProfilePoolFieldResolved[];
};

const PROFILE_POOL_SECTION_LABELS: Record<ProfilePoolSectionId, string> = {
	main: 'General',
	discovery: 'Discovery',
	media: 'Media',
	socials: 'Socials',
	sell: 'Sell',
};

const PROFILE_POOL_CATALOG: Record<ProfilePoolSectionId, ProfilePoolFieldDefinition[]> = {
	main: [
		{ id: 'name', label: 'Product name', profilePath: 'name', kind: 'scalar' },
		{ id: 'tagline', label: 'Tagline', profilePath: 'tagline', kind: 'scalar' },
		{ id: 'description', label: 'Rich description', profilePath: 'description', kind: 'rich_text' },
		{ id: 'website_url', label: 'Website URL', profilePath: 'website_url', kind: 'url' },
		{
			id: 'pricing_type',
			label: 'Pricing',
			profilePath: 'profile_data.pricing_type',
			kind: 'scalar',
		},
		{
			id: 'is_open_source',
			label: 'Open source',
			profilePath: 'profile_data.is_open_source',
			kind: 'boolean',
		},
		{
			id: 'repository_url',
			label: 'Repository URL',
			profilePath: 'profile_data.repository_url',
			kind: 'url',
		},
	],
	discovery: [
		{
			id: 'categories',
			label: 'Categories',
			profilePath: 'profile_data.categories',
			kind: 'string_array',
			maxItems: BUSINESS_PROFILE_MAX_CATEGORIES,
		},
		{
			id: 'use_cases',
			label: 'Use cases',
			profilePath: 'profile_data.use_cases',
			kind: 'string_array',
			maxItems: BUSINESS_PROFILE_MAX_USE_CASES,
		},
		{
			id: 'target_audiences',
			label: 'Target audiences',
			profilePath: 'profile_data.target_audiences',
			kind: 'string_array',
			maxItems: BUSINESS_PROFILE_MAX_TARGET_AUDIENCES,
		},
		{
			id: 'platforms',
			label: 'Platforms',
			profilePath: 'profile_data.platforms',
			kind: 'string_array',
			maxItems: BUSINESS_PROFILE_MAX_PLATFORMS,
		},
		{
			id: 'tech_stack',
			label: 'Tech stack',
			profilePath: 'profile_data.tech_stack',
			kind: 'string_array',
			maxItems: BUSINESS_PROFILE_MAX_TECH_STACK,
		},
	],
	media: [
		{ id: 'logo_url', label: 'Logo', profilePath: 'logo_url', kind: 'url' },
		{
			id: 'launch_video_url',
			label: 'Launch video URL',
			profilePath: 'profile_data.launch_video_url',
			kind: 'url',
		},
		{
			id: 'gallery_urls',
			label: 'Gallery',
			profilePath: 'profile_data.gallery_urls',
			kind: 'string_array',
			maxItems: BUSINESS_PROFILE_MAX_GALLERY_URLS,
		},
	],
	socials: [
		{ id: 'social_x', label: 'X (Twitter)', profilePath: 'profile_data.social_x', kind: 'url' },
		{ id: 'social_github', label: 'GitHub', profilePath: 'profile_data.social_github', kind: 'url' },
		{
			id: 'social_instagram',
			label: 'Instagram',
			profilePath: 'profile_data.social_instagram',
			kind: 'url',
		},
		{
			id: 'social_linkedin',
			label: 'LinkedIn',
			profilePath: 'profile_data.social_linkedin',
			kind: 'url',
		},
		{ id: 'social_tiktok', label: 'TikTok', profilePath: 'profile_data.social_tiktok', kind: 'url' },
		{
			id: 'social_facebook',
			label: 'Facebook',
			profilePath: 'profile_data.social_facebook',
			kind: 'url',
		},
		{
			id: 'social_youtube',
			label: 'YouTube',
			profilePath: 'profile_data.social_youtube',
			kind: 'url',
		},
		{
			id: 'social_bluesky',
			label: 'Bluesky',
			profilePath: 'profile_data.social_bluesky',
			kind: 'url',
		},
	],
	sell: [
		{
			id: 'acquisition_listed',
			label: 'Listed for acquisition',
			profilePath: 'profile_data.acquisition_listed',
			kind: 'boolean',
		},
		{
			id: 'asking_price_usd',
			label: 'Asking price (USD)',
			profilePath: 'profile_data.asking_price_usd',
			kind: 'scalar',
		},
		{
			id: 'ttm_revenue_usd',
			label: 'TTM revenue (USD)',
			profilePath: 'profile_data.ttm_revenue_usd',
			kind: 'scalar',
		},
		{
			id: 'monthly_revenue_usd',
			label: 'Monthly recurring revenue',
			profilePath: 'profile_data.monthly_revenue_usd',
			kind: 'scalar',
		},
		{
			id: 'ttm_profit_usd',
			label: 'TTM profit (USD)',
			profilePath: 'profile_data.ttm_profit_usd',
			kind: 'scalar',
		},
		{
			id: 'monthly_profit_usd',
			label: 'Monthly profit (USD)',
			profilePath: 'profile_data.monthly_profit_usd',
			kind: 'scalar',
		},
		{
			id: 'selling_reason',
			label: 'Selling reason',
			profilePath: 'profile_data.selling_reason',
			kind: 'scalar',
		},
		{
			id: 'included_assets',
			label: 'Included assets',
			profilePath: 'profile_data.included_assets',
			kind: 'string_array',
		},
	],
};

const PROFILE_POOL_SECTION_ORDER: ProfilePoolSectionId[] = [
	'main',
	'discovery',
	'media',
	'socials',
	'sell',
];

function buildProfileSnapshotRoot(snapshot: AutoLaunchProfileSnapshot): Record<string, unknown> {
	return {
		name: snapshot.name,
		tagline: snapshot.tagline,
		description: snapshot.description,
		website_url: snapshot.website_url,
		logo_url: snapshot.logo_url,
		profile_data: snapshot.profile_data ?? {},
		integration_customer_id: snapshot.integration_customer_id,
	};
}

function readPath(root: Record<string, unknown>, path: string): unknown {
	const segments = path.split('.').filter(Boolean);
	let current: unknown = root;
	for (const segment of segments) {
		if (!current || typeof current !== 'object') return undefined;
		current = (current as Record<string, unknown>)[segment];
	}
	return current;
}

/** Raw value at `profilePath` on a handoff snapshot (no comma-join normalization). */
export function readProfilePathRaw(
	snapshot: AutoLaunchProfileSnapshot,
	profilePath: string
): unknown {
	return readPath(buildProfileSnapshotRoot(snapshot), profilePath);
}

/**
 * String list at `profilePath` — arrays preserve composer order; a lone string becomes one item.
 */
export function resolveProfilePathArray(
	snapshot: AutoLaunchProfileSnapshot,
	profilePath: string
): string[] {
	const value = readProfilePathRaw(snapshot, profilePath);
	let items: string[];
	if (typeof value === 'string') {
		const trimmed = value.trim();
		items = trimmed ? [trimmed] : [];
	} else if (Array.isArray(value)) {
		items = value
			.map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry).trim()))
			.filter(Boolean);
	} else {
		items = [];
	}

	if (
		profilePath === 'profile_data.categories' &&
		items.length > BUSINESS_PROFILE_MAX_CATEGORIES
	) {
		return items.slice(0, BUSINESS_PROFILE_MAX_CATEGORIES);
	}

	return items;
}

function resolveProfilePoolScalar(raw: unknown): string | null {
	if (raw === null || raw === undefined) return null;
	if (typeof raw === 'string') {
		const trimmed = raw.trim();
		return trimmed ? trimmed : null;
	}
	if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
	return null;
}

function resolveProfilePoolBoolean(raw: unknown): boolean | null {
	if (raw === null || raw === undefined) return null;
	if (typeof raw === 'boolean') return raw;
	return null;
}

function fieldHasContent(resolved: ProfilePoolFieldResolved): boolean {
	switch (resolved.kind) {
		case 'string_array':
			return resolved.items.length > 0;
		case 'boolean':
			return resolved.booleanValue === true;
		default:
			return resolved.value !== null;
	}
}

function resolvePoolField(
	definition: ProfilePoolFieldDefinition,
	snapshot: AutoLaunchProfileSnapshot,
	highlightPaths: Set<string>
): ProfilePoolFieldResolved {
	const raw = readProfilePathRaw(snapshot, definition.profilePath);

	const base: ProfilePoolFieldResolved = {
		...definition,
		items: [],
		value: null,
		booleanValue: null,
		highlighted: highlightPaths.has(definition.profilePath),
	};

	if (definition.kind === 'string_array') {
		base.items = resolveProfilePathArray(snapshot, definition.profilePath);
		return base;
	}

	if (definition.kind === 'boolean') {
		base.booleanValue = resolveProfilePoolBoolean(raw);
		return base;
	}

	base.value = resolveProfilePoolScalar(raw);
	return base;
}

function sellSectionHasContent(fields: ProfilePoolFieldResolved[]): boolean {
	return fields.some((field) => fieldHasContent(field));
}

/** `profilePath` values from destination config that should be emphasized in the pools UI. */
export function highlightPathsForDestination(
	config: AutoLaunchExtensionConfig | null | undefined
): Set<string> {
	return new Set(collectProfilePathsFromExtensionConfig(config));
}

export type ListProfilePoolSectionsOptions = {
	/** Paths to mark as highlighted (e.g. from `highlightPathsForDestination`). */
	highlightPaths?: Iterable<string>;
	/** When set, highlight paths are derived from this destination config. */
	extensionConfig?: AutoLaunchExtensionConfig | null;
};

/**
 * Composer-aligned pool sections with values resolved from a profile snapshot.
 * The sell section is omitted when no sell-side fields have content.
 */
export function listProfilePoolSections(
	snapshot: AutoLaunchProfileSnapshot,
	options: ListProfilePoolSectionsOptions = {}
): ProfilePoolSection[] {
	const highlightPaths =
		options.highlightPaths !== undefined
			? new Set(options.highlightPaths)
			: options.extensionConfig !== undefined
				? highlightPathsForDestination(options.extensionConfig)
				: new Set<string>();

	const sections: ProfilePoolSection[] = [];

	for (const sectionId of PROFILE_POOL_SECTION_ORDER) {
		const definitions = PROFILE_POOL_CATALOG[sectionId];
		const fields = definitions.map((definition) =>
			resolvePoolField(definition, snapshot, highlightPaths)
		);

		if (sectionId === 'sell' && !sellSectionHasContent(fields)) {
			continue;
		}

		sections.push({
			id: sectionId,
			label: PROFILE_POOL_SECTION_LABELS[sectionId],
			fields,
		});
	}

	return sections;
}
