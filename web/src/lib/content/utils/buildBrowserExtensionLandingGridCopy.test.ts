import { describe, expect, it } from 'vitest';

import {
	buildBrowserExtensionChannelCrossLinkCardDescription,
	buildBrowserExtensionChannelCrossLinkGridTitle
} from '$lib/content/utils/buildBrowserExtensionLandingGridCopy';
import { buildBrowserExtensionChannelCrossLinkItems } from '$lib/content/utils/buildBrowserExtensionChannelCrossLinkItems';

describe('buildBrowserExtensionLandingGridCopy', () => {
	it('uses extension-specific sibling grid title', () => {
		expect(buildBrowserExtensionChannelCrossLinkGridTitle()).toBe(
			'Beyond the extension: Every supported channel'
		);
	});

	it('describes extension-assisted channels differently from OAuth channels', () => {
		expect(buildBrowserExtensionChannelCrossLinkCardDescription('reddit', 'Reddit', true)).toContain(
			'Extension'
		);
		expect(buildBrowserExtensionChannelCrossLinkCardDescription('facebook', 'Facebook', true)).toContain(
			'dashboard'
		);
		expect(buildBrowserExtensionChannelCrossLinkCardDescription('peerpush', 'PeerPush', true)).toContain(
			'autofill'
		);
	});
});

describe('buildBrowserExtensionChannelCrossLinkItems', () => {
	it('preserves config slug order', () => {
		const items = buildBrowserExtensionChannelCrossLinkItems(['skool', 'reddit']);
		expect(items.map((item) => item.slug)).toEqual(['skool', 'reddit']);
		expect(items[0].href).toContain('/channels/skool');
	});
});
