import type {
	CompanyInformationProgrammerModel,
	MarketingInformationProgrammerModel
} from '$lib/area-public/publicInformation.types';

import { describe, expect, it } from 'vitest';

import {
	createMetaData,
	resolveDocumentTitleTemplate
} from '$lib/seo/createMetaData';

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
});
