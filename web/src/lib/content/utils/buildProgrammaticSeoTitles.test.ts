import { describe, expect, it } from 'vitest';

import {
	bufferCompareProduct,
	openquokCompareProduct,
	recurpostCompareProduct,
	typefullyCompareProduct
} from '$lib/content/constants/competitors';

import {
	buildAlternativesDetailMetaDescription,
	buildAlternativesDetailMetaTitle,
	buildAlternativesSwitchFaqTitle,
	buildBestTimeToPostChannelHeroTitle,
	buildBestTimeToPostChannelMetaTitle,
	buildBestTimeToPostGenericHeroTitle,
	buildBestTimeToPostGenericMetaTitle,
	buildComparePairMetaDescription,
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
	buildSchedulingCommercialChannelMetaDescription,
	buildSchedulingCommercialChannelMetaTitle,
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

describe('buildProgrammaticSeoTitles — alternatives and compare meta', () => {
	it('builds alternatives detail meta titles within SERP length budget', () => {
		expect(buildAlternativesDetailMetaTitle('Later')).toBe('Later Alternatives (2026): Ranked Schedulers');
		expect(buildAlternativesDetailMetaTitle('Hootsuite').length).toBeLessThanOrEqual(60);
		expect(buildAlternativesDetailMetaTitle('Sprout Social').length).toBeLessThanOrEqual(60);
		expect(buildAlternativesDetailMetaTitle('Boringlaunch', 'directory_submission')).toBe(
			'Boringlaunch Alternatives (2026): Directory Launch'
		);
	});

	it('front-loads OpenQuok hook and names peers in alternatives meta descriptions', () => {
		const description = buildAlternativesDetailMetaDescription('Later', [
			'OpenQuok',
			'Buffer',
			'Hootsuite',
			'Socialync'
		]);
		expect(description.startsWith('Start a 7-day free trial')).toBe(true);
		expect(description).toContain('Later alternatives');
		expect(description).toContain('OpenQuok');
		expect(description).toContain('Buffer');
		expect(description).toContain('Hootsuite');
		expect(description).toContain('Socialync');
		expect(description).not.toMatch(/\s{2,}/);
	});

	it('builds PAA-shaped alternatives switch FAQ titles', () => {
		expect(buildAlternativesSwitchFaqTitle('Later')).toBe('What are the best Later alternatives?');
	});

	it('leads compare pair descriptions with prices, trial, and taglines when OpenQuok is included', () => {
		const description = buildComparePairMetaDescription(
			openquokCompareProduct,
			bufferCompareProduct,
			'social_matrix'
		);
		expect(description).toMatch(/^OpenQuok vs Buffer: prices, channels, free trial\./);
		expect(description).toContain(openquokCompareProduct.tagline);
		expect(description).toContain(bufferCompareProduct.tagline);
		const snippetLead = description.slice(0, 155).toLowerCase();
		expect(snippetLead).toContain('prices');
		expect(snippetLead).toContain('channels');
		expect(snippetLead).toContain('free trial');
	});

	it('keeps OpenQuok first in the compare snippet lead regardless of pair order', () => {
		const description = buildComparePairMetaDescription(
			bufferCompareProduct,
			openquokCompareProduct,
			'social_matrix'
		);
		expect(description).toMatch(/^OpenQuok vs Buffer: prices, channels, free trial\./);
	});

	it('leads competitor-only compare descriptions with vs phrasing', () => {
		const description = buildComparePairMetaDescription(
			recurpostCompareProduct,
			bufferCompareProduct,
			'social_matrix'
		);
		expect(description).toMatch(/^RecurPost vs Buffer: prices, channels, and scheduling features\./);
		expect(description).toContain('See which scheduler fits your work.');
	});

	it('names both product taglines early on high-impression scheduler-only pairs', () => {
		const description = buildComparePairMetaDescription(
			typefullyCompareProduct,
			recurpostCompareProduct,
			'social_matrix'
		);
		expect(description).toMatch(/^Typefully vs RecurPost: prices, channels, and scheduling features\./);
		expect(description.slice(0, 155).toLowerCase()).toContain('prices');
		expect(description).toContain(typefullyCompareProduct.tagline);
		expect(description).toContain(recurpostCompareProduct.tagline);
	});
});

describe('buildProgrammaticSeoTitles — scheduling commercial channel meta', () => {
	it('puts schedule and trial terms early in channel meta titles', () => {
		expect(buildSchedulingCommercialChannelMetaTitle('Bluesky')).toContain('Schedule');
		expect(buildSchedulingCommercialChannelMetaTitle('Bluesky')).toContain('Free Trial');
		expect(buildSchedulingCommercialChannelMetaTitle('Bluesky', true)).toMatch(
			/^Bluesky Scheduler Free Trial/
		);
	});

	it('puts trial and connect intent in the first sentence of channel meta descriptions', () => {
		const description = buildSchedulingCommercialChannelMetaDescription({
			platformLabel: 'Bluesky',
			connectClause: 'Connect with an app password (custom PDS supported).',
			featureClause: 'Queue text, media, and follow-up replies from the dashboard, API, or MCP.'
		});
		expect(description.startsWith('Start a free trial and schedule Bluesky posts')).toBe(true);
		expect(description).toContain('app password');
	});
});
