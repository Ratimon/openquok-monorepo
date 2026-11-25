import { describe, expect, it } from 'vitest';

import type { LaunchStepField } from 'openquok-common';

import {
	formScalarMisassignedToField,
	isInlineChoiceRowLabel,
	isListingSiteAiPrefillUrlInput,
	isPromoVideoUrlInput,
	listingProductNameInputAttrAllowed,
	socialFieldControlMatchesInput,
} from './formFieldDom.js';

describe('formFieldDom', () => {
	it('treats inline checkbox row labels as non-section anchors', () => {
		document.body.innerHTML = `
			<label>
				<input type="checkbox" />
				Marketing Tools
			</label>`;
		const label = document.querySelector('label')!;
		expect(isInlineChoiceRowLabel(label)).toBe(true);
	});

	it('classifies host AI listing prefill url inputs separately from product website url', () => {
		const ai = document.createElement('input');
		ai.type = 'url';
		ai.placeholder = 'https://example.com';
		ai.setAttribute('aria-label', 'Paste your URL');
		expect(isListingSiteAiPrefillUrlInput(ai)).toBe(true);

		const product = document.createElement('input');
		product.type = 'url';
		product.name = 'url';
		product.placeholder = 'https://';
		expect(isListingSiteAiPrefillUrlInput(product)).toBe(false);
	});

	it('classifies promo video url inputs separately from social channel fields', () => {
		const promo = document.createElement('input');
		promo.type = 'url';
		promo.name = 'launch_video_url';
		promo.placeholder = 'YouTube or Vimeo link';
		expect(isPromoVideoUrlInput(promo)).toBe(true);

		const socialYoutube = document.createElement('input');
		socialYoutube.type = 'url';
		socialYoutube.name = 'social_youtube';
		socialYoutube.placeholder = 'https://youtube.com/@channel';
		expect(isPromoVideoUrlInput(socialYoutube)).toBe(false);

		const instagram = document.createElement('input');
		instagram.type = 'url';
		instagram.name = 'social_instagram';
		instagram.placeholder = 'https://instagram.com/...';
		expect(isPromoVideoUrlInput(instagram)).toBe(false);
	});

	it('rejects promo video inputs for non-youtube social fields', () => {
		const promo = document.createElement('input');
		promo.type = 'url';
		promo.name = 'launch_video_url';
		promo.placeholder = 'YouTube or Vimeo link';
		const githubField: LaunchStepField = {
			key: 'social_github',
			label: 'GitHub',
			profilePath: 'profile_data.social_github',
		};
		expect(socialFieldControlMatchesInput(githubField, promo)).toBe(false);

		const github = document.createElement('input');
		github.type = 'url';
		github.name = 'social_github';
		expect(socialFieldControlMatchesInput(githubField, github)).toBe(true);
	});

	it('flags youtube-like values on the wrong profile field', () => {
		const githubField: LaunchStepField = {
			key: 'social_github',
			label: 'GitHub',
			profilePath: 'profile_data.social_github',
		};
		expect(
			formScalarMisassignedToField(
				githubField,
				'https://www.youtube.com/watch?v=demo'
			)
		).toBe(true);
	});

	it('allows common product title name attrs but blocks description-like names', () => {
		expect(listingProductNameInputAttrAllowed('tool_name')).toBe(true);
		expect(listingProductNameInputAttrAllowed('demo_video')).toBe(false);
		expect(listingProductNameInputAttrAllowed('tagline')).toBe(false);
	});
});