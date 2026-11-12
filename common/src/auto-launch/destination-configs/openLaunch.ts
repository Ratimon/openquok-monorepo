import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
	LaunchStepField,
} from '../../browser-extension/pageAssist.js';

/** Open Launch directory launch — open-launch.com wizard. */
/** Readable mirror of `auto_launch_destinations.extension_config` for SQL seed parity (drift-tested). */
export const OPEN_LAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG = {
	"version": 1,
	"startUrlPatterns": [
		"https://open-launch.com/*",
		"https://www.open-launch.com/*",
	],
	"readyUrlHint": "submit",
	"steps": [
		{
			"id": "project_info",
			"label": "Project Info",
			"fields": [
				{
					"key": "name",
					"label": "Project name",
					"profilePath": "name",
					"fillMode": "text",
					"selectorHint": "input[name*='name' i], input[placeholder*='project name' i], input[aria-label*='name' i]",
				},
				{
					"key": "website",
					"label": "Website URL",
					"profilePath": "website_url",
					"fillMode": "text",
					"selectorHint": "input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]",
				},
				{
					"key": "description",
					"label": "Short description",
					"profilePath": "description",
					"fillMode": "rich_html",
					"selectorHint": "[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]",
				},
				{
					"key": "logo",
					"label": "Logo",
					"profilePath": "logo_url",
					"fillMode": "file",
					"fileInputIndex": 0,
					"selectorHint": "input[type='file'][accept*='image']",
				},
				{
					"key": "product_image",
					"label": "Product image",
					"profilePath": "profile_data.gallery_urls",
					"fillMode": "files",
					"fileInputIndex": 1,
					"selectorHint": "input[type='file'][accept*='image']",
				},
			],
		},
		{
			"id": "details",
			"label": "Details",
			"fields": [
				{
					"key": "categories",
					"label": "Categories",
					"profilePath": "profile_data.categories",
					"fillMode": "checkbox_group",
					"checkboxCatalog": "open_launch_categories",
					"labelMatch": "section",
					"maxItems": 3,
				},
				{
					"key": "tech_stack",
					"label": "Tech stack",
					"profilePath": "profile_data.tech_stack",
					"fillMode": "tags",
					"maxItems": 5,
					"selectorHint": "input[name*='tech' i], input[placeholder*='technology' i], [placeholder*='tech' i], [aria-label*='tech stack' i], [aria-label*='stack' i]",
				},
				{
					"key": "platforms",
					"label": "Platforms",
					"profilePath": "profile_data.platforms",
					"fillMode": "checkbox_group",
					"checkboxCatalog": "open_launch_platforms",
					"labelMatch": "section",
				},
				{
					"key": "pricing_type",
					"label": "Pricing model",
					"profilePath": "profile_data.pricing_type",
					"fillMode": "select",
					"selectCatalog": "open_launch_pricing",
					"selectorHint": "input[type='radio'][name*='pricing' i], input[type='radio'][id*='pricing' i], select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]",
				},
				{
					"key": "social_github",
					"label": "GitHub",
					"profilePath": "profile_data.social_github",
					"fillMode": "text",
					"selectorHint": "input[name*='github' i], input[placeholder*='github' i], input[aria-label*='github' i]",
					"profileSourcePaths": ["profile_data.repository_url"],
				},
				{
					"key": "social_x",
					"label": "X (Twitter)",
					"profilePath": "profile_data.social_x",
					"fillMode": "text",
					"selectorHint": "input[name*='twitter' i], input[name*='x.com' i], input[placeholder*='twitter' i], input[aria-label*='twitter' i]",
				},
			],
		},
	],
	"proof": {
		"successPathRegex": "/projects/|/submit",
		"listingUrlSelector": "a[href*='open-launch.com/projects/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const OPEN_LAUNCH_FREE_LAUNCH_EXTENSION_CONFIG = {
	...OPEN_LAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG,
	readyUrlHint: 'pricing',
} as const satisfies AutoLaunchExtensionConfig;

export const OPEN_LAUNCH_HOST_PATTERNS = [
	'https://open-launch.com/*',
	'https://www.open-launch.com/*',
] as const;

export const OPEN_LAUNCH_HOST_PERMISSION = '*://*.open-launch.com/*';

const OPEN_LAUNCH_PREMIUM_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'open-launch-premium-launch',
	name: 'Open Launch — Premium launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://open-launch.com/projects/submit',
	contentScriptEntry: 'content/directory-launch/openquok-directory-open-launch.js',
	hostPatterns: OPEN_LAUNCH_HOST_PATTERNS,
	hostPermission: OPEN_LAUNCH_HOST_PERMISSION,
};

const OPEN_LAUNCH_FREE_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'open-launch-free-launch',
	name: 'Open Launch — Free launch',
	tierLabel: 'Free',
	defaultStartUrl: 'https://open-launch.com/dashboard',
	contentScriptEntry: 'content/directory-launch/openquok-directory-open-launch.js',
	hostPatterns: OPEN_LAUNCH_HOST_PATTERNS,
	hostPermission: OPEN_LAUNCH_HOST_PERMISSION,
};

export const OPEN_LAUNCH_DIRECTORY_LAUNCH_PROVIDERS = [
	OPEN_LAUNCH_FREE_LAUNCH,
	OPEN_LAUNCH_PREMIUM_LAUNCH,
] as const satisfies readonly DirectoryLaunchProvider[];

// --- Open Launch official taxonomy (https://open-launch.com/categories) — `checkboxCatalog` / `selectCatalog` ---

/** Browse slugs from https://open-launch.com/categories (2026-11-11). */
const OPEN_LAUNCH_CATEGORY_SLUGS = [
	'ai',
	'analytics',
	'api',
	'ar-vr',
	'blockchain',
	'cms',
	'cross-platform-development',
	'data-science',
	'databases',
	'design-tools',
	'developer-tools',
	'devops',
	'directory',
	'ecommerce',
	'edtech',
	'finance-tech',
	'game-development',
	'gaming',
	'graphics',
	'greentech',
	'hardware',
	'healthtech',
	'iot',
	'launch-platform',
	'machine-learning',
	'marketing-tools',
	'mobile-dev',
	'nlp',
	'online-community',
	'open-source',
	'platform',
	'productivity',
	'prototyping',
	'robotics',
	'saas',
	'sales-tools',
	'security',
	'serverless',
	'testing-qa',
	'ui-ux',
	'wearables',
	'web-dev',
] as const;

const OPEN_LAUNCH_CATEGORY_LABEL_BY_SLUG: Record<(typeof OPEN_LAUNCH_CATEGORY_SLUGS)[number], string> =
	{
		ai: 'AI',
		analytics: 'Analytics',
		api: 'APIs & Integrations',
		'ar-vr': 'AR/VR',
		blockchain: 'Blockchain',
		cms: 'CMS',
		'cross-platform-development': 'Cross-Platform Development',
		'data-science': 'Data Science',
		databases: 'Databases',
		'design-tools': 'Design Tools',
		'developer-tools': 'Developer Tools',
		devops: 'DevOps',
		directory: 'Directory',
		ecommerce: 'Ecommerce',
		edtech: 'EdTech',
		'finance-tech': 'Finance Tech',
		'game-development': 'Game Development',
		gaming: 'Gaming',
		graphics: 'Graphics',
		greentech: 'GreenTech',
		hardware: 'Hardware',
		healthtech: 'HealthTech',
		iot: 'IoT',
		'launch-platform': 'Launch Platform',
		'machine-learning': 'Machine Learning',
		'marketing-tools': 'Marketing Tools',
		'mobile-dev': 'Mobile Dev',
		nlp: 'NLP',
		'online-community': 'Online Community',
		'open-source': 'Open Source',
		platform: 'Platform',
		productivity: 'Productivity',
		prototyping: 'Prototyping',
		robotics: 'Robotics',
		saas: 'SaaS',
		'sales-tools': 'Sales Tools',
		security: 'Security',
		serverless: 'Serverless',
		'testing-qa': 'Testing & QA',
		'ui-ux': 'UI/UX',
		wearables: 'Wearables',
		'web-dev': 'Web Dev',
	};

/** Checkbox labels on https://open-launch.com/projects/submit (Details → Categories). */
export const OPEN_LAUNCH_OFFICIAL_CATEGORY_LABELS = OPEN_LAUNCH_CATEGORY_SLUGS.map(
	(slug) => OPEN_LAUNCH_CATEGORY_LABEL_BY_SLUG[slug]
);

export type OpenLaunchOfficialCategoryLabel = (typeof OPEN_LAUNCH_OFFICIAL_CATEGORY_LABELS)[number];

/** Checkbox labels on Details → Platforms. */
export const OPEN_LAUNCH_OFFICIAL_PLATFORM_LABELS = [
	'Web',
	'Mobile',
	'Desktop',
	'Api',
	'Other',
] as const;

export type OpenLaunchOfficialPlatformLabel = (typeof OPEN_LAUNCH_OFFICIAL_PLATFORM_LABELS)[number];

export const OPEN_LAUNCH_OFFICIAL_PRICING_LABELS = ['Free', 'Freemium', 'Paid'] as const;

export type OpenLaunchOfficialPricingLabel = (typeof OPEN_LAUNCH_OFFICIAL_PRICING_LABELS)[number];

function normalizeOpenLaunchChoiceLabel(raw: string): string {
	return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

function matchOfficialLabel(
	raw: string,
	labels: readonly string[]
): string | null {
	const norm = normalizeOpenLaunchChoiceLabel(raw);
	for (const label of labels) {
		if (normalizeOpenLaunchChoiceLabel(label) === norm) return label;
	}
	return null;
}

const OPEN_LAUNCH_CATEGORY_ALIASES: Record<string, OpenLaunchOfficialCategoryLabel> = {
	marketing: 'Marketing Tools',
	'developer tools': 'Developer Tools',
	devtools: 'Developer Tools',
	engineering: 'Developer Tools',
	integration: 'APIs & Integrations',
	integrations: 'APIs & Integrations',
	api: 'APIs & Integrations',
	automation: 'Productivity',
	agents: 'AI',
	'ai agents': 'AI',
	'content creation': 'Marketing Tools',
	'social media': 'Marketing Tools',
};

const OPEN_LAUNCH_PLATFORM_ALIASES: Record<string, OpenLaunchOfficialPlatformLabel> = {
	api: 'Api',
	mcp: 'Other',
	cli: 'Other',
	'chrome extension': 'Other',
	extension: 'Other',
	extensions: 'Other',
};

export function matchOpenLaunchOfficialCategory(raw: string): string | null {
	const exact = matchOfficialLabel(raw, OPEN_LAUNCH_OFFICIAL_CATEGORY_LABELS);
	if (exact) return exact;
	const norm = normalizeOpenLaunchChoiceLabel(raw);
	for (const label of OPEN_LAUNCH_OFFICIAL_CATEGORY_LABELS) {
		if (normalizeOpenLaunchChoiceLabel(label).includes(norm) || norm.includes(normalizeOpenLaunchChoiceLabel(label))) {
			return label;
		}
	}
	for (const [needle, label] of Object.entries(OPEN_LAUNCH_CATEGORY_ALIASES)) {
		if (norm === needle || norm.includes(needle)) return label;
	}
	return null;
}

export function matchOpenLaunchOfficialPlatform(raw: string): string | null {
	const exact = matchOfficialLabel(raw, OPEN_LAUNCH_OFFICIAL_PLATFORM_LABELS);
	if (exact) return exact;
	const norm = normalizeOpenLaunchChoiceLabel(raw);
	for (const [needle, label] of Object.entries(OPEN_LAUNCH_PLATFORM_ALIASES)) {
		if (norm === needle || norm.includes(needle)) return label;
	}
	return null;
}

export function matchOpenLaunchOfficialPricing(raw: string): string | null {
	return matchOfficialLabel(raw, OPEN_LAUNCH_OFFICIAL_PRICING_LABELS);
}

export function coerceToOpenLaunchOfficialPricing(raw: string): string {
	const matched = matchOfficialLabel(raw, OPEN_LAUNCH_OFFICIAL_PRICING_LABELS);
	if (matched) return matched;
	const norm = normalizeOpenLaunchChoiceLabel(raw);
	if (norm.includes('free') && !norm.includes('freemium')) return 'Free';
	if (norm.includes('freemium')) return 'Freemium';
	if (norm.includes('paid') || norm.includes('subscription')) return 'Paid';
	return raw.trim();
}

export function filterToOpenLaunchOfficialCategories(items: readonly string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const item of items) {
		const official = matchOpenLaunchOfficialCategory(item);
		if (!official) continue;
		const key = normalizeOpenLaunchChoiceLabel(official);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(official);
	}
	return out;
}

export function filterToOpenLaunchOfficialPlatforms(items: readonly string[]): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const item of items) {
		const official = matchOpenLaunchOfficialPlatform(item);
		if (!official) continue;
		const key = normalizeOpenLaunchChoiceLabel(official);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(official);
	}
	return out;
}

export function invalidOpenLaunchProfileChoicesForField(
	items: readonly string[] | undefined,
	field: LaunchStepField
): string[] {
	if (!items?.length) return [];
	if (field.checkboxCatalog === 'open_launch_categories') {
		return items.filter((item) => matchOpenLaunchOfficialCategory(item) === null);
	}
	if (field.checkboxCatalog === 'open_launch_platforms') {
		return items.filter((item) => matchOpenLaunchOfficialPlatform(item) === null);
	}
	return [];
}

export function openLaunchSelectCatalogOptions(
	catalog: LaunchStepField['selectCatalog']
): readonly string[] {
	if (catalog === 'open_launch_pricing') return OPEN_LAUNCH_OFFICIAL_PRICING_LABELS;
	return [];
}
