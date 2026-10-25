import { describe, expect, it, vi } from 'vitest';

import {
	BROWSER_PUBLISH_CANDIDATE_PROVIDER_IDS,
	getBrowserPublishPort,
	isBrowserPublishCandidate,
	setBrowserPublishPortForTests,
	socialPublishPathForProvider,
	stubBrowserPublishPort,
} from './browserPublishPort.js';

describe('browserPublishPort', () => {
	it('lists cookie-session providers as browser-publish candidates', () => {
		expect(BROWSER_PUBLISH_CANDIDATE_PROVIDER_IDS).toContain('skool');
		expect(isBrowserPublishCandidate('skool')).toBe(true);
		expect(isBrowserPublishCandidate('threads')).toBe(false);
	});

	it('uses server publish for every provider in v1', () => {
		expect(socialPublishPathForProvider('skool')).toBe('server');
		expect(socialPublishPathForProvider('threads')).toBe('server');
	});

	it('stub port advertises candidates but returns not_implemented', async () => {
		expect(stubBrowserPublishPort.supportsProvider('skool')).toBe(true);
		const result = await stubBrowserPublishPort.publish({
			integrationId: 'int-1',
			providerIdentifier: 'skool',
			body: 'Hello',
			scheduledAtIso: new Date().toISOString(),
		});
		expect(result).toEqual({
			ok: false,
			code: 'not_implemented',
			error:
				'In-browser send is not available yet. OpenQuok publishes through the API using your connected session.',
		});
	});

	it('getBrowserPublishPort returns the active port', async () => {
		const custom = {
			supportsProvider: () => true,
			publish: vi.fn().mockResolvedValue({ ok: true, externalPostId: 'ext-1' }),
		};
		setBrowserPublishPortForTests(custom);
		expect(getBrowserPublishPort()).toBe(custom);
		const result = await getBrowserPublishPort().publish({
			integrationId: 'int-1',
			providerIdentifier: 'skool',
			body: 'Hi',
			scheduledAtIso: new Date().toISOString(),
		});
		expect(result).toEqual({ ok: true, externalPostId: 'ext-1' });
		setBrowserPublishPortForTests();
		expect(getBrowserPublishPort()).toBe(stubBrowserPublishPort);
	});
});
