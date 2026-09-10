import { describe, expect, it } from 'vitest';

import {
	OPENQUOK_CORE_LISTING_SLUG,
	OPENQUOK_CORE_MCP_LISTING_CONTENT,
	OPENQUOK_CORE_MCP_LISTING_DESCRIPTION,
	OPENQUOK_CORE_MCP_LISTING_TOOLS
} from './openquokCoreMcpListingCms';

describe('openquokCoreMcpListingCms', () => {
	it('targets the openquok-core building block slug', () => {
		expect(OPENQUOK_CORE_LISTING_SLUG).toBe('openquok-core');
	});

	it('ships the full hosted MCP tool catalog for the hub card', () => {
		expect(OPENQUOK_CORE_MCP_LISTING_TOOLS).toHaveLength(20);
		expect(OPENQUOK_CORE_MCP_LISTING_TOOLS.map((tool) => tool.name)).toEqual([
			'groupList',
			'integrationList',
			'integrationSchema',
			'triggerTool',
			'schedulePostTool',
			'uploadFromUrl',
			'postsList',
			'postsFindSlot',
			'postsStatus',
			'postsReviewTodo',
			'postsDelete',
			'postsMissing',
			'postsConnect',
			'analyticsPlatform',
			'analyticsPost',
			'plugsCatalog',
			'plugsList',
			'plugsUpsert',
			'plugsActivate',
			'plugsDelete'
		]);
	});

	it('includes non-empty description and markdown body for the MCP About tab', () => {
		expect(OPENQUOK_CORE_MCP_LISTING_DESCRIPTION.length).toBeGreaterThan(40);
		expect(OPENQUOK_CORE_MCP_LISTING_CONTENT).toContain('## Overview');
		expect(OPENQUOK_CORE_MCP_LISTING_CONTENT).toContain('Typical chat flows');
	});
});
