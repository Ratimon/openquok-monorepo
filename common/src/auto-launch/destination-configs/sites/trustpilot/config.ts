import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
} from '../../../../browser-extension/pageAssist.js';

export const TRUSTPILOT_HOST_PATTERNS = [
	'https://businessapp.b2b.trustpilot.com/*',
] as const;

export const TRUSTPILOT_HOST_PERMISSION = '*://businessapp.b2b.trustpilot.com/*';

const TRUSTPILOT_CONTENT_SCRIPT_ENTRY =
	'content/directory-launch/openquok-directory-trustpilot.js';

const TRUSTPILOT_COMPANY_SETTINGS_MANUAL_HINT =
	'Contact info (email, phone, address), Save and publish, homepage screenshot, and domain/business-email verification stay manual on Trustpilot.';

const TRUSTPILOT_COMPANY_SETTINGS_SIGN_IN_HINT =
	'Sign in to Trustpilot Business, then open company settings.';

/** Trustpilot Business company settings (`businessapp.b2b.trustpilot.com/company-settings/`). */
export const TRUSTPILOT_COMPANY_PROFILE_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: [...TRUSTPILOT_HOST_PATTERNS],
	readyUrlHint: 'company-settings',
	readyStatusHint:
		TRUSTPILOT_COMPANY_SETTINGS_SIGN_IN_HINT +
		' Expand “About your business” and “Company description” on Trustpilot before Fill — closed sections cause wrong fields to update. OpenQuok fills company name, domain, description, and logo (JPG or PNG about 400×300 within Trustpilot size limits). ' +
		TRUSTPILOT_COMPANY_SETTINGS_MANUAL_HINT +
		' Public trustpilot.com/review/… links to your website are typically nofollow — confirm rel after you publish.',
	steps: [
		{
			id: 'company_settings',
			label: 'Company settings',
			fields: [
				{
					key: 'name',
					label: 'Company name',
					labelAliases: ['Name'],
					profilePath: 'name',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[name*='company' i][name*='name' i], input[aria-label*='company name' i], input[placeholder*='company name' i], input[name*='name' i]:not([name*='user' i])",
				},
				{
					key: 'website',
					label: 'Company domain',
					labelAliases: ['Domain', 'Website', 'Website URL'],
					profilePath: 'website_url',
					fillMode: 'text',
					required: true,
					selectorHint:
						"input[name*='domain' i], input[aria-label*='domain' i], input[placeholder*='domain' i], input[type='url']",
				},
				{
					key: 'logo',
					label: 'Logo',
					labelAliases: ['Upload logo', 'Company logo'],
					profilePath: 'logo_url',
					fillMode: 'file',
					required: true,
					selectorHint:
						"input[type='file'][accept*='image'], input[type='file'][name*='logo' i]",
				},
			],
		},
		{
			id: 'company_description',
			label: 'Company description',
			fields: [
				{
					key: 'description',
					label: 'Describe your company',
					labelAliases: ['Description', 'Company description'],
					profilePath: 'description',
					fillMode: 'text',
					required: true,
					selectorHint:
						"textarea[name*='description' i], textarea[aria-label*='describe' i], textarea[placeholder*='describe' i], [contenteditable='true'][aria-label*='describe' i]",
				},
			],
		},
		{
			id: 'contact_info',
			label: 'Contact info',
			fields: [],
		},
	],
	proof: {
		successPathRegex: 'trustpilot\\.com/review/',
		listingUrlSelector: "a[href*='trustpilot.com/review']",
	},
} as const satisfies AutoLaunchExtensionConfig;

const TRUSTPILOT_COMPANY_PROFILE: DirectoryLaunchProvider = {
	identifier: 'trustpilot-company-profile',
	name: 'Trustpilot — Company profile',
	tierLabel: 'Free',
	defaultStartUrl: 'https://businessapp.b2b.trustpilot.com/company-settings/',
	contentScriptEntry: TRUSTPILOT_CONTENT_SCRIPT_ENTRY,
	hostPatterns: TRUSTPILOT_HOST_PATTERNS,
	hostPermission: TRUSTPILOT_HOST_PERMISSION,
};

export const TRUSTPILOT_DIRECTORY_LAUNCH_PROVIDERS = [
	TRUSTPILOT_COMPANY_PROFILE,
] as const satisfies readonly DirectoryLaunchProvider[];