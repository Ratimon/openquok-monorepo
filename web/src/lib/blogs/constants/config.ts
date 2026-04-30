import type { ModuleConfigSchema } from '$lib/config/constants/types';

export const BLOG_IMAGES_BUCKET = 'blog_images' as const;

export const CONFIG_SCHEMA_BLOG: ModuleConfigSchema = {
	BLOG_POST_SEO_META_TITLE: {
		description: 'SEO meta title for the public blog overview page at `your-url.com/blog`.',
		type: 'string',
		default: 'Blog',
		inputType: 'input',
		maxInputLength: 60
	},
	BLOG_POST_SEO_META_DESCRIPTION: {
		description: 'SEO meta description for the public blog overview page at `your-url.com/blog`.',
		type: 'string',
		default: 'Here you can find all published blog posts.',
		inputType: 'textarea',
		maxInputLength: 160
	},
	BLOG_POST_SEO_META_TAGS: {
		description: 'SEO meta keywords for the public blog overview page (comma-separated).',
		type: 'string',
		default: 'blog, articles, news, content',
		inputType: 'input'
	}
};

