import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
	LaunchStepField,
} from '../../../../browser-extension/pageAssist.js';
/** DevHunt tool screenshot control (`#tool-screenshots-container`) accepts up to three files per submit. */
export const DEVHUNT_FORM_GALLERY_MAX = 3;

export const DEVHUNT_HOST_PATTERNS = ['https://devhunt.org/*'] as const;

export const DEVHUNT_HOST_PERMISSION = '*://devhunt.org/*';

/** DevHunt new-tool form (`devhunt.org/account/tools/new`). */
export const DEVHUNT_TOOL_FORM_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...DEVHUNT_HOST_PATTERNS],
	readyUrlHint: 'account/tools/new',
	readyStatusHint:
		'Sign in on DevHunt (GitHub, Google, or email), then open the new-tool form. If DevHunt offers an AI draft from your website URL, skip or review it, then use OpenQuok when the tool form is visible. Maker comment and other optional fields stay manual on DevHunt.',
	steps: [
		{
			id: 'submit_tool',
			label: 'Submit tool',
			fields: [
				{
					key: 'logo',
					label: 'Tool logo',
					labelAliases: ['Logo'],
					profilePath: 'logo_url',
					fillMode: 'file',
					fileInputIndex: 0,
					required: true,
					selectorHint:
						"input[type='file'][accept*='image'], input[type='file'][accept*='png' i]",
				},
				{
					key: 'gallery',
					label: 'Tool screenshots',
					labelAliases: ['Screenshots', 'Gallery'],
					profilePath: 'profile_data.gallery_urls',
					fillMode: 'files',
					fileInputIndex: 0,
					maxItems: DEVHUNT_FORM_GALLERY_MAX,
					required: true,
					selectorHint: "#tool-screenshots-container input[type='file']",
				},
				{
					key: 'name',
					label: 'Tool name',
					profilePath: 'name',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[placeholder*='My Awesome Dev Tool' i], input[name*='tool_name' i], input[aria-label*='tool name' i]",
				},
				{
					key: 'tagline',
					label: 'Catchy slogan',
					labelAliases: ['Slogan', 'Tagline'],
					profilePath: 'tagline',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[placeholder*='Supercharge Your Development Workflow' i], input[name*='slogan' i], textarea[name*='slogan' i]",
				},
				{
					key: 'website',
					label: 'Tool website URL',
					labelAliases: ['Website URL', 'Website'],
					profilePath: 'website_url',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[placeholder*='myawesomedevtool' i], input[type='url'], input[name*='tool_website' i], input[name*='website' i]",
				},
				{
					key: 'description',
					label: 'Quick Description',
					labelAliases: ['Description'],
					profilePath: 'description',
					fillMode: 'rich_html',
					required: true,
					selectorHint:
						"textarea[placeholder*='Briefly explain what your tool does' i], [contenteditable='true'], .ProseMirror, .tiptap, textarea[name*='tool_description' i]",
				},
				{
					key: 'social_github',
					label: 'GitHub repo URL',
					labelAliases: ['GitHub repo URL (optional)', 'GitHub'],
					profilePath: 'profile_data.social_github',
					fillMode: 'text',
					selectorHint:
						"input[placeholder*='github.com/username' i], input[name*='github' i], input[name*='github_repo' i]",
					profileSourcePaths: ['profile_data.repository_url'],
				},
				{
					key: 'pricing_type',
					label: 'Tool pricing type',
					labelAliases: ['Pricing type', 'Pricing'],
					profilePath: 'profile_data.pricing_type',
					fillMode: 'select',
					selectCatalog: 'devhunt_pricing',
					selectorHint:
						"#pricing-container input[type='radio'][name='pricing_type'], input[type='radio'][name='pricing_type'], input[type='radio'][name*='pricing_type' i]",
				},
				{
					key: 'categories',
					label: 'Tool categories',
					labelAliases: ['Categories'],
					profilePath: 'profile_data.categories',
					fillMode: 'tags',
					selectorHint:
						"input[name*='categor' i], input[placeholder*='categor' i], [aria-label*='categor' i]",
				},
				{
					key: 'demo_video',
					label: 'Demo video',
					labelAliases: ['Demo video (optional)'],
					profilePath: 'profile_data.launch_video_url',
					fillMode: 'text',
					selectorHint:
						"input[placeholder*='Demo video (optional)' i], input[name*='demo_video' i], input[type='url'][placeholder*='video' i]",
				},
			],
		},
	],
	proof: {
		successPathRegex: '/tool/|/account/tools',
		listingUrlSelector: "a[href*='devhunt.org/tool/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const DEVHUNT_PAID_LAUNCH_EXTENSION_CONFIG = {
	...DEVHUNT_TOOL_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		'Sign in on DevHunt, then open the new-tool form. Skip or review any AI draft from your website URL, then use OpenQuok on the tool form. Launch week and $49 checkout stay manual on DevHunt.',
} as const satisfies AutoLaunchExtensionConfig;

export const DEVHUNT_STANDARD_LAUNCH_EXTENSION_CONFIG = {
	...DEVHUNT_TOOL_FORM_EXTENSION_CONFIG,
	readyStatusHint:
		'Sign in on DevHunt and open the new-tool form for a free listing. Skip or review any AI draft from your website URL, then use OpenQuok on the tool form. Free listings use a nofollow link on the tool page.',
} as const satisfies AutoLaunchExtensionConfig;

const DEVHUNT_PAID_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'devhunt-paid-launch',
	name: 'DevHunt — Paid launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://devhunt.org/account/tools/new',
	contentScriptEntry: 'content/directory-launch/openquok-directory-devhunt.js',
	hostPatterns: DEVHUNT_HOST_PATTERNS,
	hostPermission: DEVHUNT_HOST_PERMISSION,
};

const DEVHUNT_STANDARD_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'devhunt-standard-launch',
	name: 'DevHunt — Free listing',
	tierLabel: 'Free',
	defaultStartUrl: 'https://devhunt.org/account/tools/new',
	contentScriptEntry: 'content/directory-launch/openquok-directory-devhunt.js',
	hostPatterns: DEVHUNT_HOST_PATTERNS,
	hostPermission: DEVHUNT_HOST_PERMISSION,
};

export const DEVHUNT_DIRECTORY_LAUNCH_PROVIDERS = [
	DEVHUNT_STANDARD_LAUNCH,
	DEVHUNT_PAID_LAUNCH,
] as const satisfies readonly DirectoryLaunchProvider[];

// --- DevHunt pricing radios — `selectCatalog: 'devhunt_pricing'` ---

export const DEVHUNT_OFFICIAL_PRICING_LABELS = ['Free', 'Subscription', 'One-time fee'] as const;

export type DevhuntOfficialPricingLabel = (typeof DEVHUNT_OFFICIAL_PRICING_LABELS)[number];

function normalizeDevhuntChoiceLabel(raw: string): string {
	return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

function matchOfficialPricingLabel(raw: string): string | null {
	const norm = normalizeDevhuntChoiceLabel(raw);
	for (const label of DEVHUNT_OFFICIAL_PRICING_LABELS) {
		if (normalizeDevhuntChoiceLabel(label) === norm) return label;
	}
	return null;
}

export function matchDevhuntOfficialPricing(raw: string): string | null {
	return matchOfficialPricingLabel(raw);
}

export function coerceToDevhuntOfficialPricing(raw: string): string {
	const matched = matchOfficialPricingLabel(raw);
	if (matched) return matched;
	const norm = normalizeDevhuntChoiceLabel(raw);
	if (norm.includes('one') && (norm.includes('time') || norm.includes('fee'))) {
		return 'One-time fee';
	}
	if (norm.includes('subscription') || norm === 'freemium' || norm.includes('paid')) {
		return 'Subscription';
	}
	if (norm.includes('free')) return 'Free';
	return raw.trim();
}

export function devhuntSelectCatalogOptions(
	catalog: LaunchStepField['selectCatalog']
): readonly string[] {
	if (catalog === 'devhunt_pricing') return DEVHUNT_OFFICIAL_PRICING_LABELS;
	return [];
}