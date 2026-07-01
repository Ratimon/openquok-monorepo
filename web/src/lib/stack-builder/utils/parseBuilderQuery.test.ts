import { describe, expect, it } from 'vitest';

import { OPENQUOK_CORE_EXTENSION_SLUG } from '$lib/stack-builder/constants/defaults';

import {
	ensureOpenquokCoreExtensionSlug,
	parseExtensionSlugsFromQuery
} from '$lib/stack-builder/utils/parseBuilderQuery';

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
});
