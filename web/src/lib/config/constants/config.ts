import type { ModuleConfigSchema } from '$lib/config/constants/types';
import { getRootPathPublicBlog } from '$lib/area-public/constants/getRootPathPublicBlog';
import { route } from '$lib/utils/path';

const publicBlogPath = route(getRootPathPublicBlog());

const appName = 'Openquok';
const appTitle = 'Openquok';
const appDescription = 'Openquok web application';

function getApiBaseUrl(): string {
	if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
		return import.meta.env.VITE_API_BASE_URL as string;
	}
	if (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) {
		return process.env.VITE_API_BASE_URL as string;
	}
	return 'http://localhost:3000';
}

export const CONFIG_SCHEMA_BACKEND: ModuleConfigSchema = {
	API_BASE_URL: {
		description: 'The base URL for all backend API requests.',
		type: 'string',
		default: getApiBaseUrl(),
		inputType: 'input'
	}
};

export const CONFIG_SCHEMA_COMPANY: ModuleConfigSchema = {
	NAME: {
		description: "Company's trading name.",
		type: 'string',
		default: appName,
		inputType: 'input',
		maxInputLength: 60
	},
	URL: {
		description: 'Primary website URL.',
		type: 'string',
		default: 'https://openquok.com',
		inputType: 'input'
	},
	FOUNDING_YEAR: {
		description: 'Year the company was established.',
		type: 'string',
		default: new Date().getFullYear().toString(),
		inputType: 'input'
	},
	LEGAL_NAME: {
		description: "Company's legal name (if different from trading name).",
		type: 'string',
		default: appName,
		inputType: 'input',
		maxInputLength: 120
	},
	VAT_ID: {
		description: 'VAT / tax identifier.',
		type: 'string',
		default: '',
		inputType: 'input',
		maxInputLength: 64
	},
	COMPANY_ADDRESS: {
		description: 'Registered company address.',
		type: 'string',
		default: '',
		inputType: 'textarea',
		maxInputLength: 240
	},
	SUPPORT_EMAIL: {
		description: 'Support contact email (used by legal pages).',
		type: 'string',
		default: 'support@example.com',
		inputType: 'input',
		maxInputLength: 160
	},
	SUPPORT_PHONE: {
		description: 'Support contact phone.',
		type: 'string',
		default: '',
		inputType: 'input',
		maxInputLength: 40
	},
	RESPONSIBLE_PERSON: {
		description:
			'Name of the person legally responsible for site content (used by legal pages).',
		type: 'string',
		default: '',
		inputType: 'input',
		maxInputLength: 120
	}
};

export const CONFIG_SCHEMA_MARKETING: ModuleConfigSchema = {
	META_TITLE: {
		description: 'Default meta title.',
		type: 'string',
		default: appTitle,
		inputType: 'input'
	},
	META_DESCRIPTION: {
		description: 'Default meta description.',
		type: 'string',
		default: appDescription,
		inputType: 'textarea'
	},
	META_KEYWORDS: {
		description: 'Meta keywords, comma-separated.',
		type: 'string',
		default: 'content, cms',
		inputType: 'input'
	},
	SOCIAL_LINKS_X: {
		description: 'X (Twitter) profile URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	},
	SOCIAL_LINKS_FACEBOOK: {
		description: 'Facebook page URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	},
	SOCIAL_LINKS_INSTAGRAM: {
		description: 'Instagram profile URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	},
	SOCIAL_LINKS_YOUTUBE: {
		description: 'YouTube channel URL.',
		type: 'string',
		default: '',
		inputType: 'input'
	}
};

// Landing page (public home) content defaults
export const CONFIG_SCHEMA_LANDING_PAGE: ModuleConfigSchema = {
	HERO_TITLE: {
		description: 'The primary headline displayed in the hero section of your landing page',
		type: 'string',
		default: 'Automate your social scheduler — in minutes not hours',
		inputType: 'input',
		maxInputLength: 80
	},
	HERO_SLOGAN: {
		description: 'The secondary text or tagline shown below the hero title',
		type: 'string',
		default: 'Turn OpenClaw into autonomous social media manager with control built in',
		inputType: 'textarea',
		maxInputLength: 200
	},
	ACTIVE_TOP_BANNER: {
		description: 'Enable or disable the top banner display on the landing page',
		type: 'boolean',
		default: false,
		inputType: 'switch'
	}
};

export type NavOptions = 'tab' | 'scroll' | 'menu';

export interface DropdownLink {
	href: string;
	title: string;
}

export interface Link {
	pathname: string;
	title: string;
	navType: NavOptions;
	dropdownItems?: DropdownLink[];
	preload?: 'hover' | 'tap' | 'off' | 'intent';
}

export const PUBLIC_NAVBAR_LINKS: Link[] = [
	{ pathname: '/', title: 'Home', navType: 'tab' },
	{ pathname: publicBlogPath, title: 'Blog', navType: 'tab' }
];

export const PUBLIC_NAVBAR_MOBILE_LINKS: Link[] = [...PUBLIC_NAVBAR_LINKS];

export const PUBLIC_FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
	Resources: [
		{ label: 'Blog', href: publicBlogPath },
		{ label: 'Blog Topics', href: '/blog/topic' },
		{ label: 'Blog Authors', href: '/blog/author' }
	],
	Legal: [
		{ label: 'Terms', href: '/terms' },
		{ label: 'Privacy', href: '/privacy-policy' },
		{ label: 'Cookies', href: '/cookie-policy' }
	],
	Company: [
		{ label: 'About Us', href: '/about' },
		{ label: 'Sitemap', href: '/sitemap.xml' }
	]
};
