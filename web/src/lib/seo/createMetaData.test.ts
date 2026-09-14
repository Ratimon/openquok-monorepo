import type {
	CompanyInformationProgrammerModel,
	MarketingInformationProgrammerModel
} from '$lib/area-public/publicInformation.types';

import { describe, expect, it } from 'vitest';

import {
	createMetaData,
	resolveDocumentTitleTemplate
} from '$lib/seo/createMetaData';
import {
	DEFAULT_OG_IMAGE_MIME,
	DEFAULT_OG_IMAGE_PATH,
	DEFAULT_OG_IMAGE_SPECS
} from '$lib/seo/ogImageDefaults';

const companyInformation: CompanyInformationProgrammerModel = {
	module_name: 'company_information',
	config: { NAME: 'OpenQuok', URL: 'https://www.openquok.com' },
	updated_at: ''
};

const marketingInformation: MarketingInformationProgrammerModel = {
	module_name: 'marketing_information',
	config: {
		META_TITLE: 'OpenQuok | Agentic Social Media Scheduler',
		META_DESCRIPTION: 'Plan and schedule posts.',
		META_KEYWORDS: 'scheduler'
	},
	updated_at: ''
};

describe('resolveDocumentTitleTemplate', () => {
	it('does not suffix when the title is the company name', () => {
		expect(resolveDocumentTitleTemplate('OpenQuok', 'OpenQuok')).toBe('%s');
	});

	it('does not suffix when the marketing title already starts with the company name', () => {
		expect(
			resolveDocumentTitleTemplate('OpenQuok | Agentic Social Media Scheduler', 'OpenQuok')
		).toBe('%s');
	});

	it('suffixes page titles that do not include the company name', () => {
		expect(resolveDocumentTitleTemplate('Sign in', 'OpenQuok')).toBe('%s | OpenQuok');
	});
});

describe('createMetaData', () => {
	it('does not produce OpenQuok | … | OpenQuok for the default marketing title', async () => {
		const metaTags = await createMetaData({
			companyInformation,
			marketingInformation,
			requestUrl: new URL('https://www.openquok.com/sign-in')
		});

		expect(metaTags.title).toBe('OpenQuok | Agentic Social Media Scheduler');
		expect(metaTags.titleTemplate).toBe('%s');
	});

	it('uses an identity template when customTitle is the company name', async () => {
		const metaTags = await createMetaData({
			companyInformation,
			marketingInformation,
			customTitle: 'OpenQuok',
			requestUrl: new URL('https://www.openquok.com/')
		});

		expect(metaTags.title).toBe('OpenQuok');
		expect(metaTags.titleTemplate).toBe('%s');
	});

	it('appends the company name for a short page title', async () => {
		const metaTags = await createMetaData({
			companyInformation,
			marketingInformation,
			customTitle: 'Sign in',
			requestUrl: new URL('https://www.openquok.com/sign-in')
		});

		expect(metaTags.title).toBe('Sign in');
		expect(metaTags.titleTemplate).toBe('%s | OpenQuok');
	});

	it('defaults openGraph.type to website', async () => {
		const metaTags = await createMetaData({
			companyInformation,
			marketingInformation,
			requestUrl: new URL('https://www.openquok.com/')
		});

		expect(metaTags.openGraph?.type).toBe('website');
	});

	it('emits default Open Graph images (1200x630 first) with image/png type', async () => {
		const metaTags = await createMetaData({
			companyInformation,
			marketingInformation,
			requestUrl: new URL('https://www.openquok.com/channels/facebook')
		});

		expect(metaTags.openGraph?.images).toEqual(
			DEFAULT_OG_IMAGE_SPECS.map((spec) => ({
				url: `https://www.openquok.com${spec.path}`,
				type: DEFAULT_OG_IMAGE_MIME,
				alt: `OpenQuok — ${spec.altSuffix}`,
				width: spec.width,
				height: spec.height
			}))
		);
		expect(metaTags.twitter?.image).toBe(`https://www.openquok.com${DEFAULT_OG_IMAGE_PATH}`);
	});

	it('sets openGraph.type to article when openGraphType is article', async () => {
		const metaTags = await createMetaData({
			companyInformation,
			marketingInformation,
			customTitle: 'How to schedule posts',
			openGraphType: 'article',
			requestUrl: new URL('https://www.openquok.com/blog/how-to-schedule-posts')
		});

		expect(metaTags.openGraph?.type).toBe('article');
	});
});
