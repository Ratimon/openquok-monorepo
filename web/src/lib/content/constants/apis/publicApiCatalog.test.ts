import { describe, expect, it } from 'vitest';

import {
	getPublicApiPostingPlatformBySlug,
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
		expect(publicApiSchedulingHubPage.heroTitle).toBe(buildPublicApiHubHeroTitle('scheduling'));
		expect(publicApiSchedulingHubPage.heroTitle).toBe('Social Media Scheduling API');
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
});
