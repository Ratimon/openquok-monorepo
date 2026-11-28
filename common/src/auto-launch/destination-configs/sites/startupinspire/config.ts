import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
} from '../../../../browser-extension/pageAssist.js';

export const STARTUPINSPIRE_HOST_PATTERNS = [
	'https://startupinspire.com/*',
	'https://www.startupinspire.com/*',
] as const;

export const STARTUPINSPIRE_HOST_PERMISSION = '*://*.startupinspire.com/*';

const STARTUPINSPIRE_CONTENT_SCRIPT_ENTRY =
	'content/directory-launch/openquok-directory-startupinspire.js';

const STARTUPINSPIRE_CREATE_FORM_MANUAL_HINT =
	'Starter checkout, free-tier manual review, launch status, social links (LinkedIn, X, Product Hunt, …), reCAPTCHA, and final publish stay manual on StartupInspire.';

const STARTUPINSPIRE_CREATE_FORM_SIGN_IN_HINT =
	'Sign in on StartupInspire, then open the startup create or edit form before Fill.';

/** StartupInspire dashboard startup create/edit (`/dashboard/startup/create`, `/dashboard/startup/edit/*`). */
export const STARTUPINSPIRE_PAID_LISTING_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...STARTUPINSPIRE_HOST_PATTERNS],
	readyUrlHint: 'dashboard/startup',
	readyStatusHint:
		STARTUPINSPIRE_CREATE_FORM_SIGN_IN_HINT +
		' OpenQuok fills startup name, headline, description, website URL, logo, and technology/category when the form is visible. ' +
		STARTUPINSPIRE_CREATE_FORM_MANUAL_HINT +
		' After publish, confirm the website button on your public `/startup/{slug}` page has the link treatment you expect.',
	steps: [
		{
			id: 'create_startup',
			label: 'Create startup',
			fields: [
				{
					key: 'name',
					label: 'Startup name',
					labelAliases: ['Name'],
					profilePath: 'name',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[formcontrolname='startup_name'], input[name='startup_name'], input[aria-label*='startup name' i], input[placeholder*='startup name' i]",
				},
				{
					key: 'tagline',
					label: 'Headline',
					labelAliases: ['Tagline', 'Startup headline'],
					profilePath: 'tagline',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[formcontrolname='startup_headline'], input[name='startup_headline'], input[aria-label*='headline' i], input[placeholder*='headline' i]",
				},
				{
					key: 'description',
					label: 'Description',
					profilePath: 'description',
					fillMode: 'rich_html',
					required: true,
					selectorHint:
						"textarea[formcontrolname='startup_description'], textarea[name='startup_description'], [contenteditable='true'], .ProseMirror, .tiptap, textarea[aria-label*='description' i]",
				},
				{
					key: 'website',
					label: 'Website URL',
					labelAliases: ['Website', 'Startup URL'],
					profilePath: 'website_url',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[formcontrolname='startup_url'], input[name='startup_url'], input[type='url'], input[aria-label*='website' i], input[placeholder*='website' i]",
				},
				{
					key: 'technology',
					label: 'Technology Stack',
					labelAliases: ['Technology', 'Tech stack'],
					profilePath: 'profile_data.tech_stack',
					fillMode: 'tags',
					maxItems: 10,
					profileSourcePaths: ['profile_data.tech_stack'],
					selectorHint:
						"p-multiselect[formcontrolname='startup_technology'], [formcontrolname='startup_technology'].p-multiselect",
				},
				{
					key: 'logo',
					label: 'Logo',
					labelAliases: ['Startup logo', 'Upload Your Logo', 'Replace Logo'],
					profilePath: 'logo_url',
					fillMode: 'file',
					fileInputIndex: 0,
					required: true,
					selectorHint:
						"app-upload-single input[type=\"file\"], input[type=\"file\"][accept*=\"image\"]",
				},
				{
					key: 'gallery',
					label: 'Screenshots',
					labelAliases: ['Add Screenshots', 'Product screenshots'],
					profilePath: 'profile_data.gallery_urls',
					fillMode: 'files',
					maxItems: 5,
					selectorHint:
						'app-upload input[type=\"file\"], .upload-trigger input[type=\"file\"][multiple]',
				},
			],
		},
		{
			id: 'social_and_launch',
			label: 'Social & launch',
			fields: [],
		},
	],
	proof: {
		successPathRegex: '/startup/',
		listingUrlSelector: "a[href*='startupinspire.com/startup/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

export const STARTUPINSPIRE_FREE_LISTING_EXTENSION_CONFIG = {
	...STARTUPINSPIRE_PAID_LISTING_EXTENSION_CONFIG,
	readyUrlHint: 'pricing',
	readyStatusHint:
		'Open StartupInspire pricing, sign in if needed, then continue to the free tier or Starter checkout before the create form. ' +
		STARTUPINSPIRE_CREATE_FORM_SIGN_IN_HINT +
		' ' +
		STARTUPINSPIRE_CREATE_FORM_MANUAL_HINT,
} as const satisfies AutoLaunchExtensionConfig;

const STARTUPINSPIRE_PAID_LISTING: DirectoryLaunchProvider = {
	identifier: 'startupinspire-paid-listing',
	name: 'StartupInspire — Starter launch',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://www.startupinspire.com/dashboard/startup/create',
	contentScriptEntry: STARTUPINSPIRE_CONTENT_SCRIPT_ENTRY,
	hostPatterns: STARTUPINSPIRE_HOST_PATTERNS,
	hostPermission: STARTUPINSPIRE_HOST_PERMISSION,
};

const STARTUPINSPIRE_FREE_LISTING: DirectoryLaunchProvider = {
	identifier: 'startupinspire-free-listing',
	name: 'StartupInspire — Free listing',
	tierLabel: 'Free',
	defaultStartUrl: 'https://www.startupinspire.com/dashboard',
	contentScriptEntry: STARTUPINSPIRE_CONTENT_SCRIPT_ENTRY,
	hostPatterns: STARTUPINSPIRE_HOST_PATTERNS,
	hostPermission: STARTUPINSPIRE_HOST_PERMISSION,
};

export const STARTUPINSPIRE_DIRECTORY_LAUNCH_PROVIDERS = [
	STARTUPINSPIRE_FREE_LISTING,
	STARTUPINSPIRE_PAID_LISTING,
] as const satisfies readonly DirectoryLaunchProvider[];