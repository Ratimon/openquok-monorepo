import { describe, expect, it } from 'vitest';

import { OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/skill-builder/constants/defaults';

import {
	ensureOpenquokCoreExtensionSlug,
	getBuildingBlockSlugsQueryParam,
	parseExtensionSlugsFromQuery
} from '$lib/skill-builder/utils/parseBuilderQuery';

describe('parseBuilderQuery', () => {
	it('defaults to openquok-core when query param is missing', () => {
		expect(parseExtensionSlugsFromQuery(null)).toEqual([OPENQUOK_CORE_EXTENSION_SLUG]);
	});

	it('always includes openquok-core first when other extensions are selected', () => {
		expect(parseExtensionSlugsFromQuery('revenuecat-mcp')).toEqual([
			OPENQUOK_CORE_EXTENSION_SLUG,
			'revenuecat-mcp'
		]);
	});

	it('keeps openquok-core first when already present', () => {
		expect(ensureOpenquokCoreExtensionSlug(['revenuecat-mcp', OPENQUOK_CORE_EXTENSION_SLUG])).toEqual(
			[OPENQUOK_CORE_EXTENSION_SLUG, 'revenuecat-mcp']
		);
	});

	it('prefers building-blocks query param over legacy extensions', () => {
		const params = new URLSearchParams('extensions=legacy-slug&building-blocks=openquok-core,revenuecat-mcp');
		expect(getBuildingBlockSlugsQueryParam(params)).toBe('openquok-core,revenuecat-mcp');
	});

	it('falls back to legacy extensions query param', () => {
		const params = new URLSearchParams('extensions=revenuecat-mcp');
		expect(getBuildingBlockSlugsQueryParam(params)).toBe('revenuecat-mcp');
	});
});
