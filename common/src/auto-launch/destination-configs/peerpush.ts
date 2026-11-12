import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
} from '../../browser-extension/pageAssist.js';

export const PEERPUSH_HOST_PATTERNS = [
	'https://peerpush.com/*',
	'https://www.peerpush.com/*',
] as const;

export const PEERPUSH_HOST_PERMISSION = '*://*.peerpush.com/*';

const PEERPUSH_STANDARD_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'peerpush-standard-launch',
	name: 'PeerPush — Standard launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://peerpush.com/user/products',
	contentScriptEntry: 'content/directory-launch/openquok-directory-peerpush.js',
	hostPatterns: PEERPUSH_HOST_PATTERNS,
	hostPermission: PEERPUSH_HOST_PERMISSION,
};

const PEERPUSH_FREE_QUEUE: DirectoryLaunchProvider = {
	identifier: 'peerpush-free-queue',
	name: 'PeerPush — Free queue',
	tierLabel: 'Free',
	defaultStartUrl: 'https://peerpush.com/user/products',
	contentScriptEntry: 'content/directory-launch/openquok-directory-peerpush.js',
	hostPatterns: PEERPUSH_HOST_PATTERNS,
	hostPermission: PEERPUSH_HOST_PERMISSION,
};

export const PEERPUSH_DIRECTORY_LAUNCH_PROVIDERS = [
	PEERPUSH_FREE_QUEUE,
	PEERPUSH_STANDARD_LAUNCH,
] as const satisfies readonly DirectoryLaunchProvider[];

/** PeerPush directory launch — peerpush.com submit flow. */
/** Readable mirror of `auto_launch_destinations.extension_config` for SQL seed parity (drift-tested). */
export const PEERPUSH_STANDARD_LAUNCH_EXTENSION_CONFIG = {
	"version": 1,
	"startUrlPatterns": [
		"https://peerpush.com/*",
		"https://www.peerpush.com/*",
	],
	"readyUrlHint": "submit",
	"steps": [
		{
			"id": "basic",
			"label": "Basic",
			"fields": [
				{
					"key": "name",
					"label": "Product name",
					"profilePath": "name",
					"fillMode": "text",
					"selectorHint": "#name, input#name",
				},
				{
					"key": "tagline",
					"label": "Tagline",
					"labelAliases": ["One-line tagline"],
					"profilePath": "tagline",
					"fillMode": "text",
					"selectorHint": "#tagline, input#tagline",
				},
				{
					"key": "description",
					"label": "Product description",
					"labelAliases": ["Description"],
					"profilePath": "description",
					"fillMode": "text",
					"selectorHint": "#description, textarea#description",
				},
				{
					"key": "website",
					"label": "Website",
					"profilePath": "website_url",
					"fillMode": "text",
					"selectorHint": "#websiteUrl, input#websiteUrl, input[type='url'][id*='website' i]",
				},
				{
					"key": "logo",
					"label": "Logo",
					"profilePath": "logo_url",
					"fillMode": "file",
					"fileInputIndex": 0,
					"selectorHint": "[data-field='logo'] input[type='file'], input[type='file'][accept*='image']",
				},
			],
		},
		{
			"id": "discovery",
			"label": "Discovery",
			"fields": [
				{
					"key": "categories",
					"label": "Categories",
					"profilePath": "profile_data.categories",
					"fillMode": "tags",
					"labelMatch": "section",
					"tagsScope": "section",
					"maxItems": 3,
					"selectorHint": "[data-field='categories'] input[role='combobox'], [data-field='categories'] input[placeholder*='categor' i]",
				},
				{
					"key": "use_cases",
					"label": "Use Cases",
					"labelAliases": ["Use cases"],
					"profilePath": "profile_data.use_cases",
					"fillMode": "tags",
					"labelMatch": "section",
					"tagsScope": "section",
					"selectorHint": "[data-field='useCases'] input[role='combobox'], [data-field='useCases'] input[placeholder*='use case' i]",
				},
				{
					"key": "target_audiences",
					"label": "Target Audience",
					"labelAliases": ["Target audience", "Audiences"],
					"profilePath": "profile_data.target_audiences",
					"fillMode": "tags",
					"labelMatch": "section",
					"tagsScope": "section",
					"selectorHint": "[data-field='audiences'] input[role='combobox'], [data-field='audiences'] input[placeholder*='audience' i]",
				},
				{
					"key": "pricing_type",
					"label": "Pricing",
					"profilePath": "profile_data.pricing_type",
					"fillMode": "select",
					"selectorHint": "[data-field='pricingType'] select, select[aria-label='Pricing type']",
				},
				{
					"key": "platforms",
					"label": "Platforms",
					"profilePath": "profile_data.platforms",
					"fillMode": "tags",
					"labelMatch": "section",
					"tagsScope": "section",
					"maxItems": 5,
					"selectorHint": "[data-field='platforms'] input[role='combobox'], [data-field='platforms'] input[placeholder*='platform' i]",
				},
			],
		},
		{
			"id": "media",
			"label": "Media",
			"fields": [
				{
					"key": "gallery",
					"label": "Screenshots",
					"profilePath": "profile_data.gallery_urls",
					"fillMode": "files",
					"fileInputIndex": 0,
					"selectorHint": "[data-field='screenshots'] input[type='file'], input[type='file'][accept*='image']",
				},
			],
		},
		{
			"id": "additional",
			"label": "Additional Info",
			"fields": [
				{
					"key": "monthly_revenue_usd",
					"label": "Monthly recurring revenue (optional)",
					"labelAliases": ["MRR", "MRR - Monthly Recurring Revenue (optional)"],
					"profilePath": "profile_data.monthly_revenue_usd",
					"fillMode": "text",
					"selectorHint": "#mrr, input#mrr, input[name='mrr'], input[placeholder='1000']",
				},
				{
					"key": "social_x",
					"label": "Twitter username",
					"labelAliases": ["X (Twitter)", "X username"],
					"profilePath": "profile_data.social_x",
					"fillMode": "text",
					"selectorHint": "#twitterUsername, input#twitterUsername, input[aria-label='X username']",
				},
				{
					"key": "social_linkedin",
					"label": "LinkedIn URL",
					"profilePath": "profile_data.social_linkedin",
					"fillMode": "text",
					"selectorHint": "#linkedinUrl, input#linkedinUrl, input[aria-label='LinkedIn URL'], input[type='url'][placeholder*='linkedin.com' i]",
				},
			],
		},
	],
	"proof": {
		"successPathRegex": "/p/|/submit",
		"listingUrlSelector": "a[href*='peerpush.com/p/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const PEERPUSH_FREE_QUEUE_EXTENSION_CONFIG = {
	...PEERPUSH_STANDARD_LAUNCH_EXTENSION_CONFIG,
	readyUrlHint: 'pricing',
} as const satisfies AutoLaunchExtensionConfig;
