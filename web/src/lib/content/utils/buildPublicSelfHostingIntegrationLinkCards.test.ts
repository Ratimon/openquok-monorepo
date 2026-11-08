import { describe, expect, it, beforeAll } from 'vitest';

import { preloadDocsRegistry } from '$lib/docs/content';

import {
	buildPublicSelfHostingDirectoryIntegrationLinkCards,
	buildPublicSelfHostingSocialIntegrationLinkCards
} from './buildPublicSelfHostingIntegrationLinkCards';
import {
	listSelfHostOperatorGuideDocEntries,
	SELF_HOST_DIRECTORY_INTEGRATION_DOCS_DIRECTORY,
	SELF_HOST_SOCIAL_INTEGRATION_DOCS_DIRECTORY
} from './listSelfHostOperatorGuideDocs';

describe('buildPublicSelfHostingSocialIntegrationLinkCards', () => {
	beforeAll(async () => {
		await preloadDocsRegistry();
	});

	it('includes extension and overview cards plus every social operator guide', () => {
		const items = buildPublicSelfHostingSocialIntegrationLinkCards();
		const socialDocCount = listSelfHostOperatorGuideDocEntries(
			SELF_HOST_SOCIAL_INTEGRATION_DOCS_DIRECTORY
		).length;

		expect(items).toHaveLength(2 + socialDocCount);
		expect(items.map((item) => item.id).slice(0, 2)).toEqual([
			'social-integration-browser-extension',
			'social-integration-overview'
		]);
	});

	it('lists Reddit and Skool setup guides', () => {
		const hrefById = Object.fromEntries(
			buildPublicSelfHostingSocialIntegrationLinkCards().map((item) => [item.id, item.href])
		);

		expect(hrefById['social-integration-reddit']).toBe('/docs/social-integration/reddit');
		expect(hrefById['social-integration-skool']).toBe('/docs/social-integration/skool');
	});
});

describe('buildPublicSelfHostingDirectoryIntegrationLinkCards', () => {
	beforeAll(async () => {
		await preloadDocsRegistry();
	});

	it('includes overview, extension, and every directory operator guide', () => {
		const items = buildPublicSelfHostingDirectoryIntegrationLinkCards();
		const directoryDocCount = listSelfHostOperatorGuideDocEntries(
			SELF_HOST_DIRECTORY_INTEGRATION_DOCS_DIRECTORY
		).length;

		expect(items).toHaveLength(2 + directoryDocCount);
		expect(items.map((item) => item.id).slice(0, 2)).toEqual([
			'directory-integration-overview',
			'directory-integration-browser-extension'
		]);
	});

	it('lists PeerPush and Uneed setup guides', () => {
		const hrefById = Object.fromEntries(
			buildPublicSelfHostingDirectoryIntegrationLinkCards().map((item) => [item.id, item.href])
		);

		expect(hrefById['directory-integration-peerpush']).toBe('/docs/directory-integration/peerpush');
		expect(hrefById['directory-integration-uneed']).toBe('/docs/directory-integration/uneed');
	});
});
