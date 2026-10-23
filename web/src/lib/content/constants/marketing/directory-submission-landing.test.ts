import { describe, expect, it } from 'vitest';

import {
	PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG,
	PUBLIC_DIRECTORY_SUBMISSION_LANDING_PATH
} from '$lib/content/constants/marketing/directory-submission-landing';
import { faqHrefDocs, publicFaqHref } from '$lib/content/utils/publicFaqLinks';
import { route } from '$lib/utils/path';
import { getRootPathPublicDirectorySubmissionTool } from '$lib/area-public/constants/getRootPathPublicDirectorySubmissionTool';

describe('PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG', () => {
	it('resolves the public landing path from the root segment helper', () => {
		expect(PUBLIC_DIRECTORY_SUBMISSION_LANDING_PATH).toBe(
			route(getRootPathPublicDirectorySubmissionTool())
		);
	});

	it('includes sign-up and directory docs links in tailored FAQ answers', () => {
		const html = PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.faqSection.faqItems
			.map((item) => item.description)
			.join(' ');

		expect(html).toContain(`href="${publicFaqHref.signUp}"`);
		expect(html).toContain(`href="${faqHrefDocs('directory-submission')}"`);
		expect(html).toContain(`href="${faqHrefDocs('installation/chrome-extension')}"`);
	});

	it('lists three pricing comparison models', () => {
		expect(PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.pricingComparisonSection.rows).toHaveLength(3);
	});

	it('emphasizes human review and pace in hero and compare copy', () => {
		const heroAndCompare = [
			PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.hero.description,
			...PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.hero.bullets,
			...PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.compareSection.points.flatMap((point) => [
				point.pain,
				point.feature
			])
		]
			.join(' ')
			.toLowerCase();

		expect(heroAndCompare).toContain('human');
		expect(heroAndCompare).toContain('control');
		expect(heroAndCompare).not.toContain('we submit');
	});

	it('defines a five-step human-paced process', () => {
		expect(PUBLIC_DIRECTORY_SUBMISSION_LANDING_CONFIG.processSection.steps).toHaveLength(5);
	});

});
