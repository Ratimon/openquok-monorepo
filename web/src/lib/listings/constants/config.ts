import type { ModuleConfigSchema } from '$lib/config/constants/types';

export const LISTING_IMAGES_BUCKET = 'listing_images' as const;


export const CONFIG_SCHEMA_LISTINGS: ModuleConfigSchema = {
	EXTENSIONS_META_TITLE: {
		description: 'SEO meta title for the public extensions overview page.',
		type: 'string',
		default: 'Skills & MCP Hub',
		inputType: 'input',
		maxInputLength: 60
	},
	EXTENSIONS_META_DESCRIPTION: {
		description: 'SEO meta description for the public extensions overview page.',
		type: 'string',
		default: 'Browse skills and MCP server extensions for your agent stack.',
		inputType: 'textarea',
		maxInputLength: 160
	},
	LISTING_SCHEMA_TYPE: {
		description: 'Schema.org type used for structured data on listing detail pages.',
		type: 'string',
		default: 'SoftwareApplication',
		inputType: 'input'
	}
};
