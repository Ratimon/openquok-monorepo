import { describe, expect, it } from 'vitest';

import { PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM } from '$lib/content/constants/apis/formatExamples';
import { buildPublicApiPayloadValidatorStaticExampleFromFormatExample } from '$lib/content/constants/apis/hubExamples';
import {
	PUBLIC_API_POSTING_PAYLOAD_VALIDATOR_HUB_SECTION,
	PUBLIC_API_SCHEDULING_PAYLOAD_VALIDATOR_HUB_SECTION,
	getPublicApiCapabilityPayloadValidatorHubSection
} from '$lib/content/constants/apis/publicApiPayloadValidatorSectionConfig';
import { getPublicPayloadValidatorHref } from '$lib/content/utils/getPublicPayloadValidatorHref';

describe('publicApiPayloadValidatorSectionConfig', () => {
	it('provides hub sections per capability', () => {
		expect(getPublicApiCapabilityPayloadValidatorHubSection('posting').subtitle).toBe(
			'Free payload wizard'
		);
		expect(PUBLIC_API_POSTING_PAYLOAD_VALIDATOR_HUB_SECTION.title).toContain(
			'social media posting API'
		);
		expect(PUBLIC_API_SCHEDULING_PAYLOAD_VALIDATOR_HUB_SECTION.title).toContain(
			'social media scheduling API'
		);
		expect(getPublicApiCapabilityPayloadValidatorHubSection('scheduling').description).toContain(
			'repeat cadence'
		);
	});
});

describe('buildPublicApiPayloadValidatorStaticExampleFromFormatExample', () => {
	it('builds a payload preview example from the first platform format tab', () => {
		const firstExample = PUBLIC_API_FORMAT_EXAMPLES_BY_PLATFORM.facebook.posting[0];
		expect(firstExample).toBeDefined();

		const staticExample = buildPublicApiPayloadValidatorStaticExampleFromFormatExample(firstExample!);
		expect(staticExample.endpoint).toBe('POST /api/v1/public/posts');
		expect(staticExample.requestJson).toContain('"body"');
		expect(staticExample.responseJson.length).toBeGreaterThan(0);
	});
});

describe('getPublicPayloadValidatorHref', () => {
	it('links to the generic and channel payload wizard tools', () => {
		expect(getPublicPayloadValidatorHref()).toBe('/tools/payload-wizard');
		expect(getPublicPayloadValidatorHref('tiktok')).toBe('/tools/payload-wizard/tiktok');
	});
});
