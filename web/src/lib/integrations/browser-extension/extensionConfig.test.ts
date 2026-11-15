import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	getBrowserExtensionId,
	getBrowserExtensionIdCandidates,
	getBrowserExtensionLegacyId
} from '$lib/integrations/browser-extension/extensionConfig';

describe('extensionConfig', () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('merges multi-store env with legacy single id', () => {
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_IDS', 'chromium:chrome-id,edge:edge-id');
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_ID', 'legacy-id');
		expect(getBrowserExtensionIdCandidates()).toEqual(['chrome-id', 'edge-id', 'legacy-id']);
	});

	it('falls back to legacy id when multi-store env is empty', () => {
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_IDS', '');
		vi.stubEnv('VITE_OPENQUOK_BROWSER_EXTENSION_ID', 'only-id');
		expect(getBrowserExtensionId()).toBe('only-id');
		expect(getBrowserExtensionLegacyId()).toBe('only-id');
	});
});
