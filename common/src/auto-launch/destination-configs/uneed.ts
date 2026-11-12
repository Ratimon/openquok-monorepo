import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
	LaunchStepField,
} from '../../browser-extension/pageAssist.js';
import { BUSINESS_PROFILE_DIRECTORY_TAGLINE_MAX } from '../businessProfileData.js';

/** Native controls on `edit/waiting-line/*` (Reka / Nuxt form). */
const UNEED_PRODUCT_NAME_SELECTOR_HINT = 'input[name="name"]';
const UNEED_PRODUCT_SLUG_SELECTOR_HINT = 'input[name="slug"]';
const UNEED_PRODUCT_WEBSITE_SELECTOR_HINT = 'input[name="url"]';
const UNEED_PRODUCT_REPOSITORY_SELECTOR_HINT =
	'input[name="repo_url"], input[placeholder*="github.com" i]';

/** Uneed listing form exposes an 80-character tagline control (not the rich HTML description). */
/** On `edit/waiting-line/*`, the 80-char Tagline is `textarea[name="description"]`; rich HTML is a separate control. */
const UNEED_PRODUCT_TAGLINE_SELECTOR_HINT =
	'textarea[name="description"], input[name=\'tagline\'], textarea[name=\'tagline\'], textarea[maxlength=\'80\'], input[maxlength=\'80\'], input[aria-label*=\'tagline\' i], textarea[aria-label*=\'tagline\' i], input[placeholder*=\'tagline\' i], textarea[placeholder*=\'tagline\' i], input[id*=\'tagline\' i], textarea[id*=\'tagline\' i], input[name*=\'tagLine\' i]';

/** Rich description only — never plain `textarea[name*=description]` (can be the tagline control). */
const UNEED_PRODUCT_DESCRIPTION_SELECTOR_HINT =
	"label:has(+ .tiptap) + .tiptap .ProseMirror, label:has(+ div .tiptap) + div .tiptap .ProseMirror, .tiptap .ProseMirror[contenteditable='true'], [aria-label*='rich description' i] .ProseMirror";

/** Tags picker — Reka `Show popup` button (not Category/Pricing comboboxes). */
const UNEED_PRODUCT_TAGS_SELECTOR_HINT =
	"button[aria-haspopup='listbox'][aria-label='Show popup'], button[aria-haspopup='listbox'][aria-label*='popup' i], input[name*='tags' i]:not([name*='tagline' i]), input[aria-label*='tags' i]:not([aria-label*='tagline' i]), [data-testid*='tag-input' i], [data-testid*='tags-input' i]";

/** Uneed Tags step field — compare rail + fill (join line / paid launch). */
const UNEED_PRODUCT_TAGS_FIELD = {
	key: 'tags',
	label: 'Tags',
	labelAliases: ['Select tags'],
	profilePath: 'profile_data.tags',
	fillMode: 'tags',
	selectorHint: UNEED_PRODUCT_TAGS_SELECTOR_HINT,
	required: true,
	maxItems: 3,
	tagsCatalog: 'uneed',
	profileSourcePaths: [
		'profile_data.use_cases',
		'profile_data.platforms',
		'profile_data.tech_stack',
		'profile_data.categories',
	],
} as const;

/** Uneed Media — launch video (avoid generic `placeholder*=video` hitting unrelated url inputs). */
const UNEED_LAUNCH_VIDEO_SELECTOR_HINT =
	"input[type='url'][aria-label*='launch video' i], input[type='url'][aria-label*='video url' i], input[type='url'][name*='launch_video' i], input[type='url'][name*='launchVideo' i], input[type='url'][name*='video_url' i]:not([name*='repo' i]):not([name*='repository' i]), input[type='url'][placeholder*='youtube' i], input[type='url'][placeholder*='vimeo' i]";

const UNEED_SOCIAL_YOUTUBE_SELECTOR_HINT =
	"input[name*='youtube' i]:not([name='name']):not([name='description']):not([name='repo_url']), input[type='url'][name*='youtube' i], input[type='url'][placeholder*='youtube' i]:not([name='name'])";

/** Socials tab inputs — never `repo_url` (Repository URL on General) or product identity fields. */
const UNEED_SOCIAL_X_SELECTOR_HINT =
	"input[name*='twitter' i]:not([name='name']):not([name='repo_url']), input[name*='x.com' i], input[placeholder*='twitter' i]:not([name='repo_url'])";
const UNEED_SOCIAL_GITHUB_SELECTOR_HINT =
	"input[name*='github' i]:not([name='repo_url']):not([name='name']), input[aria-label*='github' i]";
const UNEED_SOCIAL_INSTAGRAM_SELECTOR_HINT =
	"input[name*='instagram' i]:not([name='name']), input[placeholder*='instagram' i]";
const UNEED_SOCIAL_LINKEDIN_SELECTOR_HINT =
	"input[name*='linkedin' i]:not([name='name']), input[placeholder*='linkedin' i]";
const UNEED_SOCIAL_TIKTOK_SELECTOR_HINT =
	"input[name*='tiktok' i]:not([name='name']), input[placeholder*='tiktok' i]";
const UNEED_SOCIAL_FACEBOOK_SELECTOR_HINT =
	"input[name*='facebook' i]:not([name='name']), input[placeholder*='facebook' i]";
const UNEED_SOCIAL_BLUESKY_SELECTOR_HINT =
	"input[name*='bluesky' i]:not([name='name']), input[name*='bsky' i]:not([name='name']), input[placeholder*='bluesky' i]";

/** Uneed directory launch — uneed.best listing flows. */
/** Readable mirror of `auto_launch_destinations.extension_config` for SQL seed parity (drift-tested). */
export const UNEED_JOIN_LINE_EXTENSION_CONFIG = {
	"version": 1,
	"startUrlPatterns": [
		"https://uneed.best/*",
		"https://www.uneed.best/*",
	],
	"readyUrlHint": "your-tools",
	"steps": [
		{
			"id": "general",
			"label": "General",
			"fields": [
				{
					"key": "name",
					"label": "Product name",
					"labelAliases": ["Name"],
					"profilePath": "name",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_NAME_SELECTOR_HINT,
				},
				{
					"key": "slug",
					"label": "Slug",
					"profilePath": "profile_data.slug",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_SLUG_SELECTOR_HINT,
				},
				{
					"key": "website",
					"label": "Website",
					"labelAliases": ["Url"],
					"profilePath": "website_url",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_WEBSITE_SELECTOR_HINT,
				},
				{
					"key": "tagline",
					"label": "Tagline",
					"profilePath": "tagline",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_TAGLINE_SELECTOR_HINT,
					"maxScalarLength": BUSINESS_PROFILE_DIRECTORY_TAGLINE_MAX,
					"required": true,
				},
				{
					"key": "category",
					"label": "Category",
					"profilePath": "profile_data.category",
					"fillMode": "select",
					"selectCatalog": "uneed",
					"selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], input[name*='categor' i]",
				},
				{
					"key": "pricing_type",
					"label": "Pricing",
					"profilePath": "profile_data.pricing_type",
					"fillMode": "select",
					"selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]",
				},
				UNEED_PRODUCT_TAGS_FIELD,
				{
					"key": "is_open_source",
					"label": "Open source",
					"profilePath": "profile_data.is_open_source",
					"fillMode": "boolean",
					"selectorHint": "input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i]",
				},
				{
					"key": "repository_url",
					"label": "Repository URL",
					"profilePath": "profile_data.repository_url",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_REPOSITORY_SELECTOR_HINT,
				},
				{
					"key": "description",
					"label": "Rich description",
					"profilePath": "description",
					"fillMode": "rich_html",
					"selectorHint": UNEED_PRODUCT_DESCRIPTION_SELECTOR_HINT,
				},
			],
		},
		{
			"id": "media",
			"label": "Media",
			"fields": [
				{
					"key": "logo",
					"label": "Logo",
					"profilePath": "logo_url",
					"selectorHint": "input[type='file'][accept*='image']",
				},
				{
					"key": "launch_video_url",
					"label": "Launch video URL",
					"profilePath": "profile_data.launch_video_url",
					"fillMode": "text",
					"selectorHint": UNEED_LAUNCH_VIDEO_SELECTOR_HINT,
				},
				{
					"key": "gallery",
					"label": "Gallery images",
					"profilePath": "profile_data.gallery_urls",
					"selectorHint": "input[type='file'][accept*='image']:not(:first-of-type)",
				},
			],
		},
		{
			"id": "socials",
			"label": "Socials",
			"fields": [
				{
					"key": "social_x",
					"label": "X (Twitter)",
					"labelAliases": ["Twitter"],
					"profilePath": "profile_data.social_x",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_X_SELECTOR_HINT,
				},
				{
					"key": "social_github",
					"label": "GitHub",
					"profilePath": "profile_data.social_github",
					"profileSourcePaths": ["profile_data.repository_url"],
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_GITHUB_SELECTOR_HINT,
				},
				{
					"key": "social_instagram",
					"label": "Instagram",
					"profilePath": "profile_data.social_instagram",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_INSTAGRAM_SELECTOR_HINT,
				},
				{
					"key": "social_linkedin",
					"label": "LinkedIn",
					"profilePath": "profile_data.social_linkedin",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_LINKEDIN_SELECTOR_HINT,
				},
				{
					"key": "social_tiktok",
					"label": "TikTok",
					"profilePath": "profile_data.social_tiktok",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_TIKTOK_SELECTOR_HINT,
				},
				{
					"key": "social_facebook",
					"label": "Facebook",
					"profilePath": "profile_data.social_facebook",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_FACEBOOK_SELECTOR_HINT,
				},
				{
					"key": "social_youtube",
					"label": "YouTube",
					"profilePath": "profile_data.social_youtube",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_YOUTUBE_SELECTOR_HINT,
				},
				{
					"key": "social_bluesky",
					"label": "Bluesky",
					"profilePath": "profile_data.social_bluesky",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_BLUESKY_SELECTOR_HINT,
				},
			],
		},
		{
			"id": "sell",
			"label": "Sell",
			"fields": [
				{
					"key": "acquisition_listed",
					"label": "Listed for acquisition",
					"profilePath": "profile_data.acquisition_listed",
					"fillMode": "boolean",
					"selectorHint": "input[type='checkbox'][name*='acquisition' i], input[type='checkbox'][name*='sell' i], [role='switch'][aria-label*='acquisition' i]",
				},
				{
					"key": "asking_price_usd",
					"label": "Asking price (USD)",
					"profilePath": "profile_data.asking_price_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='asking' i], input[name*='price' i][type='number'], input[placeholder*='asking' i]",
				},
				{
					"key": "ttm_revenue_usd",
					"label": "TTM revenue (USD)",
					"profilePath": "profile_data.ttm_revenue_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='ttm' i][name*='revenue' i], input[name*='ttm_revenue' i], input[placeholder*='TTM revenue' i]",
				},
				{
					"key": "monthly_revenue_usd",
					"label": "Monthly revenue (USD)",
					"profilePath": "profile_data.monthly_revenue_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='monthly' i][name*='revenue' i], input[name*='monthly_revenue' i]",
				},
				{
					"key": "ttm_profit_usd",
					"label": "TTM profit (USD)",
					"profilePath": "profile_data.ttm_profit_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='ttm' i][name*='profit' i], input[name*='ttm_profit' i]",
				},
				{
					"key": "monthly_profit_usd",
					"label": "Monthly profit (USD)",
					"profilePath": "profile_data.monthly_profit_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='monthly' i][name*='profit' i], input[name*='monthly_profit' i]",
				},
				{
					"key": "selling_reason",
					"label": "Selling reason",
					"profilePath": "profile_data.selling_reason",
					"fillMode": "text",
					"selectorHint": "textarea[name*='reason' i], textarea[name*='selling' i], textarea[placeholder*='reason' i]",
				},
				{
					"key": "included_assets",
					"label": "Included assets",
					"profilePath": "profile_data.included_assets",
					"fillMode": "tags",
					"selectorHint": "input[type='checkbox'][name*='asset' i], fieldset[name*='included' i] input[type='checkbox']",
				},
			],
		},
	],
	"proof": {
		"successPathRegex": "/product/|/launch/",
		"listingUrlSelector": "a[href*='uneed.best'][href*='/product']",
	},
} as const satisfies AutoLaunchExtensionConfig;

/** Readable mirror of `auto_launch_destinations.extension_config` for SQL seed parity (drift-tested). */
export const UNEED_PAID_LAUNCH_EXTENSION_CONFIG = {
	"version": 1,
	"startUrlPatterns": [
		"https://uneed.best/*",
		"https://www.uneed.best/*",
	],
	"readyUrlHint": "your-tools",
	"steps": [
		{
			"id": "general",
			"label": "General",
			"fields": [
				{
					"key": "name",
					"label": "Product name",
					"labelAliases": ["Name"],
					"profilePath": "name",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_NAME_SELECTOR_HINT,
				},
				{
					"key": "slug",
					"label": "Slug",
					"profilePath": "profile_data.slug",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_SLUG_SELECTOR_HINT,
				},
				{
					"key": "website",
					"label": "Website",
					"labelAliases": ["Url"],
					"profilePath": "website_url",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_WEBSITE_SELECTOR_HINT,
				},
				{
					"key": "tagline",
					"label": "Tagline",
					"profilePath": "tagline",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_TAGLINE_SELECTOR_HINT,
					"maxScalarLength": BUSINESS_PROFILE_DIRECTORY_TAGLINE_MAX,
					"required": true,
				},
				{
					"key": "category",
					"label": "Category",
					"profilePath": "profile_data.category",
					"fillMode": "select",
					"selectCatalog": "uneed",
					"selectorHint": "select[name*='categor' i], [role='combobox'][aria-label*='categor' i], input[name*='categor' i]",
				},
				{
					"key": "pricing_type",
					"label": "Pricing",
					"profilePath": "profile_data.pricing_type",
					"fillMode": "select",
					"selectorHint": "select[name*='pricing' i], [role='combobox'][aria-label*='pricing' i]",
				},
				UNEED_PRODUCT_TAGS_FIELD,
				{
					"key": "is_open_source",
					"label": "Open source",
					"profilePath": "profile_data.is_open_source",
					"fillMode": "boolean",
					"selectorHint": "input[type='checkbox'][name*='open' i], [role='switch'][aria-label*='open source' i]",
				},
				{
					"key": "repository_url",
					"label": "Repository URL",
					"profilePath": "profile_data.repository_url",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_REPOSITORY_SELECTOR_HINT,
				},
				{
					"key": "description",
					"label": "Rich description",
					"profilePath": "description",
					"fillMode": "rich_html",
					"selectorHint": UNEED_PRODUCT_DESCRIPTION_SELECTOR_HINT,
				},
			],
		},
		{
			"id": "media",
			"label": "Media",
			"fields": [
				{
					"key": "logo",
					"label": "Logo",
					"profilePath": "logo_url",
					"selectorHint": "input[type='file'][accept*='image']",
				},
				{
					"key": "launch_video_url",
					"label": "Launch video URL",
					"profilePath": "profile_data.launch_video_url",
					"fillMode": "text",
					"selectorHint": UNEED_LAUNCH_VIDEO_SELECTOR_HINT,
				},
				{
					"key": "gallery",
					"label": "Gallery images",
					"profilePath": "profile_data.gallery_urls",
					"selectorHint": "input[type='file'][accept*='image']:not(:first-of-type)",
				},
			],
		},
		{
			"id": "socials",
			"label": "Socials",
			"fields": [
				{
					"key": "social_x",
					"label": "X (Twitter)",
					"labelAliases": ["Twitter"],
					"profilePath": "profile_data.social_x",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_X_SELECTOR_HINT,
				},
				{
					"key": "social_github",
					"label": "GitHub",
					"profilePath": "profile_data.social_github",
					"profileSourcePaths": ["profile_data.repository_url"],
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_GITHUB_SELECTOR_HINT,
				},
				{
					"key": "social_instagram",
					"label": "Instagram",
					"profilePath": "profile_data.social_instagram",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_INSTAGRAM_SELECTOR_HINT,
				},
				{
					"key": "social_linkedin",
					"label": "LinkedIn",
					"profilePath": "profile_data.social_linkedin",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_LINKEDIN_SELECTOR_HINT,
				},
				{
					"key": "social_tiktok",
					"label": "TikTok",
					"profilePath": "profile_data.social_tiktok",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_TIKTOK_SELECTOR_HINT,
				},
				{
					"key": "social_facebook",
					"label": "Facebook",
					"profilePath": "profile_data.social_facebook",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_FACEBOOK_SELECTOR_HINT,
				},
				{
					"key": "social_youtube",
					"label": "YouTube",
					"profilePath": "profile_data.social_youtube",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_YOUTUBE_SELECTOR_HINT,
				},
				{
					"key": "social_bluesky",
					"label": "Bluesky",
					"profilePath": "profile_data.social_bluesky",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_BLUESKY_SELECTOR_HINT,
				},
			],
		},
		{
			"id": "sell",
			"label": "Sell",
			"fields": [
				{
					"key": "acquisition_listed",
					"label": "Listed for acquisition",
					"profilePath": "profile_data.acquisition_listed",
					"fillMode": "boolean",
					"selectorHint": "input[type='checkbox'][name*='acquisition' i], input[type='checkbox'][name*='sell' i], [role='switch'][aria-label*='acquisition' i]",
				},
				{
					"key": "asking_price_usd",
					"label": "Asking price (USD)",
					"profilePath": "profile_data.asking_price_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='asking' i], input[name*='price' i][type='number'], input[placeholder*='asking' i]",
				},
				{
					"key": "ttm_revenue_usd",
					"label": "TTM revenue (USD)",
					"profilePath": "profile_data.ttm_revenue_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='ttm' i][name*='revenue' i], input[name*='ttm_revenue' i], input[placeholder*='TTM revenue' i]",
				},
				{
					"key": "monthly_revenue_usd",
					"label": "Monthly revenue (USD)",
					"profilePath": "profile_data.monthly_revenue_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='monthly' i][name*='revenue' i], input[name*='monthly_revenue' i]",
				},
				{
					"key": "ttm_profit_usd",
					"label": "TTM profit (USD)",
					"profilePath": "profile_data.ttm_profit_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='ttm' i][name*='profit' i], input[name*='ttm_profit' i]",
				},
				{
					"key": "monthly_profit_usd",
					"label": "Monthly profit (USD)",
					"profilePath": "profile_data.monthly_profit_usd",
					"fillMode": "text",
					"selectorHint": "input[name*='monthly' i][name*='profit' i], input[name*='monthly_profit' i]",
				},
				{
					"key": "selling_reason",
					"label": "Selling reason",
					"profilePath": "profile_data.selling_reason",
					"fillMode": "text",
					"selectorHint": "textarea[name*='reason' i], textarea[name*='selling' i], textarea[placeholder*='reason' i]",
				},
				{
					"key": "included_assets",
					"label": "Included assets",
					"profilePath": "profile_data.included_assets",
					"fillMode": "tags",
					"selectorHint": "input[type='checkbox'][name*='asset' i], fieldset[name*='included' i] input[type='checkbox']",
				},
			],
		},
		{
			"id": "launch_notes",
			"label": "Launch details",
			"fields": [
				{
					"key": "launch_date",
					"label": "Preferred launch date",
					"profilePath": "profile_data.launch_date",
					"fillMode": "text",
					"selectorHint": "input[type='date'], [data-test*='date' i]",
				},
				{
					"key": "tier_note",
					"label": "Tier or promo code",
					"profilePath": "profile_data.paid_tier_note",
					"fillMode": "text",
					"selectorHint": "input[name*='promo' i], input[name*='code' i]",
				},
			],
		},
	],
	"proof": {
		"successPathRegex": "/product/|/launch/",
		"listingUrlSelector": "a[href*='uneed.best'][href*='/product']",
	},
} as const satisfies AutoLaunchExtensionConfig;

/** Readable mirror of `auto_launch_destinations.extension_config` for SQL seed parity (drift-tested). */
export const UNEED_MAKER_PROFILE_EXTENSION_CONFIG = {
	"version": 1,
	"startUrlPatterns": [
		"https://uneed.best/*",
		"https://www.uneed.best/*",
	],
	"readyUrlHint": "profile",
	"steps": [
		{
			"id": "profile_info",
			"label": "Profile",
			"fields": [
				{
					"key": "name",
					"label": "Display name",
					"profilePath": "name",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_NAME_SELECTOR_HINT,
				},
				{
					"key": "website",
					"label": "Website",
					"profilePath": "website_url",
					"fillMode": "text",
					"selectorHint": UNEED_PRODUCT_WEBSITE_SELECTOR_HINT,
				},
				{
					"key": "tagline",
					"label": "Bio or tagline",
					"profilePath": "tagline",
					"fillMode": "text",
					"selectorHint": "textarea[name*='bio' i], textarea[name*='about' i], textarea[name*='tagline' i]",
				},
			],
		},
		{
			"id": "socials",
			"label": "Socials",
			"fields": [
				{
					"key": "social_x",
					"label": "X (Twitter)",
					"labelAliases": ["Twitter"],
					"profilePath": "profile_data.social_x",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_X_SELECTOR_HINT,
				},
				{
					"key": "social_github",
					"label": "GitHub",
					"profilePath": "profile_data.social_github",
					"profileSourcePaths": ["profile_data.repository_url"],
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_GITHUB_SELECTOR_HINT,
				},
				{
					"key": "social_instagram",
					"label": "Instagram",
					"profilePath": "profile_data.social_instagram",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_INSTAGRAM_SELECTOR_HINT,
				},
				{
					"key": "social_linkedin",
					"label": "LinkedIn",
					"profilePath": "profile_data.social_linkedin",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_LINKEDIN_SELECTOR_HINT,
				},
				{
					"key": "social_tiktok",
					"label": "TikTok",
					"profilePath": "profile_data.social_tiktok",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_TIKTOK_SELECTOR_HINT,
				},
				{
					"key": "social_facebook",
					"label": "Facebook",
					"profilePath": "profile_data.social_facebook",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_FACEBOOK_SELECTOR_HINT,
				},
				{
					"key": "social_youtube",
					"label": "YouTube",
					"profilePath": "profile_data.social_youtube",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_YOUTUBE_SELECTOR_HINT,
				},
				{
					"key": "social_bluesky",
					"label": "Bluesky",
					"profilePath": "profile_data.social_bluesky",
					"fillMode": "text",
					"selectorHint": UNEED_SOCIAL_BLUESKY_SELECTOR_HINT,
				},
			],
		},
	],
	"proof": {
		"successPathRegex": "/profile/",
		"listingUrlSelector": "a[href*='uneed.best/profile']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const UNEED_HOST_PATTERNS = [
	'https://uneed.best/*',
	'https://www.uneed.best/*',
] as const;

export const UNEED_HOST_PERMISSION = '*://*.uneed.best/*';

const UNEED_JOIN_LINE: DirectoryLaunchProvider = {
	identifier: 'uneed-join-line',
	name: 'Uneed — Join the line',
	tierLabel: 'Free',
	defaultStartUrl: 'https://www.uneed.best/your-tools',
	contentScriptEntry: 'content/directory-launch/openquok-directory-uneed.js',
	hostPatterns: UNEED_HOST_PATTERNS,
	hostPermission: UNEED_HOST_PERMISSION,
};

const UNEED_PAID_LAUNCH: DirectoryLaunchProvider = {
	identifier: 'uneed-paid-launch',
	name: 'Uneed — Paid launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://www.uneed.best/your-tools',
	contentScriptEntry: 'content/directory-launch/openquok-directory-uneed.js',
	hostPatterns: UNEED_HOST_PATTERNS,
	hostPermission: UNEED_HOST_PERMISSION,
};

const UNEED_MAKER_PROFILE: DirectoryLaunchProvider = {
	identifier: 'uneed-maker-profile',
	name: 'Uneed — Maker profile',
	tierLabel: 'Free',
	defaultStartUrl: 'https://uneed.best/profile',
	contentScriptEntry: 'content/directory-launch/openquok-directory-uneed.js',
	hostPatterns: UNEED_HOST_PATTERNS,
	hostPermission: UNEED_HOST_PERMISSION,
};

export const UNEED_DIRECTORY_LAUNCH_PROVIDERS = [
	UNEED_JOIN_LINE,
	UNEED_PAID_LAUNCH,
	UNEED_MAKER_PROFILE,
] as const satisfies readonly DirectoryLaunchProvider[];

// --- Uneed top-level categories (https://www.uneed.best/categories) — `selectCatalog: 'uneed'` ---

/** Official Uneed product categories from https://www.uneed.best/categories (2026-11-11). */
export const UNEED_OFFICIAL_CATEGORY_LABELS = [
	'Development',
	'Design',
	'Marketing',
	'Business',
] as const;

export type UneedOfficialCategoryLabel = (typeof UNEED_OFFICIAL_CATEGORY_LABELS)[number];

export function normalizeUneedCategoryLabel(raw: string): string {
	return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function matchUneedOfficialCategory(raw: string): string | null {
	const norm = normalizeUneedCategoryLabel(raw);
	for (const label of UNEED_OFFICIAL_CATEGORY_LABELS) {
		if (normalizeUneedCategoryLabel(label) === norm) return label;
	}
	return null;
}

export function coerceToUneedOfficialCategory(raw: string): string {
	const official = matchUneedOfficialCategory(raw);
	if (official) return official;
	const norm = normalizeUneedCategoryLabel(raw);
	for (const label of UNEED_OFFICIAL_CATEGORY_LABELS) {
		if (norm.includes(normalizeUneedCategoryLabel(label))) return label;
	}
	const aliases: Record<string, UneedOfficialCategoryLabel> = {
		devtools: 'Development',
		'developer tools': 'Development',
		engineering: 'Development',
		saas: 'Business',
		productivity: 'Business',
	};
	for (const [needle, label] of Object.entries(aliases)) {
		if (norm.includes(needle)) return label;
	}
	return raw.trim();
}

export function uneedSelectCatalogOptions(
	catalog: LaunchStepField['selectCatalog']
): readonly string[] {
	if (catalog === 'uneed') return UNEED_OFFICIAL_CATEGORY_LABELS;
	return [];
}

/** Uneed listing pricing combobox labels (EditionForm). */
export const UNEED_OFFICIAL_PRICING_LABELS = ['Free', 'Freemium', 'Paid'] as const;

export function coerceUneedPricingType(raw: string): string {
	const norm = raw.trim().toLowerCase();
	if (!norm) return raw.trim();
	for (const label of UNEED_OFFICIAL_PRICING_LABELS) {
		if (norm === label.toLowerCase()) return label;
	}
	if (norm === 'free' || norm.includes('free tier')) return 'Free';
	if (norm.includes('freemium') || norm.includes('free plan')) return 'Freemium';
	if (norm === 'paid' || norm.includes('subscription') || norm.includes('paid plan')) {
		return 'Paid';
	}
	return raw.trim();
}

// --- Uneed official tag catalog (https://www.uneed.best/tags) — used when `tagsCatalog: 'uneed'` ---

/** Official Uneed tag labels from https://www.uneed.best/tags (scraped 2026-11-11). */
export const UNEED_OFFICIAL_TAG_LABELS = [
	'3D',
	'AB Testing',
	'Accessibility',
	'Advertising',
	'Affiliation',
	'Agile',
	'AI',
	'AI Agents',
	'AI Coding',
	'Analytics',
	'Android',
	'Audio',
	'Automation',
	'Avatars',
	'Backgrounds',
	'Blogging',
	'Boilerplate',
	'Bookmarks',
	'Books',
	'Briefs',
	'Browser Extensions',
	'Browsers',
	'Business',
	'Calendar',
	'Cars',
	'Changelogs',
	'Charts',
	'Chatbots',
	'Christian',
	'CI CD',
	'CMS',
	'Coaching',
	'Cold Emails',
	'Colors',
	'Communication',
	'Community',
	'Conversion',
	'Cooking',
	'Coworking',
	'CRM',
	'Crypto',
	'Cryptography',
	'CSS',
	'Customer Service',
	'Dashboards',
	'Database',
	'Demos',
	'Design',
	'Design System',
	'Desktop Apps',
	'Development',
	'Dictation',
	'Directories',
	'Discord',
	'Documentation',
	'Domains',
	'Ebook',
	'Education',
	'Email Provider',
	'Emails',
	'Engineering',
	'Environment',
	'Events',
	'Excel',
	'Feedback',
	'Figma',
	'File Sharing',
	'Fitness',
	'Food Menu',
	'Forms',
	'Freelance',
	'Fun',
	'Funding',
	'Gaming',
	'GDPR',
	'Git',
	'Gradients',
	'Gumroad',
	'Habits',
	'Happiness',
	'Health',
	'Hiring',
	'Hosting',
	'Human Resources',
	'Icons',
	'Idea validation',
	'Illustrations',
	'Image Optimization',
	'Indie Making',
	'Influencers',
	'Inspiration',
	'Instagram',
	'Interior Design',
	'Investing',
	'Invoicing',
	'iOS',
	'Jobs',
	'Journaling',
	'Kids',
	'Knowledge Bases',
	'Language Learning',
	'Lead Acquisition',
	'Legal',
	'Lifestyle',
	'Linkedin',
	'Logos',
	'MacOS',
	'Markdown',
	'Marketing',
	'MCP',
	'Meetings',
	'Moderation',
	'Monitoring',
	'Music',
	'News',
	'Newsletter',
	'Notion',
	'Nutrition',
	'Onboarding',
	'Open Source',
	'Partnerships',
	'Password Manager',
	'PDF',
	'Personal assistant',
	'Personal Finances',
	'Pets',
	'Photography',
	'Pitch Decks',
	'Podcasts',
	'Privacy',
	'Productivity',
	'Project Management',
	'Prototyping',
	'Python',
	'QR Codes',
	'Real Estate',
	'Reddit',
	'Reports',
	'Research',
	'Resume',
	'Roadmap',
	'Sales',
	'Scraping',
	'Screen Recording',
	'Screenshots',
	'Search Engine',
	'Security',
	'SEO',
	'Shopify',
	'Shortlinks',
	'Slack',
	'Smartphones',
	'Social Media',
	'Software',
	'Sports',
	'SQL',
	'Stats',
	'Surveys',
	'SVG',
	'Tailwindcss',
	'Teaching',
	'Templates',
	'Terminal',
	'Testimonials',
	'Testing',
	'Ticketing',
	'TikTok',
	'Time Tracking',
	'Tracking',
	'Transcription',
	'Translations',
	'Traveling',
	'Twitter',
	'Typography',
	'UI Kit',
	'Upscaling',
	'Uptime',
	'User Management',
	'Video',
	'VSCode',
	'Waitlists',
	'Wallpapers',
	'Web3',
	'Webflow',
	'Website Builders',
	'Windows',
	'Writing',
	'YouTube',
] as const;

export type UneedOfficialTagLabel = (typeof UNEED_OFFICIAL_TAG_LABELS)[number];

export function normalizeUneedTagLabel(raw: string): string {
	return raw.trim().replace(/^#/, '').replace(/\s+/g, ' ').toLowerCase();
}

let uneedOfficialTagLookup: Set<string> | null = null;

function uneedOfficialTagLookupSet(): Set<string> {
	if (!uneedOfficialTagLookup) {
		uneedOfficialTagLookup = new Set(
			UNEED_OFFICIAL_TAG_LABELS.map((label) => normalizeUneedTagLabel(label))
		);
	}
	return uneedOfficialTagLookup;
}

export function isUneedOfficialTag(raw: string): boolean {
	return uneedOfficialTagLookupSet().has(normalizeUneedTagLabel(raw));
}

export function matchUneedOfficialTag(raw: string): string | null {
	const norm = normalizeUneedTagLabel(raw);
	for (const label of UNEED_OFFICIAL_TAG_LABELS) {
		if (normalizeUneedTagLabel(label) === norm) return label;
	}
	return null;
}

/** Map profile chips to official Uneed labels (case/whitespace insensitive). */
export function filterToUneedOfficialTags(items: readonly string[]): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const item of items) {
		const official = matchUneedOfficialTag(item);
		if (!official) continue;
		const key = normalizeUneedTagLabel(official);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(official);
	}
	return out;
}
