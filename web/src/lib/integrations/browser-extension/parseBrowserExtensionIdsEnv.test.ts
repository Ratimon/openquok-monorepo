import { describe, expect, it } from 'vitest';

import { parseBrowserExtensionIdsEnv } from '$lib/integrations/browser-extension/parseBrowserExtensionIdsEnv';

describe('parseBrowserExtensionIdsEnv', () => {
	it('parses comma store map with chromium before edge', () => {
		expect(parseBrowserExtensionIdsEnv('edge:edge-id,chromium:chrome-id')).toEqual([
			'chrome-id',
			'edge-id'
		]);
	});

	it('parses JSON object with store-key ordering', () => {
		expect(
			parseBrowserExtensionIdsEnv('{"firefox":"ff-id","chromium":"cr-id","edge":"ed-id"}')
		).toEqual(['cr-id', 'ed-id', 'ff-id']);
	});

	it('parses JSON array of ids', () => {
		expect(parseBrowserExtensionIdsEnv('["id-a","id-b"]')).toEqual(['id-a', 'id-b']);
	});

	it('accepts bare comma-separated ids', () => {
		expect(parseBrowserExtensionIdsEnv('first, second ,first')).toEqual(['first', 'second']);
	});
});
