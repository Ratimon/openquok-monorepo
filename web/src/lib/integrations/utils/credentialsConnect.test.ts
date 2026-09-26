import { describe, expect, it } from 'vitest';

import {
	catalogItemHasCustomFields,
	credentialsConnectFormUsesSingleApiKey,
	encodeCredentialsConnectCode,
	initialCredentialsConnectValues,
	isExternalHttpUrl,
	normalizeCatalogCustomFields,
	parseCatalogFieldValidation,
	validateCatalogCustomFieldValue
} from '$lib/integrations/utils/credentialsConnect';

describe('credentialsConnect', () => {
	it('normalizes catalog customFields and ignores invalid rows', () => {
		const fields = normalizeCatalogCustomFields([
			{ key: 'apiKey', label: 'API key', validation: '/^.{3,}$/', type: 'password' },
			{ key: '', label: 'Bad', validation: '/.*/', type: 'text' },
			{ key: 'x', label: 'X', validation: '/.*/', type: 'number' }
		]);
		expect(fields).toEqual([
			{ key: 'apiKey', label: 'API key', validation: '/^.{3,}$/', type: 'password' }
		]);
		expect(catalogItemHasCustomFields({ customFields: fields })).toBe(true);
		expect(catalogItemHasCustomFields({ customFields: [] })).toBe(false);
		expect(catalogItemHasCustomFields({})).toBe(false);
	});

	it('parses slash-wrapped validation and rejects short API keys', () => {
		const pattern = parseCatalogFieldValidation('/^.{3,}$/');
		expect(pattern?.test('ab')).toBe(false);
		expect(pattern?.test('abc')).toBe(true);
		const field = {
			key: 'apiKey',
			label: 'API key',
			validation: '/^.{3,}$/',
			type: 'password' as const
		};
		expect(validateCatalogCustomFieldValue(field, 'ab')).toBe('API key is invalid.');
		expect(validateCatalogCustomFieldValue(field, 'abc')).toBeNull();
	});

	it('seeds connect values from field defaultValue', () => {
		expect(
			initialCredentialsConnectValues([
				{
					key: 'service',
					label: 'Service',
					validation: '/^https:\\/\\/.+/',
					type: 'text',
					defaultValue: 'https://bsky.social'
				},
				{ key: 'identifier', label: 'Handle', validation: '/.*/', type: 'text' }
			])
		).toEqual({ service: 'https://bsky.social', identifier: '' });
	});

	it('detects single-field API key forms vs multi-field account forms', () => {
		expect(
			credentialsConnectFormUsesSingleApiKey([
				{ key: 'apiKey', label: 'API key', validation: '/.*/', type: 'password' }
			])
		).toBe(true);
		expect(
			credentialsConnectFormUsesSingleApiKey([
				{ key: 'service', label: 'Service', validation: '/.*/', type: 'text' },
				{ key: 'password', label: 'App password', validation: '/.*/', type: 'password' }
			])
		).toBe(false);
	});

	it('encodes credentials as base64 JSON and detects non-URL authorize states', () => {
		const encoded = encodeCredentialsConnectCode({ apiKey: 'devto_key' });
		expect(JSON.parse(atob(encoded))).toEqual({ apiKey: 'devto_key' });
		expect(isExternalHttpUrl('https://dev.to/oauth/authorize')).toBe(true);
		expect(isExternalHttpUrl('abc123')).toBe(false);
	});
});
