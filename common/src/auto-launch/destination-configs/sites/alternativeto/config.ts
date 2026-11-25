import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
	LaunchStepField,
} from '../../../../browser-extension/pageAssist.js';
import type { BusinessProfilePricingType } from '../../../businessProfileData.js';

/** AlternativeTo listing screenshots — up to five files in v1. */
export const ALTERNATIVETO_FORM_GALLERY_MAX = 5;

export const ALTERNATIVETO_HOST_PATTERNS = ['https://alternativeto.net/*'] as const;

export const ALTERNATIVETO_HOST_PERMISSION = '*://alternativeto.net/*';

const ALTERNATIVETO_CONTENT_SCRIPT_ENTRY =
	'content/directory-launch/openquok-directory-alternativeto.js';

const ALTERNATIVETO_LISTING_MANUAL_FIELDS_HINT =
	'Features, supported languages, suggest-as-alternative, post-submit paid upsell, and final Submit stay manual on AlternativeTo. Strip promo links from descriptions per AlternativeTo FAQ.';

const ALTERNATIVETO_LISTING_SIGN_IN_HINT =
	'Sign in on AlternativeTo (Google, GitHub, Apple, or email) with a verified email, then open manage-item.';

/** Shared manage-item form (`alternativeto.net/manage-item/`). Tiers differ only in readyStatusHint. */
export const ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...ALTERNATIVETO_HOST_PATTERNS],
	readyUrlHint: 'manage-item',
	readyStatusHint:
		ALTERNATIVETO_LISTING_SIGN_IN_HINT +
		' OpenQuok fills name, descriptions, website, tags, platforms, author, pricing, icon, screenshots, and YouTube promo video when set on the profile. ' +
		ALTERNATIVETO_LISTING_MANUAL_FIELDS_HINT,
	steps: [
		{
			id: 'main_info',
			label: 'Main info',
			fields: [
				{
					key: 'name',
					label: 'Name',
					labelAliases: ['Application name', 'Product name'],
					profilePath: 'name',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[name*='name' i], input[aria-label*='name' i], input[placeholder*='name' i]",
				},
				{
					key: 'tagline',
					label: 'Short description',
					labelAliases: ['Short Description', 'Short description', 'Tagline'],
					profilePath: 'tagline',
					fillMode: 'text',
					required: true,
					selectorHint:
						"textarea[aria-label*='short description' i], input[aria-label*='short description' i], textarea[name*='short' i]:not([name*='full' i]), input[name*='short' i], textarea[name='shortDescription' i]",
				},
				{
					key: 'website',
					label: 'Website',
					labelAliases: ['Website URL', 'Official website'],
					profilePath: 'website_url',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[type='url'], input[name*='website' i], input[aria-label*='website' i]",
				},
				{
					key: 'description',
					label: 'Full description',
					labelAliases: ['Full Description', 'Full description', 'Description', 'Long description'],
					profilePath: 'description',
					fillMode: 'rich_html',
					required: true,
					selectorHint:
						"textarea[aria-label*='full description' i], textarea[name*='full' i], textarea[name='description' i], textarea[name*='description' i]:not([name*='short' i]), [contenteditable='true'][aria-label*='full description' i], .ProseMirror, .tiptap",
				},
			],
		},
		{
			id: 'tags',
			label: 'Tags',
			fields: [
				{
					key: 'tags',
					label: 'Tags',
					profilePath: 'profile_data.tags',
					profileSourcePaths: [
						'profile_data.categories',
						'profile_data.use_cases',
						'profile_data.platforms',
					],
					fillMode: 'tags',
					labelMatch: 'section',
					tagsScope: 'section',
					required: true,
					selectorHint:
						"input[role='combobox'], input[name*='tag' i], input[placeholder*='tag' i], [aria-label*='tag' i]",
				},
			],
		},
		{
			id: 'platforms',
			label: 'Platforms',
			fields: [
				{
					key: 'platforms',
					label: 'Platforms',
					profilePath: 'profile_data.platforms',
					fillMode: 'checkbox_group',
					checkboxCatalog: 'alternativeto_platforms',
					labelMatch: 'section',
					required: true,
					selectorHint:
						"input[type='checkbox'][name*='platform' i], fieldset input[type='checkbox'], [aria-label*='platform' i] input[type='checkbox']",
				},
			],
		},
		{
			id: 'author',
			label: 'Company / Author',
			fields: [
				{
					key: 'author',
					label: 'Company / Author',
					labelAliases: ['Company', 'Author'],
					profilePath: 'name',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[name*='company' i], input[name*='author' i], input[aria-label*='company' i], input[aria-label*='author' i]",
				},
				{
					key: 'social_x',
					label: 'X (Twitter)',
					labelAliases: ['Twitter'],
					profilePath: 'profile_data.social_x',
					fillMode: 'text',
					socialScalar: 'username',
					selectorHint:
						"input[name*='twitter' i], input[name*='x.com' i], input[aria-label*='twitter' i]",
				},
			],
		},
		{
			id: 'pricing',
			label: 'Pricing / license',
			fields: [
				{
					key: 'pricing_type',
					label: 'Pricing / license',
					labelAliases: ['License', 'Pricing'],
					profilePath: 'profile_data.pricing_type',
					fillMode: 'select',
					selectCatalog: 'alternativeto_license',
					required: true,
					selectorHint:
						"input[type='radio'][name*='license' i], input[type='radio'][name*='pricing' i], select[name*='license' i]",
				},
				{
					key: 'is_open_source',
					label: 'Open source',
					profilePath: 'profile_data.is_open_source',
					fillMode: 'boolean',
					selectorHint:
						"input[type='checkbox'][name*='open' i], input[type='radio'][value*='open source' i], [role='switch'][aria-label*='open source' i]",
				},
			],
		},
		{
			id: 'media',
			label: 'Media',
			fields: [
				{
					key: 'logo',
					label: 'Application icon',
					labelAliases: ['Icon', 'Logo'],
					profilePath: 'logo_url',
					fillMode: 'file',
					required: true,
					selectorHint:
						"input[type='file'][accept*='image'], input[type='file'][name*='icon' i], input[type='file'][name*='logo' i]",
				},
				{
					key: 'gallery',
					label: 'Screenshots',
					labelAliases: ['Screenshot', 'Gallery'],
					profilePath: 'profile_data.gallery_urls',
					fillMode: 'files',
					fileInputIndex: 1,
					maxItems: ALTERNATIVETO_FORM_GALLERY_MAX,
					selectorHint:
						"input[type='file'][multiple], input[type='file'][name*='screenshot' i]",
				},
			],
		},
		{
			id: 'videos',
			label: 'Videos',
			fields: [
				{
					key: 'launch_video_url',
					label: 'Add a new video URL',
					labelAliases: ['Videos', 'Video', 'YouTube'],
					profilePath: 'profile_data.launch_video_url',
					fillMode: 'text',
					selectorHint:
						"input[type='url'][aria-label*='video' i], input[type='url'][name*='video' i], input[placeholder*='youtube' i]",
				},
			],
		},
	],
	proof: {
		successPathRegex: '/software/|/manage-item/',
		listingUrlSelector: "a[href*='alternativeto.net/software/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const ALTERNATIVETO_FREE_LISTING_EXTENSION_CONFIG = {
	...ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		ALTERNATIVETO_LISTING_SIGN_IN_HINT +
		' OpenQuok fills the listing cards for a free-queue submission. After you submit, skip Priority Review ($15) and We finish it ($29) if you want the free backlog. ' +
		ALTERNATIVETO_LISTING_MANUAL_FIELDS_HINT,
} as const satisfies AutoLaunchExtensionConfig;

export const ALTERNATIVETO_PRIORITY_REVIEW_EXTENSION_CONFIG = {
	...ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		ALTERNATIVETO_LISTING_SIGN_IN_HINT +
		' OpenQuok fills manage-item; submit the application, then pay $15 for Priority Review on AlternativeTo (checkout stays manual). ' +
		ALTERNATIVETO_LISTING_MANUAL_FIELDS_HINT,
} as const satisfies AutoLaunchExtensionConfig;

export const ALTERNATIVETO_FINISH_LISTING_EXTENSION_CONFIG = {
	...ALTERNATIVETO_LISTING_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		ALTERNATIVETO_LISTING_SIGN_IN_HINT +
		' OpenQuok prefills core listing fields; submit, then pay $29 for We finish it on AlternativeTo so their team completes remaining fields. ' +
		ALTERNATIVETO_LISTING_MANUAL_FIELDS_HINT,
} as const satisfies AutoLaunchExtensionConfig;

/** User profile (`alternativeto.net/user/edit/`). */
export const ALTERNATIVETO_USER_PROFILE_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...ALTERNATIVETO_HOST_PATTERNS],
	readyUrlHint: 'user/edit',
	readyStatusHint:
		'Sign in on AlternativeTo and open user edit. OpenQuok fills social handles (no full URLs where AlternativeTo expects usernames) and your LinkedIn profile URL. Reddit is not mapped in OpenQuok v1 — add it manually if needed.',
	steps: [
		{
			id: 'profile_socials',
			label: 'Social links',
			fields: [
				{
					key: 'social_x',
					label: 'Twitter',
					labelAliases: ['X', 'X (Twitter)'],
					profilePath: 'profile_data.social_x',
					fillMode: 'text',
					socialScalar: 'username',
					selectorHint:
						"input[name*='twitter' i], input[aria-label*='twitter' i], input[placeholder*='twitter' i]",
				},
				{
					key: 'social_github',
					label: 'GitHub',
					profilePath: 'profile_data.social_github',
					profileSourcePaths: ['profile_data.repository_url'],
					fillMode: 'text',
					socialScalar: 'username',
					selectorHint: "input[name*='github' i], input[aria-label*='github' i]",
				},
				{
					key: 'social_instagram',
					label: 'Instagram',
					profilePath: 'profile_data.social_instagram',
					fillMode: 'text',
					socialScalar: 'username',
					selectorHint: "input[name*='instagram' i], input[aria-label*='instagram' i]",
				},
				{
					key: 'social_youtube',
					label: 'YouTube',
					profilePath: 'profile_data.social_youtube',
					fillMode: 'text',
					socialScalar: 'username',
					selectorHint: "input[name*='youtube' i], input[aria-label*='youtube' i]",
				},
				{
					key: 'social_linkedin',
					label: 'LinkedIn',
					profilePath: 'profile_data.social_linkedin',
					fillMode: 'text',
					selectorHint: "input[name*='linkedin' i], input[type='url'][aria-label*='linkedin' i]",
				},
			],
		},
	],
	proof: {
		successPathRegex: '/user/',
		listingUrlSelector: "a[href*='alternativeto.net/user/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

const ALTERNATIVETO_FREE_LISTING: DirectoryLaunchProvider = {
	identifier: 'alternativeto-free-listing',
	name: 'AlternativeTo — Free listing',
	tierLabel: 'Free',
	defaultStartUrl: 'https://alternativeto.net/manage-item/',
	contentScriptEntry: ALTERNATIVETO_CONTENT_SCRIPT_ENTRY,
	hostPatterns: ALTERNATIVETO_HOST_PATTERNS,
	hostPermission: ALTERNATIVETO_HOST_PERMISSION,
};

const ALTERNATIVETO_PRIORITY_REVIEW: DirectoryLaunchProvider = {
	identifier: 'alternativeto-priority-review',
	name: 'AlternativeTo — Priority review',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://alternativeto.net/manage-item/',
	contentScriptEntry: ALTERNATIVETO_CONTENT_SCRIPT_ENTRY,
	hostPatterns: ALTERNATIVETO_HOST_PATTERNS,
	hostPermission: ALTERNATIVETO_HOST_PERMISSION,
};

const ALTERNATIVETO_FINISH_LISTING: DirectoryLaunchProvider = {
	identifier: 'alternativeto-finish-listing',
	name: 'AlternativeTo — We finish it',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://alternativeto.net/manage-item/',
	contentScriptEntry: ALTERNATIVETO_CONTENT_SCRIPT_ENTRY,
	hostPatterns: ALTERNATIVETO_HOST_PATTERNS,
	hostPermission: ALTERNATIVETO_HOST_PERMISSION,
};

const ALTERNATIVETO_USER_PROFILE: DirectoryLaunchProvider = {
	identifier: 'alternativeto-user-profile',
	name: 'AlternativeTo — User profile',
	tierLabel: 'Free',
	defaultStartUrl: 'https://alternativeto.net/user/edit/',
	contentScriptEntry: ALTERNATIVETO_CONTENT_SCRIPT_ENTRY,
	hostPatterns: ALTERNATIVETO_HOST_PATTERNS,
	hostPermission: ALTERNATIVETO_HOST_PERMISSION,
};

export const ALTERNATIVETO_DIRECTORY_LAUNCH_PROVIDERS = [
	ALTERNATIVETO_FREE_LISTING,
	ALTERNATIVETO_PRIORITY_REVIEW,
	ALTERNATIVETO_FINISH_LISTING,
	ALTERNATIVETO_USER_PROFILE,
] as const satisfies readonly DirectoryLaunchProvider[];

// --- AlternativeTo platforms — `checkboxCatalog: alternativeto_platforms` ---

export const ALTERNATIVETO_OFFICIAL_PLATFORM_LABELS = [
	'Online',
	'SaaS',
	'Windows',
	'Mac',
	'Linux',
	'Android',
	'iPhone',
	'iPad',
	'Chrome OS',
	'BSD',
	'Self-Hosted',
] as const;

export type AlternativetoOfficialPlatformLabel =
	(typeof ALTERNATIVETO_OFFICIAL_PLATFORM_LABELS)[number];

const ALTERNATIVETO_PLATFORM_ALIASES: Record<string, AlternativetoOfficialPlatformLabel> = {
	online: 'Online',
	saas: 'SaaS',
	web: 'Online',
	'web app': 'Online',
	'web apps': 'Online',
	windows: 'Windows',
	win: 'Windows',
	mac: 'Mac',
	macos: 'Mac',
	'mac os': 'Mac',
	linux: 'Linux',
	android: 'Android',
	iphone: 'iPhone',
	ios: 'iPhone',
	ipad: 'iPad',
	'chrome os': 'Chrome OS',
	chromeos: 'Chrome OS',
	bsd: 'BSD',
	'self hosted': 'Self-Hosted',
	'self-hosted': 'Self-Hosted',
};

function normalizeAlternativetoPlatformKey(raw: string): string {
	return raw.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

export function matchAlternativetoOfficialPlatform(raw: string): AlternativetoOfficialPlatformLabel | null {
	const key = normalizeAlternativetoPlatformKey(raw);
	if (!key) return null;
	const fromAlias = ALTERNATIVETO_PLATFORM_ALIASES[key];
	if (fromAlias) return fromAlias;
	for (const label of ALTERNATIVETO_OFFICIAL_PLATFORM_LABELS) {
		if (normalizeAlternativetoPlatformKey(label) === key) return label;
	}
	return null;
}

export function filterToAlternativetoOfficialPlatforms(items: readonly string[]): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const item of items) {
		const official = matchAlternativetoOfficialPlatform(item);
		if (!official || seen.has(official)) continue;
		seen.add(official);
		out.push(official);
	}
	return out;
}

// --- AlternativeTo license — `selectCatalog: alternativeto_license` ---

export const ALTERNATIVETO_OFFICIAL_LICENSE_LABELS = [
	'Free',
	'Freemium',
	'Commercial',
	'Open Source',
] as const;

export type AlternativetoOfficialLicenseLabel = (typeof ALTERNATIVETO_OFFICIAL_LICENSE_LABELS)[number];

function normalizeAlternativetoLicenseKey(raw: string): string {
	return raw.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

export function matchAlternativetoOfficialLicense(raw: string): AlternativetoOfficialLicenseLabel | null {
	const key = normalizeAlternativetoLicenseKey(raw);
	for (const label of ALTERNATIVETO_OFFICIAL_LICENSE_LABELS) {
		if (normalizeAlternativetoLicenseKey(label) === key) return label;
	}
	if (key === 'paid' || key === 'subscription' || key === 'one time') return 'Commercial';
	return null;
}

/** Map OpenQuok pricing type (and open-source flag) to AlternativeTo license labels. */
export function coerceToAlternativetoOfficialLicense(
	raw: string,
	options?: { isOpenSource?: boolean | null }
): string {
	if (options?.isOpenSource === true) return 'Open Source';
	const matched = matchAlternativetoOfficialLicense(raw);
	if (matched) return matched;
	const norm = normalizeAlternativetoLicenseKey(raw);
	if (norm === 'free') return 'Free';
	if (norm === 'freemium') return 'Freemium';
	if (norm === 'paid') return 'Commercial';
	return raw.trim();
}

export function mapBusinessProfilePricingToAlternativetoLicense(
	pricingType: BusinessProfilePricingType | string | null | undefined,
	isOpenSource?: boolean | null
): AlternativetoOfficialLicenseLabel | null {
	if (isOpenSource === true) return 'Open Source';
	if (pricingType === 'free') return 'Free';
	if (pricingType === 'freemium') return 'Freemium';
	if (pricingType === 'paid') return 'Commercial';
	return null;
}

export function alternativetoSelectCatalogOptions(
	catalog: LaunchStepField['selectCatalog']
): readonly string[] {
	if (catalog === 'alternativeto_license') return ALTERNATIVETO_OFFICIAL_LICENSE_LABELS;
	return [];
}