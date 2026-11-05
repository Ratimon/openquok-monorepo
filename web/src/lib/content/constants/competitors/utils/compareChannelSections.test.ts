import { describe, expect, it } from 'vitest';

import { getmorebacklinksCompareProduct } from '$lib/content/constants/competitors/getmorebacklinks';
import { openquokCompareProduct } from '$lib/content/constants/competitors/openquok';
import { hootsuiteCompareProduct } from '$lib/content/constants/competitors/hootsuite';

import {
	buildCompareChannelSectionsForPair,
	buildCompareDirectoryCoverageSection,
	buildCompareSocialChannelsSection
} from './compareChannelSections';

describe('compareChannelSections', () => {
	it('builds social channels when OpenQuok is paired with an empty-channel directory vendor', () => {
		const section = buildCompareSocialChannelsSection(
			openquokCompareProduct,
			getmorebacklinksCompareProduct
		);
		expect(section?.title).toBe('Supported social channels');
		expect(section?.points.length).toBeGreaterThan(0);
	});

	it('builds directory coverage for OpenQuok vs GetMoreBacklinks', () => {
		const coverage = buildCompareDirectoryCoverageSection(
			openquokCompareProduct,
			getmorebacklinksCompareProduct
		);
		expect(coverage?.launchPlatforms.map((p) => p.label)).toEqual(['PeerPush', 'Uneed']);
		expect(coverage?.competitorSummary).toMatch(/100/);
	});

	it('builds directory coverage for OpenQuok vs Hootsuite with scheduler default copy', () => {
		const coverage = buildCompareDirectoryCoverageSection(
			openquokCompareProduct,
			hootsuiteCompareProduct
		);
		expect(coverage?.launchPlatforms.map((p) => p.label)).toEqual(['PeerPush', 'Uneed']);
		expect(coverage?.competitorSummary).toContain('social scheduler');
	});

	it('includes directory channels on social compare pairs with OpenQuok', () => {
		const pair = buildCompareChannelSectionsForPair(openquokCompareProduct, hootsuiteCompareProduct);
		expect(pair.socialChannelsSection).not.toBeNull();
		expect(pair.directoryCoverageSection).not.toBeNull();
	});

	it('returns both sections for directory vendor pairs', () => {
		const pair = buildCompareChannelSectionsForPair(
			openquokCompareProduct,
			getmorebacklinksCompareProduct
		);
		expect(pair.socialChannelsSection).not.toBeNull();
		expect(pair.directoryCoverageSection?.competitorSummary).toMatch(/100/);
	});
});
