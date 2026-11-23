import { describe, expect, it } from 'vitest';

import {
	buildBuildBacklinksCategorySiblingGridCardDescription,
	buildBuildBacklinksCategorySiblingGridDescription,
	buildBuildBacklinksCategorySiblingGridTitle
} from '$lib/link-directory/utils/site/buildBuildBacklinksCategorySiblingGridCopy';

describe('buildBuildBacklinksCategorySiblingGridCopy', () => {
	it('builds category-aware section title', () => {
		expect(buildBuildBacklinksCategorySiblingGridTitle('Launch platforms')).toBe(
			'Build more Backlinks from other Launch platforms'
		);
	});

	it('builds section and card descriptions', () => {
		expect(buildBuildBacklinksCategorySiblingGridDescription('Fazier', 'Launch platforms')).toContain(
			'Fazier'
		);
		expect(buildBuildBacklinksCategorySiblingGridCardDescription('PeerPush')).toBe(
			'See backlink opportunities and how-to steps for PeerPush.'
		);
	});
});