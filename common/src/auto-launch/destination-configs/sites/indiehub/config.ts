import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
	LaunchStepField,
} from '../../../../browser-extension/pageAssist.js';

/** IndieHub cover image (16:9) accepts a single file on submit step 1. */
export const INDIEHUB_FORM_COVER_MAX = 1;

export const INDIEHUB_HOST_PATTERNS = ['https://indiehub.best/*'] as const;

export const INDIEHUB_HOST_PERMISSION = '*://indiehub.best/*';

const INDIEHUB_CONTENT_SCRIPT_ENTRY = 'content/directory-launch/openquok-directory-indiehub.js';

const INDIEHUB_SUBMIT_URL_PREFILL_HINT =
	'If IndieHub AI AutoFill prefills from your website link, skip or review it before OpenQuok fills the form.';

const INDIEHUB_SUBMIT_MANUAL_STEPS_HINT =
	'Payment (step 2) and Publish (step 3) stay manual on IndieHub.';

/** Shared submit wizard step 1 — Details (`indiehub.best/submit`). */
export const INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...INDIEHUB_HOST_PATTERNS],
	readyUrlHint: 'submit',
	readyStatusHint:
		'Sign in on IndieHub (GitHub, Google, or email), then open submit step 1 (Details). ' +
		INDIEHUB_SUBMIT_URL_PREFILL_HINT +
		' OpenQuok fills link, name, categories, tags, description, introduction, icon, and cover image only. ' +
		INDIEHUB_SUBMIT_MANUAL_STEPS_HINT,
	steps: [
		{
			id: 'submit_details',
			label: 'Details',
			fields: [
				{
					key: 'website',
					label: 'Link',
					labelAliases: ['Website', 'Website URL', 'URL'],
					profilePath: 'website_url',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[name='link'], input[type='url'][name='link'], form input[name*='link' i]:not([aria-label*='autofill' i])",
				},
				{
					key: 'name',
					label: 'Name',
					labelAliases: ['Product name'],
					profilePath: 'name',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[name='name'], input[aria-label*='name' i], input[placeholder*='name' i]",
				},
				{
					key: 'categories',
					label: 'Categories',
					profilePath: 'profile_data.categories',
					fillMode: 'tags',
					tagsCatalog: 'indiehub_categories',
					labelMatch: 'section',
					tagsScope: 'section',
					required: true,
					selectorHint:
						"input[role='combobox'], input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]",
				},
				{
					key: 'tags',
					label: 'Tags',
					profilePath: 'profile_data.tags',
					fillMode: 'tags',
					labelMatch: 'section',
					tagsScope: 'section',
					selectorHint:
						"input[role='combobox'], input[name*='tag' i], input[placeholder*='tag' i], [aria-label*='tag' i]",
				},
				{
					key: 'tagline',
					label: 'Description',
					labelAliases: ['Short description'],
					profilePath: 'tagline',
					fillMode: 'text',
					required: true,
					selectorHint:
						"textarea[name*='description' i]:not([name*='intro' i]), input[name*='tagline' i], input[placeholder*='short' i]",
				},
				{
					key: 'description',
					label: 'Introduction',
					labelAliases: ['Introduction (Markdown supported)', 'Markdown'],
					profilePath: 'description',
					fillMode: 'rich_html',
					required: true,
					selectorHint:
						"[contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='intro' i], textarea[name*='markdown' i]",
				},
				{
					key: 'logo',
					label: 'Icon',
					labelAliases: ['Logo'],
					profilePath: 'logo_url',
					fillMode: 'file',
					required: true,
					selectorHint:
						"input[type='file'][name*='icon' i], input[type='file'][name*='logo' i]",
				},
				{
					key: 'cover',
					label: 'Image',
					labelAliases: ['Cover', 'Banner'],
					profilePath: 'profile_data.gallery_urls',
					fillMode: 'files',
					maxItems: INDIEHUB_FORM_COVER_MAX,
					required: true,
					selectorHint:
						"input[type='file'][name*='banner' i], input[type='file'][name*='cover' i], input[type='file'][name*='image' i]:not([name*='icon' i]):not([name*='logo' i])",
				},
			],
		},
	],
	proof: {
		successPathRegex: '/product/|/submit',
		listingUrlSelector: "a[href*='indiehub.best/product/'], a[href*='indiehub.best/products/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const INDIEHUB_BASIC_LAUNCH_EXTENSION_CONFIG = {
	...INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		'Sign in on IndieHub and open submit step 1 (Details) for a Basic listing ($4.9). ' +
		INDIEHUB_SUBMIT_URL_PREFILL_HINT +
		' On step 2 (Payment), choose Basic and checkout on IndieHub. ' +
		INDIEHUB_SUBMIT_MANUAL_STEPS_HINT,
} as const satisfies AutoLaunchExtensionConfig;

export const INDIEHUB_PRO_LAUNCH_EXTENSION_CONFIG = {
	...INDIEHUB_DETAILS_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		'Sign in on IndieHub and open submit step 1 (Details) for a Pro listing ($9.9). ' +
		INDIEHUB_SUBMIT_URL_PREFILL_HINT +
		' On step 2 (Payment), choose Pro and checkout on IndieHub. ' +
		INDIEHUB_SUBMIT_MANUAL_STEPS_HINT,
} as const satisfies AutoLaunchExtensionConfig;

const INDIEHUB_BASIC_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'indiehub-basic-launch',
	name: 'IndieHub — Basic launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://indiehub.best/submit',
	contentScriptEntry: INDIEHUB_CONTENT_SCRIPT_ENTRY,
	hostPatterns: INDIEHUB_HOST_PATTERNS,
	hostPermission: INDIEHUB_HOST_PERMISSION,
};

const INDIEHUB_PRO_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'indiehub-pro-launch',
	name: 'IndieHub — Pro launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://indiehub.best/submit',
	contentScriptEntry: INDIEHUB_CONTENT_SCRIPT_ENTRY,
	hostPatterns: INDIEHUB_HOST_PATTERNS,
	hostPermission: INDIEHUB_HOST_PERMISSION,
};

export const INDIEHUB_DIRECTORY_LAUNCH_PROVIDERS = [
	INDIEHUB_BASIC_LAUNCH,
	INDIEHUB_PRO_LAUNCH,
] as const satisfies readonly DirectoryLaunchProvider[];

// --- IndieHub categories — `tagsCatalog: 'indiehub_categories'` ---
// Names from public category hub paths on https://indiehub.best (sitemap, 2026-11-25).

type IndiehubCategory = { readonly name: string; readonly slug: string };

export const INDIEHUB_OFFICIAL_CATEGORIES = [
	{ name: 'AI', slug: 'ai' },
	{ name: 'Business', slug: 'business' },
	{ name: 'Design', slug: 'design' },
	{ name: 'Development', slug: 'development' },
	{ name: 'Directory', slug: 'directory' },
	{ name: 'Education', slug: 'education' },
	{ name: 'Entertainment', slug: 'entertainment' },
	{ name: 'Finance', slug: 'finance' },
	{ name: 'Games', slug: 'games' },
	{ name: 'Health', slug: 'health' },
	{ name: 'Image', slug: 'image' },
	{ name: 'Lifestyle', slug: 'lifestyle' },
	{ name: 'Market', slug: 'market' },
	{ name: 'Music', slug: 'music' },
	{ name: 'Open Source', slug: 'open-source' },
	{ name: 'Productivity', slug: 'productivity' },
	{ name: 'Sports', slug: 'sports' },
	{ name: 'Text', slug: 'text' },
	{ name: 'Tool', slug: 'tool' },
	{ name: 'Travel', slug: 'travel' },
	{ name: 'Utility', slug: 'utility' },
	{ name: 'Video', slug: 'video' },
] as const satisfies readonly IndiehubCategory[];

export const INDIEHUB_OFFICIAL_CATEGORY_LABELS = INDIEHUB_OFFICIAL_CATEGORIES.map(
	(category) => category.name
);

export type IndiehubOfficialCategoryLabel = (typeof INDIEHUB_OFFICIAL_CATEGORIES)[number]['name'];

function normalizeIndiehubCategoryKey(raw: string): string {
	return raw
		.trim()
		.replace(/&/g, ' and ')
		.replace(/[_/]+/g, ' ')
		.replace(/[-]+/g, ' ')
		.replace(/\s+/g, ' ')
		.toLowerCase();
}

const indiehubCategoryByKey = new Map<string, string>();
for (const category of INDIEHUB_OFFICIAL_CATEGORIES) {
	indiehubCategoryByKey.set(normalizeIndiehubCategoryKey(category.name), category.name);
	indiehubCategoryByKey.set(normalizeIndiehubCategoryKey(category.slug), category.name);
}

export function matchIndiehubOfficialCategory(raw: string): string | null {
	const key = normalizeIndiehubCategoryKey(raw);
	if (!key) return null;
	return indiehubCategoryByKey.get(key) ?? null;
}

/** Map profile chips to official IndieHub category names. */
export function filterToIndiehubOfficialCategories(items: readonly string[]): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const item of items) {
		const official = matchIndiehubOfficialCategory(item);
		if (!official || seen.has(official)) continue;
		seen.add(official);
		out.push(official);
	}
	return out;
}

export function indiehubTagsCatalogOptions(
	catalog: LaunchStepField['tagsCatalog']
): readonly string[] {
	if (catalog === 'indiehub_categories') return INDIEHUB_OFFICIAL_CATEGORY_LABELS;
	return [];
}