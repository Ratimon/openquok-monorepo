import { describe, expect, it } from 'vitest';

import {
	buildPublicApiCreatePostTerminalCode,
	buildPublicApiIntegrationsListTerminalCode,
	getPublicApiHubAudienceSection,
	getPublicApiPlatformAudienceSection,
	getPublicApiPlatformSetupStepsSection,
	getPublicApiPostingPlatformBySlug,
	PUBLIC_API_PROGRAMMATIC_AUTH_CURL_HEADER,
	getPublicApiSchedulingPlatformBySlug,
	isPublicApiPlatformSlug,
	listPublicApiPostingPlatformsForHub,
	PUBLIC_API_POSTING_PLATFORM_SLUGS,
	publicApiPostingHubPage,
	publicApiSchedulingHubPage
} from '$lib/content/constants/apis/index';
import {
	buildPublicApiHubHeroTitle,
	buildPublicApiPlatformHeroTitle
} from '$lib/content/utils/buildProgrammaticSeoTitles';
import { PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS } from '$lib/content/constants/apis/publicApiCapabilityHubFeatureConfig';

describe('publicApiCatalog', () => {
	it('registers seven posting platform slugs', () => {
		expect(PUBLIC_API_POSTING_PLATFORM_SLUGS).toEqual([
			'tiktok',
			'x',
			'instagram',
			'youtube',
			'facebook',
			'threads',
			'linkedin'
		]);
	});

	it('resolves posting and scheduling platform pages', () => {
		const posting = getPublicApiPostingPlatformBySlug('tiktok');
		const scheduling = getPublicApiSchedulingPlatformBySlug('tiktok');

		expect(posting?.capability).toBe('posting');
		expect(scheduling?.capability).toBe('scheduling');
		expect(posting?.formatExamples.length).toBeGreaterThanOrEqual(3);
		expect(posting?.formatExamples[0]?.requestJson).toContain('scheduledAt');
		expect(posting?.formatExamples[0]?.responseJson).toContain('"success": true');
	});

	it('rejects unknown slugs', () => {
		expect(isPublicApiPlatformSlug('devto')).toBe(false);
		expect(getPublicApiPostingPlatformBySlug('devto')).toBeUndefined();
	});

	it('builds hub platform cards from channel catalog', () => {
		const cards = listPublicApiPostingPlatformsForHub();
		expect(cards).toHaveLength(7);
		expect(cards.map((card) => card.slug)).toEqual(PUBLIC_API_POSTING_PLATFORM_SLUGS);
		expect(cards[0]?.platformLabel).toBe('TikTok');
	});

	it('ships hub static examples and FAQ blocks', () => {
		expect(publicApiPostingHubPage.staticExample.endpoint).toBe('POST /api/v1/public/posts');
		expect(publicApiPostingHubPage.heroTitle).toBe(buildPublicApiHubHeroTitle('posting'));
		expect(publicApiPostingHubPage.heroTitle).toBe('Social Media Posting API');
		expect(publicApiPostingHubPage.heroDescription).toContain('Skip months');
		expect(publicApiPostingHubPage.heroBullets.length).toBe(4);
		expect(publicApiSchedulingHubPage.heroTitle).toBe(buildPublicApiHubHeroTitle('scheduling'));
		expect(publicApiSchedulingHubPage.heroTitle).toBe('Social Media Scheduling API');
		expect(publicApiSchedulingHubPage.heroDescription).toContain('UTC');
		expect(publicApiSchedulingHubPage.heroBullets.length).toBe(4);
		expect(publicApiPostingHubPage.faqItems.length).toBeGreaterThan(0);
		expect(publicApiSchedulingHubPage.faqItems.length).toBeGreaterThan(0);
		expect(publicApiSchedulingHubPage.staticExample.requestJson).toContain('repeatInterval');
	});

	it('uses keyword-first platform hero titles', () => {
		const xPosting = getPublicApiPostingPlatformBySlug('x');
		const tiktokScheduling = getPublicApiSchedulingPlatformBySlug('tiktok');

		expect(xPosting?.heroTitle).toBe(buildPublicApiPlatformHeroTitle('Twitter / X', 'posting'));
		expect(tiktokScheduling?.heroTitle).toBe(buildPublicApiPlatformHeroTitle('TikTok', 'scheduling'));
	});

	it('ships hub feature rows for SDK, MCP, and OAuth docs', () => {
		expect(PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS).toHaveLength(3);
		expect(PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS.map((section) => section.docsPath)).toEqual([
			'/docs/getting-started-for-public-api',
			'/docs/getting-started-for-mcp',
			'/docs/oauth2-for-apps'
		]);
		for (const section of PUBLIC_API_MARKETING_HUB_FEATURE_SECTIONS) {
			expect(section.title.split(',').length).toBeGreaterThanOrEqual(3);
			expect(section.terminalCode.trim().length).toBeGreaterThan(0);
		}
	});

	it('ships audience sections for posting and scheduling hubs', () => {
		const posting = getPublicApiHubAudienceSection('posting');
		const scheduling = getPublicApiHubAudienceSection('scheduling');

		expect(posting.audienceCards).toHaveLength(3);
		expect(posting.audienceCards.map((card) => card.title)).toEqual([
			'SaaS developers',
			'Vibe coders',
			'Startup teams'
		]);
		expect(scheduling.audienceTitle).toContain('scheduling API');

		const tiktokPosting = getPublicApiPlatformAudienceSection('posting', 'TikTok');
		expect(tiktokPosting.audienceTitle).toContain('TikTok');
		expect(tiktokPosting.audienceCards[0]?.description).toContain('Publish to TikTok');
	});

	it('tailors setup steps for platform slug pages', () => {
		const posting = getPublicApiPostingPlatformBySlug('tiktok');
		const tiktokPosting = getPublicApiPlatformSetupStepsSection(
			'posting',
			'TikTok',
			'tiktok',
			posting?.formatExamples[0]?.requestJson
		);

		expect(tiktokPosting.setupStepsTitle).toContain('TikTok');
		expect(tiktokPosting.setupSteps[1]?.title).toBe('2. Connect TikTok');
		expect(tiktokPosting.setupSteps[1]?.terminalCode).toContain(PUBLIC_API_PROGRAMMATIC_AUTH_CURL_HEADER);
		expect(tiktokPosting.setupSteps[1]?.terminalCode).toContain('identifier: tiktok');
		expect(tiktokPosting.setupSteps[2]?.title).toBe('3. Publish to TikTok');
		expect(tiktokPosting.setupSteps[2]?.terminalCode).toContain('providerSettingsByIntegrationId');
	});

	it('uses Bearer auth on hub setup step curl examples', () => {
		const integrationsCurl = buildPublicApiIntegrationsListTerminalCode();
		const postCurl = buildPublicApiCreatePostTerminalCode('{"status":"scheduled"}');

		expect(integrationsCurl).toContain('Bearer opo_your_programmatic_token');
		expect(integrationsCurl).not.toContain('opo_your_workspace_token');
		expect(postCurl).toContain('Bearer opo_your_programmatic_token');
	});
});
