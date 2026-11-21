import { describe, expect, it } from 'vitest';

import {
	bufferCompareProduct,
	openquokCompareProduct,
	postizCompareProduct,
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
		expect(buildAlternativesDetailMetaTitle('Later', 'social_scheduling', 'later')).toBe(
			'Later Alternatives (2026): Free Trials & Pricing'
		);
		expect(buildAlternativesDetailMetaTitle('Buffer', 'social_scheduling', 'buffer')).toBe(
			'Buffer Alternatives (2026): Free & Self-Hosted'
		);
		expect(buildAlternativesDetailMetaTitle('Socialync', 'social_scheduling', 'socialync')).toBe(
			'Socialync Alternatives (2026): Free Trial & MCP'
		);
		expect(buildAlternativesDetailMetaTitle('Hootsuite').length).toBeLessThanOrEqual(60);
		expect(buildAlternativesDetailMetaTitle('Sprout Social').length).toBeLessThanOrEqual(60);
		expect(buildAlternativesDetailMetaTitle('Boringlaunch', 'directory_submission')).toBe(
			'Boringlaunch Alternatives (2026): Directory Launch'
		);
	});

	it('front-loads query echo and trial hook on Track A alternatives meta descriptions', () => {
		const description = buildAlternativesDetailMetaDescription(
			'Later',
			['OpenQuok', 'Buffer', 'Hootsuite', 'Socialync'],
			'later'
		);
		expect(description.startsWith('Compare the best Later alternatives')).toBe(true);
		expect(description).toContain('7-day free trial');
		expect(description).toContain('Top picks include');
		expect(description).toContain('OpenQuok');
		expect(description).toContain('Buffer');
		expect(description).toContain('Hootsuite');
		expect(description).toContain('Socialync');
		expect(description).not.toMatch(/\s{2,}/);
	});

	it('front-loads OpenQuok hook and names peers on default alternatives meta descriptions', () => {
		const description = buildAlternativesDetailMetaDescription('Hootsuite', [
			'OpenQuok',
			'Buffer',
			'Later',
			'Socialync'
		]);
		expect(description.startsWith('Start a 7-day free trial')).toBe(true);
		expect(description).toContain('Hootsuite alternatives');
		expect(description).toContain('OpenQuok');
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

	it('WS4 enriches openquok/postiz with trial, approval, and directory in the snippet lead', () => {
		const description = buildComparePairMetaDescription(
			openquokCompareProduct,
			postizCompareProduct,
			'social_matrix'
		);
		const snippetLead = description.slice(0, 155).toLowerCase();
		expect(snippetLead).toContain('free trial');
		expect(snippetLead).toContain('$0');
		expect(snippetLead).toContain('approval');
		expect(snippetLead).toContain('directory');
		expect(snippetLead).toContain('postiz');
		expect(description).toContain('See side-by-side pricing, channels, and features.');
	});

	it('WS4 front-loads pricing, trial, and differentiators on recurpost/buffer', () => {
		const description = buildComparePairMetaDescription(
			recurpostCompareProduct,
			bufferCompareProduct,
			'social_matrix'
		);
		expect(description).toMatch(/^RecurPost vs Buffer: list prices, free trials/);
		const snippetLead = description.slice(0, 155).toLowerCase();
		expect(snippetLead).toContain('prices');
		expect(snippetLead).toContain('free trial');
		expect(snippetLead).toContain('evergreen');
		expect(snippetLead).toContain('buffer');
	});

	it('WS4 front-loads pricing, trial, and differentiators on typefully/recurpost', () => {
		const description = buildComparePairMetaDescription(
			typefullyCompareProduct,
			recurpostCompareProduct,
			'social_matrix'
		);
		expect(description).toMatch(/^Typefully vs RecurPost: list prices, free trials/);
		const snippetLead = description.slice(0, 155).toLowerCase();
		expect(snippetLead).toContain('prices');
		expect(snippetLead).toContain('free trial');
		expect(snippetLead).toContain('writing-first');
		expect(snippetLead).toContain('evergreen');
	});

	it('leads other competitor-only compare descriptions with vs phrasing', () => {
		const description = buildComparePairMetaDescription(
			bufferCompareProduct,
			typefullyCompareProduct,
			'social_matrix'
		);
		expect(description).toMatch(/^Buffer vs Typefully: prices, channels, and scheduling features\./);
		expect(description).toContain('See which scheduler fits your work.');
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
