import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
	LaunchStepField,
} from '../../../../browser-extension/pageAssist.js';

/** TinyLaunch create-startup form field limits (tinylaunch.com/dashboard/startups/new). */
export const TINYLAUNCH_FORM_NAME_MAX = 30;
export const TINYLAUNCH_FORM_TAGLINE_MAX = 60;
export const TINYLAUNCH_FORM_GALLERY_MAX = 3;

export const TINYLAUNCH_HOST_PATTERNS = [
	'https://tinylaunch.com/*',
	'https://www.tinylaunch.com/*',
] as const;

export const TINYLAUNCH_HOST_PERMISSION = '*://*.tinylaunch.com/*';

/** TinyLaunch directory launch — create-startup wizard. */
/** Readable mirror of `auto_launch_destinations.extension_config` for SQL seed parity (drift-tested). */
export const TINYLAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...TINYLAUNCH_HOST_PATTERNS],
	readyUrlHint: 'dashboard/startups',
	steps: [
		{
			id: 'create_startup',
			label: 'Create startup',
			fields: [
				{
					key: 'name',
					label: 'Startup Name',
					labelAliases: ['Name'],
					profilePath: 'name',
					fillMode: 'text',
					maxScalarLength: TINYLAUNCH_FORM_NAME_MAX,
					required: true,
					selectorHint:
						"input[name*='name' i], input[placeholder*='startup name' i], input[aria-label*='startup name' i]",
				},
				{
					key: 'tagline',
					label: 'Tagline',
					profilePath: 'tagline',
					fillMode: 'text',
					maxScalarLength: TINYLAUNCH_FORM_TAGLINE_MAX,
					required: true,
					selectorHint:
						"input[name*='tagline' i], textarea[name*='tagline' i], input[placeholder*='tagline' i], textarea[placeholder*='tagline' i]",
				},
				{
					key: 'logo',
					label: 'Logo',
					profilePath: 'logo_url',
					fillMode: 'file',
					fileInputIndex: 0,
					required: true,
					selectorHint: "input[type='file'][accept*='image']",
				},
				{
					key: 'gallery',
					label: 'Images',
					labelAliases: ['Screenshots', 'Gallery'],
					profilePath: 'profile_data.gallery_urls',
					fillMode: 'files',
					fileInputIndex: 1,
					maxItems: TINYLAUNCH_FORM_GALLERY_MAX,
					selectorHint: "input[type='file'][accept*='image']",
				},
				{
					key: 'website',
					label: 'Website URL',
					labelAliases: ['Website'],
					profilePath: 'website_url',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[type='url'], input[name*='website' i], input[name*='url' i], input[placeholder*='website' i]",
				},
				{
					key: 'description',
					label: 'Description',
					profilePath: 'description',
					fillMode: 'rich_html',
					required: true,
					selectorHint:
						"[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='description' i], textarea[placeholder*='description' i]",
				},
				{
					key: 'category',
					label: 'Category',
					profilePath: 'profile_data.category',
					fillMode: 'select',
					selectCatalog: 'tinylaunch',
					required: true,
					selectorHint:
						"select[name*='categor' i], [role='combobox'][aria-label*='categor' i], button[aria-label*='categor' i]",
				},
			],
		},
	],
	proof: {
		successPathRegex: '/dashboard/startups/',
		listingUrlSelector: "a[href*='tinylaunch.com'][href*='/startups/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const TINYLAUNCH_STANDARD_LAUNCH_EXTENSION_CONFIG = {
	...TINYLAUNCH_PREMIUM_LAUNCH_EXTENSION_CONFIG,
	readyUrlHint: 'pricing',
} as const satisfies AutoLaunchExtensionConfig;

const TINYLAUNCH_PREMIUM_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'tinylaunch-premium-launch',
	name: 'TinyLaunch — Premium launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://www.tinylaunch.com/dashboard/startups/new',
	contentScriptEntry: 'content/directory-launch/openquok-directory-tinylaunch.js',
	hostPatterns: TINYLAUNCH_HOST_PATTERNS,
	hostPermission: TINYLAUNCH_HOST_PERMISSION,
};

const TINYLAUNCH_STANDARD_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'tinylaunch-standard-launch',
	name: 'TinyLaunch — Standard launch',
	tierLabel: 'Free',
	defaultStartUrl: 'https://www.tinylaunch.com/pricing',
	contentScriptEntry: 'content/directory-launch/openquok-directory-tinylaunch.js',
	hostPatterns: TINYLAUNCH_HOST_PATTERNS,
	hostPermission: TINYLAUNCH_HOST_PERMISSION,
};

export const TINYLAUNCH_DIRECTORY_LAUNCH_PROVIDERS = [
	TINYLAUNCH_STANDARD_LAUNCH,
	TINYLAUNCH_PREMIUM_LAUNCH,
] as const satisfies readonly DirectoryLaunchProvider[];

// --- TinyLaunch categories (GET https://www.tinylaunch.com/api/v1/categories) — `selectCatalog: 'tinylaunch'` ---

/** Official TinyLaunch category labels from `category_name` (2026-11-17). */
export const TINYLAUNCH_OFFICIAL_CATEGORY_LABELS = [
	'AI & Machine Learning',
	'Beta & Early Access',
	'Community & Networking',
	'Consumer Electronics',
	'Design & Art',
	'Developer Tools',
	'Diversity & Inclusion',
	'DIY & Makers',
	'E-commerce',
	'Education & Learning',
	'Finance & FinTech',
	'Gaming',
	'Green Tech',
	'Health & Wellness',
	'Healthcare & MedTech',
	'Home & Living',
	'HR & Recruitment',
	'IoT & Connectivity',
	'Legal & Compliance',
	'Logistics & Delivery',
	'Marketing & Sales',
	'Mobility & Transportation',
	'Music & Audio',
	'Nonprofit Tools',
	'Productivity',
	'Real Estate & PropTech',
	'Retail Tech',
	'Robotics & Automation',
	'SaaS & Tools',
	'Side Projects & Hacks',
	'Social Impact',
	'Social Media',
	'Startup & Small Business',
	'Travel & Tourism',
	'Video & Content Creation',
	'Web3 & Blockchain',
] as const;

export type TinylaunchOfficialCategoryLabel = (typeof TINYLAUNCH_OFFICIAL_CATEGORY_LABELS)[number];

export function normalizeTinylaunchCategoryLabel(raw: string): string {
	return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function matchTinylaunchOfficialCategory(raw: string): string | null {
	const norm = normalizeTinylaunchCategoryLabel(raw);
	for (const label of TINYLAUNCH_OFFICIAL_CATEGORY_LABELS) {
		if (normalizeTinylaunchCategoryLabel(label) === norm) return label;
	}
	return null;
}

export function coerceToTinylaunchOfficialCategory(raw: string): string {
	const official = matchTinylaunchOfficialCategory(raw);
	if (official) return official;
	const norm = normalizeTinylaunchCategoryLabel(raw);
	for (const label of TINYLAUNCH_OFFICIAL_CATEGORY_LABELS) {
		const labelNorm = normalizeTinylaunchCategoryLabel(label);
		if (norm.includes(labelNorm) || labelNorm.includes(norm)) return label;
	}
	const aliases: Record<string, TinylaunchOfficialCategoryLabel> = {
		ai: 'AI & Machine Learning',
		saas: 'SaaS & Tools',
		devtools: 'Developer Tools',
		'developer tools': 'Developer Tools',
		fintech: 'Finance & FinTech',
		marketing: 'Marketing & Sales',
		ecommerce: 'E-commerce',
		'web3': 'Web3 & Blockchain',
		blockchain: 'Web3 & Blockchain',
		productivity: 'Productivity',
		'health tech': 'Healthcare & MedTech',
		medtech: 'Healthcare & MedTech',
		proptech: 'Real Estate & PropTech',
		iot: 'IoT & Connectivity',
		gaming: 'Gaming',
	};
	for (const [needle, label] of Object.entries(aliases)) {
		if (norm === needle || norm.includes(needle)) return label;
	}
	return raw.trim();
}

export function tinylaunchSelectCatalogOptions(
	catalog: LaunchStepField['selectCatalog']
): readonly string[] {
	if (catalog === 'tinylaunch') return TINYLAUNCH_OFFICIAL_CATEGORY_LABELS;
	return [];
}