import { describe, expect, it } from 'vitest';

import {
	buildBestTimeToPostChannelHeroTitle,
	buildBestTimeToPostChannelMetaTitle,
	buildBestTimeToPostGenericHeroTitle,
	buildBestTimeToPostGenericMetaTitle,
	buildHumanizeChannelHeroTitle,
	buildHumanizeChannelMetaTitle,
	buildHumanizeGenericHeroTitle,
	buildHumanizeGenericMetaTitle,
	buildPhotoEditorChannelHeroTitle,
	buildPhotoEditorChannelMetaTitle,
	buildPhotoEditorGenericHeroTitle,
	buildPhotoEditorGenericMetaTitle,
	buildPayloadWizardChannelHeroTitle,
	buildPayloadWizardChannelMetaTitle,
	buildPayloadWizardGenericHeroTitle,
	buildPayloadWizardGenericMetaTitle,
	buildPublicApiHubHeroTitle,
	buildPublicApiPlatformHeroTitle,
	buildSkillBuilderChannelHeroTitle,
	buildSkillBuilderChannelMetaTitle,
	buildSkillBuilderGenericHeroTitle,
	buildSkillBuilderGenericMetaTitle,
	buildToolsHubHeroTitle,
	buildToolsHubMetaTitle
} from '$lib/content/utils/buildProgrammaticSeoTitles';

describe('buildProgrammaticSeoTitles — public tools', () => {
	it('keeps SERP meta titles distinct from on-page hero titles', () => {
		expect(buildToolsHubMetaTitle()).toContain('No Sign Up');
		expect(buildToolsHubHeroTitle()).not.toContain('No Sign Up');

		expect(buildPhotoEditorGenericMetaTitle()).toBe(
			'Free Social Media Photo Editor — No Sign Up'
		);
		expect(buildPhotoEditorGenericHeroTitle()).toBe('Free social media photo editor');

		expect(buildHumanizeGenericMetaTitle()).toContain('No Sign Up');
		expect(buildHumanizeGenericHeroTitle()).toBe('Free AI humanizer');

		expect(buildPayloadWizardGenericMetaTitle()).toContain('Copy POST /public/posts JSON');
		expect(buildPayloadWizardGenericHeroTitle()).toBe('Free API payload wizard');
	});

	it('builds channel-specific photo editor titles from platform labels', () => {
		expect(buildPhotoEditorChannelMetaTitle('YouTube')).toBe(
			'Free YouTube Photo Editor — No Sign Up'
		);
		expect(buildPhotoEditorChannelHeroTitle('YouTube')).toBe('Free YouTube photo editor');
	});

	it('builds channel-specific skill builder titles from platform labels', () => {
		expect(buildSkillBuilderChannelMetaTitle('LinkedIn')).toBe(
			'Free LinkedIn Skill Builder — No Sign Up'
		);
		expect(buildSkillBuilderChannelHeroTitle('LinkedIn')).toBe('Free LinkedIn skill builder');
		expect(buildSkillBuilderGenericMetaTitle()).toContain('No Sign Up');
		expect(buildSkillBuilderGenericHeroTitle()).toBe('Free social media skill builder');
	});

	it('builds channel-specific best time to post titles from platform labels', () => {
		expect(buildBestTimeToPostChannelMetaTitle('Instagram')).toBe(
			'Free Best Time to Post on Instagram — No Sign Up'
		);
		expect(buildBestTimeToPostChannelHeroTitle('Instagram')).toBe(
			'Free Instagram best time to post calculator'
		);
		expect(buildBestTimeToPostGenericMetaTitle()).toContain('No Sign Up');
		expect(buildBestTimeToPostGenericHeroTitle()).toBe('Free best time to post calculator');
	});

	it('builds channel-specific humanizer and payload wizard titles', () => {
		expect(buildHumanizeChannelMetaTitle('Facebook')).toBe(
			'Free Facebook AI Humanizer — No Sign Up'
		);
		expect(buildHumanizeChannelHeroTitle('Facebook')).toBe('Free Facebook AI humanizer');

		expect(buildPayloadWizardChannelMetaTitle('X')).toBe(
			'Free X Payload Wizard — Copy POST /public/posts JSON'
		);
		expect(buildPayloadWizardChannelHeroTitle('X')).toBe('Free X API payload wizard');
	});

	it('builds API marketing hub and platform hero titles', () => {
		expect(buildPublicApiHubHeroTitle('posting')).toBe('Social Media Posting API');
		expect(buildPublicApiHubHeroTitle('scheduling')).toBe('Social Media Scheduling API');
		expect(buildPublicApiPlatformHeroTitle('Twitter / X', 'posting')).toBe('Twitter / X Posting API');
		expect(buildPublicApiPlatformHeroTitle('TikTok', 'scheduling')).toBe('TikTok Scheduling API');
	});
});
