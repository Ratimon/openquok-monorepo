import { describe, expect, it } from 'vitest';

import { resolveListingDetailTypeLabels } from './resolveListingDetailTypeLabels';

describe('resolveListingDetailTypeLabels', () => {
	it('returns Playbook for stacks', () => {
		expect(resolveListingDetailTypeLabels({ listingKind: 'stack' })).toEqual(['Playbook']);
	});

	it('maps extension types', () => {
		expect(resolveListingDetailTypeLabels({ extensionType: 'skills' })).toEqual(['Skills']);
		expect(resolveListingDetailTypeLabels({ extensionType: 'mcp' })).toEqual(['MCP']);
		expect(resolveListingDetailTypeLabels({ extensionType: 'both' })).toEqual(['Skills + MCP']);
	});
});
