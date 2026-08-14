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
	config: { NAME: 'OPENQUOK', URL: 'https://www.openquok.com' },
	updated_at: ''
};

const marketingInformation: MarketingInformationProgrammerModel = {
	module_name: 'marketing_information',
	config: {
		META_TITLE: 'OPENQUOK | Agentic Social Media Scheduler',
		META_DESCRIPTION: 'Plan and schedule posts.',
		META_KEYWORDS: 'scheduler'
	},
	updated_at: ''
};

describe('resolveDocumentTitleTemplate', () => {
	it('does not suffix when the title is the company name', () => {
		expect(resolveDocumentTitleTemplate('OPENQUOK', 'OPENQUOK')).toBe('%s');
	});

	it('does not suffix when the marketing title already starts with the company name', () => {
		expect(
			resolveDocumentTitleTemplate('OPENQUOK | Agentic Social Media Scheduler', 'OPENQUOK')
		).toBe('%s');
	});

	it('suffixes page titles that do not include the company name', () => {
		expect(resolveDocumentTitleTemplate('Sign in', 'OPENQUOK')).toBe('%s | OPENQUOK');
	});
});

describe('createMetaData', () => {
	it('does not produce OPENQUOK | … | OPENQUOK for the default marketing title', async () => {
		const metaTags = await createMetaData({
			companyInformation,
			marketingInformation,
			requestUrl: new URL('https://www.openquok.com/sign-in')
		});

		expect(metaTags.title).toBe('OPENQUOK | Agentic Social Media Scheduler');
		expect(metaTags.titleTemplate).toBe('%s');
	});

	it('uses an identity template when customTitle is the company name', async () => {
		const metaTags = await createMetaData({
			companyInformation,
			marketingInformation,
			customTitle: 'OPENQUOK',
			requestUrl: new URL('https://www.openquok.com/')
		});

		expect(metaTags.title).toBe('OPENQUOK');
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
		expect(metaTags.titleTemplate).toBe('%s | OPENQUOK');
	});
});
