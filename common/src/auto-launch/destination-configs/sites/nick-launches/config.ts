import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
	LaunchStepField,
} from '../../../../browser-extension/pageAssist.js';

/** Nick Launches listing screenshots accept up to five files. */
export const NICK_LAUNCHES_FORM_GALLERY_MAX = 5;

/** Nick Launches listing categories accept up to three names. */
export const NICK_LAUNCHES_FORM_CATEGORY_MAX = 3;

/** Nick Launches “How people use your product” tag combobox accepts up to three labels. */
export const NICK_LAUNCHES_FORM_USE_CASE_TAG_MAX = 3;

const NICK_LAUNCHES_LISTING_WEBSITE_SELECTOR =
	"input[name='url'], input[type='url'][name='url']";

const NICK_LAUNCHES_LISTING_CATEGORY_SELECTOR =
	"[data-field='categories'] input[role='combobox'], [data-field='categories'] input[placeholder*='categor' i], input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]";

const NICK_LAUNCHES_LISTING_USE_CASE_TAGS_SELECTOR =
	"[data-field='useCases'] input[role='combobox'], [data-field='useCases'] input[placeholder*='use case' i], input[placeholder*='Add use cases' i]";

const NICK_LAUNCHES_LISTING_USE_CASE_TEXT_SELECTOR =
	"textarea[name='useCases'], textarea[aria-label*='Use cases' i]";

export const NICK_LAUNCHES_HOST_PATTERNS = ['https://nicklaunches.com/*'] as const;

export const NICK_LAUNCHES_HOST_PERMISSION = '*://nicklaunches.com/*';

const NICK_LAUNCHES_CONTENT_SCRIPT_ENTRY =
	'content/directory-launch/openquok-directory-nick-launches.js';

const NICK_LAUNCHES_LISTING_URL_PREFILL_HINT =
	'If Nick Launches prefills a draft from your website URL, skip or review it before OpenQuok fills the form.';

const NICK_LAUNCHES_LISTING_MANUAL_FIELDS_HINT =
	'Target keyword, discount, first comment, launch date, and slug stay manual.';

/** Shared listing form (`nicklaunches.com/submit/new/`). Free and paid differ only in status copy. */
export const NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...NICK_LAUNCHES_HOST_PATTERNS],
	readyUrlHint: 'submit/new',
	readyStatusHint:
		'Sign in on Nick Launches, then open the new listing form. ' +
		NICK_LAUNCHES_LISTING_URL_PREFILL_HINT +
		' Weekly upvotes and a live Featured badge are required for the free dofollow path. Launch week and admin review stay manual. ' +
		NICK_LAUNCHES_LISTING_MANUAL_FIELDS_HINT +
		' Plan selection happens after this form.',
	steps: [
		{
			id: 'submit_listing',
			label: 'Submit listing',
			fields: [
				{
					key: 'logo',
					label: 'Logo',
					profilePath: 'logo_url',
					fillMode: 'file',
					fileInputIndex: 0,
					required: true,
					selectorHint:
						"input[type='file'][name*='logo' i], input[type='file'][accept*='image']",
				},
				{
					key: 'gallery',
					label: 'Screenshots',
					labelAliases: ['Gallery'],
					profilePath: 'profile_data.gallery_urls',
					fillMode: 'files',
					fileInputIndex: 0,
					maxItems: NICK_LAUNCHES_FORM_GALLERY_MAX,
					required: true,
					selectorHint:
						"input[type='file'][name*='screenshot' i], input[type='file'][multiple]",
				},
				{
					key: 'name',
					label: 'Name',
					labelAliases: ['Product name'],
					profilePath: 'name',
					fillMode: 'text',
					required: true,
					selectorHint: "input[name='name'], input[aria-label*='name' i], input[placeholder*='name' i]",
				},
				{
					key: 'tagline',
					label: 'Tagline',
					profilePath: 'tagline',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[name='tagline'], textarea[name='tagline'], input[placeholder*='tagline' i]",
				},
				{
					key: 'description',
					label: 'Description',
					profilePath: 'description',
					fillMode: 'rich_html',
					required: true,
					selectorHint:
						"textarea[name='description'], [contenteditable='true'], .ProseMirror, .tiptap",
				},
				{
					key: 'website',
					label: 'Website URL',
					labelAliases: ['URL', 'Website'],
					profilePath: 'website_url',
					fillMode: 'text',
					required: true,
					selectorHint: NICK_LAUNCHES_LISTING_WEBSITE_SELECTOR,
				},
				{
					key: 'categories',
					label: 'Categories',
					profilePath: 'profile_data.categories',
					fillMode: 'tags',
					tagsCatalog: 'nick_launches_categories',
					labelMatch: 'section',
					tagsScope: 'section',
					maxItems: NICK_LAUNCHES_FORM_CATEGORY_MAX,
					required: true,
					selectorHint: NICK_LAUNCHES_LISTING_CATEGORY_SELECTOR,
				},
				{
					key: 'use_cases',
					label: 'Use cases',
					labelAliases: ['How people use your product', 'Use Cases'],
					profilePath: 'profile_data.use_cases',
					fillMode: 'tags',
					labelMatch: 'section',
					tagsScope: 'section',
					maxItems: NICK_LAUNCHES_FORM_USE_CASE_TAG_MAX,
					selectorHint: NICK_LAUNCHES_LISTING_USE_CASE_TAGS_SELECTOR,
				},
				{
					key: 'use_case_lines',
					label: 'Use cases',
					labelAliases: ['Use case descriptions'],
					profilePath: 'profile_data.use_cases',
					fillMode: 'text',
					selectorHint: NICK_LAUNCHES_LISTING_USE_CASE_TEXT_SELECTOR,
				},
				{
					key: 'pricing_type',
					label: 'Pricing',
					profilePath: 'profile_data.pricing_type',
					fillMode: 'select',
					selectCatalog: 'nick_launches_pricing',
					required: true,
					selectorHint:
						"select[name='pricing'], select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i], input[name='pricing']",
				},
				{
					key: 'is_open_source',
					label: 'Open source',
					profilePath: 'profile_data.is_open_source',
					fillMode: 'boolean',
					selectorHint:
						"input[type='checkbox'][name*='openSource' i], input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i], [role='checkbox'][aria-label*='open source' i]",
				},
				{
					key: 'social_x',
					label: 'X (Twitter)',
					labelAliases: ['Twitter', 'Twitter username'],
					profilePath: 'profile_data.social_x',
					fillMode: 'text',
					socialScalar: 'username',
					selectorHint:
						"input[name='twitterUsername'], input[name*='twitter' i], input[placeholder*='twitter' i], input[aria-label*='twitter' i]",
				},
				{
					key: 'demo_video',
					label: 'Demo video URL',
					labelAliases: ['Demo video'],
					profilePath: 'profile_data.launch_video_url',
					fillMode: 'text',
					selectorHint:
						"input[name='demoVideoUrl'], input[name*='demo' i], input[placeholder*='video' i], input[type='url'][name*='video' i]",
				},
			],
		},
	],
	proof: {
		successPathRegex: '/products/',
		listingUrlSelector: "a[href*='nicklaunches.com/products/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const NICK_LAUNCHES_FREE_LAUNCH_EXTENSION_CONFIG = {
	...NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		'Sign in on Nick Launches, then open the new listing form for a free launch. ' +
		NICK_LAUNCHES_LISTING_URL_PREFILL_HINT +
		' Weekly upvotes and a live Featured badge are required for the free dofollow path. Launch week and admin review stay manual. ' +
		NICK_LAUNCHES_LISTING_MANUAL_FIELDS_HINT +
		' Plan selection happens after this form.',
} as const satisfies AutoLaunchExtensionConfig;

export const NICK_LAUNCHES_PAID_LAUNCH_EXTENSION_CONFIG = {
	...NICK_LAUNCHES_LISTING_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		'Sign in on Nick Launches, then open the new listing form. ' +
		NICK_LAUNCHES_LISTING_URL_PREFILL_HINT +
		' Paid tiers are a one-time charge ($19, $39, $99, or $199) chosen on the plan step after this form; checkout stays manual. The Featured badge is optional on paid tiers. Admin review is always required. ' +
		NICK_LAUNCHES_LISTING_MANUAL_FIELDS_HINT,
} as const satisfies AutoLaunchExtensionConfig;

/** Maker profile (`nicklaunches.com/profile/`). */
export const NICK_LAUNCHES_MAKER_PROFILE_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...NICK_LAUNCHES_HOST_PATTERNS],
	readyUrlHint: 'profile',
	readyStatusHint:
		'Sign in on Nick Launches and open your maker profile. OpenQuok fills headline, bio, website, avatar, and X, GitHub, LinkedIn, and YouTube when those profile fields are set. First name, last name, handle, banner, city, country, calendar, Twitch, and Product Hunt stay manual.',
	steps: [
		{
			id: 'profile_info',
			label: 'Profile',
			fields: [
				{
					key: 'name',
					label: 'Display name',
					profilePath: 'name',
					fillMode: 'text',
					selectorHint:
						"input[name='name'], input[aria-label*='display name' i], input[placeholder*='display name' i]",
				},
				{
					key: 'headline',
					label: 'Headline',
					profilePath: 'tagline',
					fillMode: 'text',
					selectorHint:
						"input[name='headline'], textarea[name='headline'], input[aria-label*='headline' i]",
				},
				{
					key: 'bio',
					label: 'Bio',
					profilePath: 'description',
					fillMode: 'text',
					selectorHint: "textarea[name='bio'], textarea[aria-label*='bio' i]",
				},
				{
					key: 'website',
					label: 'Website',
					profilePath: 'website_url',
					fillMode: 'text',
					selectorHint:
						"input[name='website'], input[type='url'], input[aria-label*='website' i]",
				},
				{
					key: 'avatar',
					label: 'Avatar',
					profilePath: 'logo_url',
					fillMode: 'file',
					fileInputIndex: 0,
					selectorHint:
						"input[type='file'][name*='avatar' i], input[type='file'][accept*='image']",
				},
				{
					key: 'social_x',
					label: 'X (Twitter)',
					labelAliases: ['Twitter', 'X'],
					profilePath: 'profile_data.social_x',
					fillMode: 'text',
					socialScalar: 'username',
					selectorHint:
						"input[name='socials.x'], input[name*='twitter' i], input[aria-label*='twitter' i], input[placeholder*='x.com' i]",
				},
				{
					key: 'social_github',
					label: 'GitHub',
					profilePath: 'profile_data.social_github',
					profileSourcePaths: ['profile_data.repository_url'],
					fillMode: 'text',
					selectorHint: "input[name='socials.github'], input[name*='github' i]",
				},
				{
					key: 'social_linkedin',
					label: 'LinkedIn',
					profilePath: 'profile_data.social_linkedin',
					fillMode: 'text',
					selectorHint: "input[name='socials.linkedin'], input[name*='linkedin' i]",
				},
				{
					key: 'social_youtube',
					label: 'YouTube',
					profilePath: 'profile_data.social_youtube',
					fillMode: 'text',
					selectorHint: "input[name='socials.youtube'], input[name*='youtube' i]",
				},
			],
		},
	],
	proof: {
		successPathRegex: '/profile|/builders/',
		listingUrlSelector:
			"a[href*='nicklaunches.com/builders/'], a[href*='nicklaunches.com/profile']",
	},
} as const satisfies AutoLaunchExtensionConfig;

const NICK_LAUNCHES_FREE_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'nick-launches-free-launch',
	name: 'Nick Launches — Free launch',
	tierLabel: 'Free',
	defaultStartUrl: 'https://nicklaunches.com/submit/new/',
	contentScriptEntry: NICK_LAUNCHES_CONTENT_SCRIPT_ENTRY,
	hostPatterns: NICK_LAUNCHES_HOST_PATTERNS,
	hostPermission: NICK_LAUNCHES_HOST_PERMISSION,
};

const NICK_LAUNCHES_PAID_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'nick-launches-paid-launch',
	name: 'Nick Launches — Paid launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://nicklaunches.com/submit/new/',
	contentScriptEntry: NICK_LAUNCHES_CONTENT_SCRIPT_ENTRY,
	hostPatterns: NICK_LAUNCHES_HOST_PATTERNS,
	hostPermission: NICK_LAUNCHES_HOST_PERMISSION,
};

const NICK_LAUNCHES_MAKER_PROFILE: DirectoryLaunchProvider = {
	identifier: 'nick-launches-maker-profile',
	name: 'Nick Launches — Maker profile',
	tierLabel: 'Free',
	defaultStartUrl: 'https://nicklaunches.com/profile/',
	contentScriptEntry: NICK_LAUNCHES_CONTENT_SCRIPT_ENTRY,
	hostPatterns: NICK_LAUNCHES_HOST_PATTERNS,
	hostPermission: NICK_LAUNCHES_HOST_PERMISSION,
};

export const NICK_LAUNCHES_DIRECTORY_LAUNCH_PROVIDERS = [
	NICK_LAUNCHES_FREE_LAUNCH,
	NICK_LAUNCHES_PAID_LAUNCH,
	NICK_LAUNCHES_MAKER_PROFILE,
] as const satisfies readonly DirectoryLaunchProvider[];

// --- Nick Launches categories — `tagsCatalog: 'nick_launches_categories'` ---
// Names from GET https://nicklaunches.com/api/v1/categories (2026-11-25). Duplicate lowercase names that share a slug are omitted.

type NickLaunchesCategory = { readonly name: string; readonly slug: string };

export const NICK_LAUNCHES_OFFICIAL_CATEGORIES = [
	{ name: 'Productivity', slug: 'productivity' },
	{ name: 'AI', slug: 'ai' },
	{ name: 'Marketing', slug: 'marketing' },
	{ name: 'Other', slug: 'other' },
	{ name: 'Developer Tools', slug: 'developer-tools' },
	{ name: 'Communication', slug: 'communication' },
	{ name: 'Content Creation', slug: 'content-creation' },
	{ name: 'Analytics', slug: 'analytics' },
	{ name: 'E-Commerce', slug: 'e-commerce' },
	{ name: 'Education', slug: 'education' },
	{ name: 'SEO', slug: 'seo' },
	{ name: 'Design Tools', slug: 'design-tools' },
	{ name: 'Social Media', slug: 'social-media' },
	{ name: 'Finance', slug: 'finance' },
	{ name: 'Launch Platforms', slug: 'launch-platforms' },
	{ name: 'Lifestyle', slug: 'lifestyle' },
	{ name: 'Health & Fitness', slug: 'health-and-fitness' },
	{ name: 'Data', slug: 'data' },
	{ name: 'Video', slug: 'video' },
	{ name: 'Image', slug: 'image' },
	{ name: 'Sales', slug: 'sales' },
	{ name: 'Gaming', slug: 'gaming' },
	{ name: 'Security', slug: 'security' },
	{ name: 'Monitoring', slug: 'monitoring' },
	{ name: 'Jobs & Careers', slug: 'jobs-and-careers' },
	{ name: 'Writing', slug: 'writing' },
	{ name: 'Open Source', slug: 'open-source' },
	{ name: 'HR & Recruiting', slug: 'hr-and-recruiting' },
	{ name: 'Travel', slug: 'travel' },
	{ name: 'No Code', slug: 'no-code' },
	{ name: 'Search', slug: 'search' },
	{ name: 'CMS', slug: 'cms' },
	{ name: 'DevOps', slug: 'devops' },
	{ name: 'Legal', slug: 'legal' },
	{ name: 'Web3', slug: 'web3' },
	{ name: 'Food & Drink', slug: 'food-and-drink' },
	{ name: 'Music', slug: 'music' },
	{ name: 'Sustainability', slug: 'sustainability' },
	{ name: 'AI Tools', slug: 'ai-tools' },
	{ name: 'Photography', slug: 'photography' },
] as const satisfies readonly NickLaunchesCategory[];

export const NICK_LAUNCHES_OFFICIAL_CATEGORY_LABELS = NICK_LAUNCHES_OFFICIAL_CATEGORIES.map(
	(category) => category.name
);

export type NickLaunchesOfficialCategoryLabel = (typeof NICK_LAUNCHES_OFFICIAL_CATEGORIES)[number]['name'];

function normalizeNickLaunchesCategoryKey(raw: string): string {
	return raw
		.trim()
		.replace(/&/g, ' and ')
		.replace(/[_/]+/g, ' ')
		.replace(/[-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.toLowerCase();
}

const nickLaunchesCategoryByKey = new Map<string, string>();
for (const category of NICK_LAUNCHES_OFFICIAL_CATEGORIES) {
	nickLaunchesCategoryByKey.set(normalizeNickLaunchesCategoryKey(category.name), category.name);
	nickLaunchesCategoryByKey.set(normalizeNickLaunchesCategoryKey(category.slug), category.name);
}

export function matchNickLaunchesOfficialCategory(raw: string): string | null {
	const key = normalizeNickLaunchesCategoryKey(raw);
	if (!key) return null;
	return nickLaunchesCategoryByKey.get(key) ?? null;
}

/** Map profile chips to official Nick Launches category names. */
export function filterToNickLaunchesOfficialCategories(items: readonly string[]): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const item of items) {
		const official = matchNickLaunchesOfficialCategory(item);
		if (!official || seen.has(official)) continue;
		seen.add(official);
		out.push(official);
	}
	return out;
}

// --- Nick Launches pricing — `selectCatalog: 'nick_launches_pricing'` ---

/** Listing pricing enum: free, freemium, paid, subscription, one_time, contact. */
export const NICK_LAUNCHES_OFFICIAL_PRICING_VALUES = [
	'free',
	'freemium',
	'paid',
	'subscription',
	'one_time',
	'contact',
] as const;

export type NickLaunchesOfficialPricingValue = (typeof NICK_LAUNCHES_OFFICIAL_PRICING_VALUES)[number];

function normalizeNickLaunchesPricingKey(raw: string): string {
	return raw.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

const NICK_LAUNCHES_PRICING_ALIASES: Record<string, NickLaunchesOfficialPricingValue> = {
	free: 'free',
	freemium: 'freemium',
	paid: 'paid',
	subscription: 'subscription',
	'one time': 'one_time',
	'one time fee': 'one_time',
	onetime: 'one_time',
	contact: 'contact',
};

export function matchNickLaunchesOfficialPricing(raw: string): NickLaunchesOfficialPricingValue | null {
	const key = normalizeNickLaunchesPricingKey(raw);
	return NICK_LAUNCHES_PRICING_ALIASES[key] ?? null;
}

export function coerceToNickLaunchesOfficialPricing(raw: string): string {
	return matchNickLaunchesOfficialPricing(raw) ?? raw.trim();
}

export function nickLaunchesSelectCatalogOptions(
	catalog: LaunchStepField['selectCatalog']
): readonly string[] {
	if (catalog === 'nick_launches_pricing') return NICK_LAUNCHES_OFFICIAL_PRICING_VALUES;
	return [];
}
