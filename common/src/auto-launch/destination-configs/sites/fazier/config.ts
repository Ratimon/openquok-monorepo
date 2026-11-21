import type {
	AutoLaunchExtensionConfig,
	DirectoryLaunchProvider,
} from '../../../../browser-extension/pageAssist.js';
import { BUSINESS_PROFILE_DIRECTORY_TAGLINE_MAX } from '../../../businessProfileData.js';

/** Fazier React Hook Form `name` attributes (verified from shipped page bundles). */
const FAZIER_NAME_SELECTOR = "input[name='name']";
const FAZIER_COMPANY_SLUG_SELECTOR = "input[name='company']";
const FAZIER_WEBSITE_SELECTOR =
	"input[name='website'], input[type='url'][placeholder*='https' i]";
const FAZIER_TAGLINE_SELECTOR = "input[name='tagline'], textarea[name='tagline']";
const FAZIER_LOGO_FILE_SELECTOR =
	"input[type='file'][name='logo'], input[type='file'][accept*='image']";
const FAZIER_INDUSTRY_SELECTOR = "input[name='industry']";
const FAZIER_ABOUT_SELECTOR = "textarea[name='about']";
const FAZIER_CITY_SELECTOR = "input[name='city']";
const FAZIER_COUNTRY_SELECTOR =
	"select[name='country'], [role='combobox'][aria-label*='country' i]";
const FAZIER_COMPANY_SIZE_SELECTOR =
	"select[name='companySize'], [role='combobox'][aria-label*='size' i]";
const FAZIER_COMPANY_TYPE_SELECTOR =
	"select[name='companyType'], [role='combobox'][aria-label*='type' i]";
const FAZIER_FOUNDED_MONTH_SELECTOR =
	"select[name='month'], [role='combobox'][aria-label*='month' i]";
const FAZIER_FOUNDED_YEAR_SELECTOR =
	"select[name='year'], [role='combobox'][aria-label*='year' i]";
const FAZIER_PAGE_LINKEDIN_SELECTOR = "input[name='linkedin']";
const FAZIER_PAGE_TWITTER_SELECTOR = "input[name='twitter']";
const FAZIER_LAUNCH_LINKEDIN_SELECTOR =
	"input[name='linkdinUrl'], input[name='linkedin']";
const FAZIER_LAUNCH_TWITTER_SELECTOR =
	"input[name='twitterUrl'], input[name='twitter']";
const FAZIER_LAUNCH_DESCRIPTION_SELECTOR =
	"textarea[name='description'], textarea[placeholder*='description' i]";
const FAZIER_LAUNCH_FEATURES_SELECTOR =
	"textarea[name='features'], input[name='features']";
const FAZIER_LAUNCH_USE_CASES_SELECTOR =
	"textarea[name='useCases'], input[name='useCases']";
const FAZIER_LAUNCH_CATEGORY_SELECTOR =
	"select[name='category'], [role='combobox'][aria-label*='categor' i]";
const FAZIER_LAUNCH_PLAN_TYPE_SELECTOR =
	"input[type='radio'][name='planType'], input[name='planType']";
const FAZIER_LAUNCH_PAYMENT_PLAN_SELECTOR =
	"input[type='radio'][name='paymentPlan'], input[name='paymentPlan']";

/** Fazier directory launch — company page + product launch on fazier.com. */
export const FAZIER_PAGE_EXTENSION_CONFIG = {
	version: 1,
	startUrlPatterns: ['https://fazier.com/*', 'https://www.fazier.com/*'],
	readyUrlHint: 'page/new',
	readyStatusHint:
		'On fazier.com/page/new, complete any listing-type or sign-in gate Fazier shows, then open the company wizard (Basic info → Overview → Social links). Use Fill all steps or Fill on each row—review every field before you submit on Fazier.',
	steps: [
		{
			id: 'basic',
			label: 'Basic info',
			fields: [
				{
					key: 'name',
					label: 'Name',
					labelAliases: ['Organization name'],
					profilePath: 'name',
					fillMode: 'text',
					selectorHint: FAZIER_NAME_SELECTOR,
					required: true,
				},
				{
					key: 'company_slug',
					label: 'Page URL',
					labelAliases: ['company-slug'],
					profilePath: 'profile_data.slug',
					fillMode: 'text',
					selectorHint: FAZIER_COMPANY_SLUG_SELECTOR,
				},
				{
					key: 'website',
					label: 'Website',
					profilePath: 'website_url',
					fillMode: 'text',
					selectorHint: FAZIER_WEBSITE_SELECTOR,
					required: true,
				},
				{
					key: 'logo',
					label: 'Logo',
					profilePath: 'logo_url',
					fillMode: 'file',
					fileInputIndex: 0,
					selectorHint: FAZIER_LOGO_FILE_SELECTOR,
					required: true,
				},
				{
					key: 'tagline',
					label: 'Tagline',
					labelAliases: ['One-line description of your organization'],
					profilePath: 'tagline',
					fillMode: 'text',
					selectorHint: FAZIER_TAGLINE_SELECTOR,
					maxScalarLength: 120,
					required: true,
				},
			],
		},
		{
			id: 'overview',
			label: 'Overview',
			fields: [
				{
					key: 'industry',
					label: 'Industry',
					profilePath: 'profile_data.categories',
					fillMode: 'text',
					selectorHint: FAZIER_INDUSTRY_SELECTOR,
				},
				{
					key: 'company_size',
					label: 'Company size',
					profilePath: 'profile_data.target_audiences',
					fillMode: 'select',
					selectorHint: FAZIER_COMPANY_SIZE_SELECTOR,
				},
				{
					key: 'company_type',
					label: 'Organization type',
					profilePath: 'profile_data.use_cases',
					fillMode: 'select',
					selectorHint: FAZIER_COMPANY_TYPE_SELECTOR,
				},
				{
					key: 'country',
					label: 'Country',
					profilePath: 'profile_data.platforms',
					fillMode: 'select',
					selectorHint: FAZIER_COUNTRY_SELECTOR,
				},
				{
					key: 'city',
					label: 'City',
					profilePath: 'profile_data.tech_stack',
					fillMode: 'text',
					selectorHint: FAZIER_CITY_SELECTOR,
				},
				{
					key: 'founded_month',
					label: 'Founded month',
					profilePath: 'profile_data.launch_date',
					fillMode: 'select',
					selectorHint: FAZIER_FOUNDED_MONTH_SELECTOR,
				},
				{
					key: 'founded_year',
					label: 'Founded year',
					profilePath: 'profile_data.launch_date',
					fillMode: 'select',
					selectorHint: FAZIER_FOUNDED_YEAR_SELECTOR,
				},
				{
					key: 'about',
					label: 'About',
					profilePath: 'description',
					fillMode: 'text',
					selectorHint: FAZIER_ABOUT_SELECTOR,
				},
			],
		},
		{
			id: 'social_links',
			label: 'Social links',
			fields: [
				{
					key: 'social_linkedin',
					label: 'LinkedIn',
					profilePath: 'profile_data.social_linkedin',
					fillMode: 'text',
					selectorHint: FAZIER_PAGE_LINKEDIN_SELECTOR,
				},
				{
					key: 'social_x',
					label: 'Twitter',
					labelAliases: ['X (Twitter)'],
					profilePath: 'profile_data.social_x',
					fillMode: 'text',
					selectorHint: FAZIER_PAGE_TWITTER_SELECTOR,
				},
			],
		},
	],
	proof: {
		successPathRegex: '/company/',
		listingUrlSelector: "a[href*='fazier.com/company/']",
	},
} as const satisfies AutoLaunchExtensionConfig;

const FAZIER_PRODUCT_LISTING_EXTENSION_BASE = {
	version: 1,
	startUrlPatterns: ['https://fazier.com/*', 'https://www.fazier.com/*'],
	readyUrlHint: 'submit',
	steps: [
		{
			id: 'product_info',
			label: 'Product info',
			fields: [
				{
					key: 'name',
					label: 'Product name',
					labelAliases: ['Name'],
					profilePath: 'name',
					fillMode: 'text',
					selectorHint: FAZIER_NAME_SELECTOR,
					required: true,
				},
				{
					key: 'tagline',
					label: 'Tagline',
					labelAliases: ['Describe your product in few words only'],
					profilePath: 'tagline',
					fillMode: 'text',
					selectorHint: FAZIER_TAGLINE_SELECTOR,
					maxScalarLength: BUSINESS_PROFILE_DIRECTORY_TAGLINE_MAX,
					required: true,
				},
				{
					key: 'website',
					label: 'Website',
					profilePath: 'website_url',
					fillMode: 'text',
					selectorHint: FAZIER_WEBSITE_SELECTOR,
					required: true,
				},
				{
					key: 'description',
					label: 'Description',
					labelAliases: ['Brief description of the product'],
					profilePath: 'description',
					fillMode: 'text',
					selectorHint: FAZIER_LAUNCH_DESCRIPTION_SELECTOR,
				},
				{
					key: 'features',
					label: 'Features',
					profilePath: 'profile_data.use_cases',
					fillMode: 'text',
					selectorHint: FAZIER_LAUNCH_FEATURES_SELECTOR,
				},
				{
					key: 'use_cases',
					label: 'Use cases',
					profilePath: 'profile_data.use_cases',
					fillMode: 'text',
					selectorHint: FAZIER_LAUNCH_USE_CASES_SELECTOR,
				},
				{
					key: 'logo',
					label: 'Square logo',
					profilePath: 'logo_url',
					fillMode: 'file',
					fileInputIndex: 0,
					selectorHint: FAZIER_LOGO_FILE_SELECTOR,
				},
				{
					key: 'gallery',
					label: 'Product images',
					profilePath: 'profile_data.gallery_urls',
					fillMode: 'files',
					fileInputIndex: 1,
					selectorHint:
						"input[type='file'][accept*='image']:not([name='logo']):not(:first-of-type)",
				},
			],
		},
		{
			id: 'classification',
			label: 'Classification',
			fields: [
				{
					key: 'category',
					label: 'Category',
					profilePath: 'profile_data.categories',
					fillMode: 'select',
					selectorHint: FAZIER_LAUNCH_CATEGORY_SELECTOR,
				},
				{
					key: 'pricing_type',
					label: 'Pricing',
					profilePath: 'profile_data.pricing_type',
					fillMode: 'select',
					selectorHint: `${FAZIER_LAUNCH_PLAN_TYPE_SELECTOR}, ${FAZIER_LAUNCH_PAYMENT_PLAN_SELECTOR}`,
				},
			],
		},
		{
			id: 'socials',
			label: 'Social links',
			fields: [
				{
					key: 'social_linkedin',
					label: 'LinkedIn',
					profilePath: 'profile_data.social_linkedin',
					fillMode: 'text',
					selectorHint: FAZIER_LAUNCH_LINKEDIN_SELECTOR,
				},
				{
					key: 'social_x',
					label: 'Twitter',
					labelAliases: ['X (Twitter)'],
					profilePath: 'profile_data.social_x',
					fillMode: 'text',
					selectorHint: FAZIER_LAUNCH_TWITTER_SELECTOR,
				},
			],
		},
	],
	proof: {
		successPathRegex: '/launches/|/p/',
		listingUrlSelector: "a[href*='fazier.com/launches/'], a[href*='fazier.com/p/']",
	},
} satisfies AutoLaunchExtensionConfig;

export const FAZIER_FREE_PRODUCT_LISTING_EXTENSION_CONFIG = {
	...FAZIER_PRODUCT_LISTING_EXTENSION_BASE,
	readyStatusHint:
		'On fazier.com/submit, choose Product launch (not Company page). Pick Basic (free) when Fazier shows plan tiers. When product fields are visible, use Fill all steps or Fill on each row—then complete badge, comments, and moderation on Fazier.',
} satisfies AutoLaunchExtensionConfig;

export const FAZIER_PAID_PRODUCT_LISTING_EXTENSION_CONFIG = {
	...FAZIER_PRODUCT_LISTING_EXTENSION_BASE,
	readyStatusHint:
		'On fazier.com/submit, choose Product launch (not Company page). Pick Lite Plan or higher when Fazier shows plan tiers. When product fields are visible, use Fill all steps or Fill on each row—then finish checkout on Fazier.',
} satisfies AutoLaunchExtensionConfig;

export const FAZIER_HOST_PATTERNS = [
	'https://fazier.com/*',
	'https://www.fazier.com/*',
] as const;

export const FAZIER_HOST_PERMISSION = '*://*.fazier.com/*';

const FAZIER_PAGE: DirectoryLaunchProvider = {
	identifier: 'fazier-page',
	name: 'Fazier — Page',
	tierLabel: 'Free',
	defaultStartUrl: 'https://fazier.com/page/new',
	contentScriptEntry: 'content/directory-launch/openquok-directory-fazier.js',
	hostPatterns: FAZIER_HOST_PATTERNS,
	hostPermission: FAZIER_HOST_PERMISSION,
};

const FAZIER_FREE_PRODUCT_LISTING: DirectoryLaunchProvider = {
	identifier: 'fazier-free-product-listing',
	name: 'Fazier — Free product listing',
	tierLabel: 'Free',
	defaultStartUrl: 'https://fazier.com/submit',
	contentScriptEntry: 'content/directory-launch/openquok-directory-fazier.js',
	hostPatterns: FAZIER_HOST_PATTERNS,
	hostPermission: FAZIER_HOST_PERMISSION,
};

const FAZIER_PAID_PRODUCT_LISTING: DirectoryLaunchProvider = {
	identifier: 'fazier-paid-product-listing',
	name: 'Fazier — Paid product listing',
	tierLabel: 'Paid',
	defaultStartUrl: 'https://fazier.com/submit',
	contentScriptEntry: 'content/directory-launch/openquok-directory-fazier.js',
	hostPatterns: FAZIER_HOST_PATTERNS,
	hostPermission: FAZIER_HOST_PERMISSION,
};

export const FAZIER_DIRECTORY_LAUNCH_PROVIDERS = [
	FAZIER_PAGE,
	FAZIER_FREE_PRODUCT_LISTING,
	FAZIER_PAID_PRODUCT_LISTING,
] as const satisfies readonly DirectoryLaunchProvider[];