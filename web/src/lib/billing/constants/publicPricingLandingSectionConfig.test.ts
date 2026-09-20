import { describe, expect, it } from 'vitest';

import { GetPublicPricingPresenter } from '$lib/billing/GetPublicPricing.presenter.svelte';
import { PUBLIC_PRICING_PLAN_META } from '$lib/billing/constants/publicPricingCatalog';
import {
	getPublicPricingLandingPlanOverrides,
	getPublicPricingLandingSection
} from '$lib/billing/constants/publicPricingLandingSectionConfig';

describe('publicPricingLandingSectionConfig', () => {
	it('api posting hub description mentions Public API, MCP, and OAuth', () => {
		const section = getPublicPricingLandingSection('api-posting-hub');

		expect(section.description).toContain('Public API');
		expect(section.description).toContain('MCP');
		expect(section.description).toContain('OAuth');
		expect(section.description).toContain('Node SDK');
	});

	it('api scheduling hub description mentions Public API, MCP, and OAuth', () => {
		const section = getPublicPricingLandingSection('api-scheduling-hub');

		expect(section.description).toContain('Public API');
		expect(section.description).toContain('MCP');
		expect(section.description).toContain('OAuth');
	});

	it('platform preset interpolates platformLabel in section copy', () => {
		const section = getPublicPricingLandingSection('api-scheduling-platform', {
			platformLabel: 'YouTube'
		});

		expect(section.title).toContain('YouTube');
		expect(section.description).toContain('YouTube');
		expect(section.title).not.toContain('{platformLabel}');
		expect(section.description).not.toContain('{platformLabel}');
	});

	it('platform preset interpolates platformLabel in tab headline overrides', () => {
		const overrides = getPublicPricingLandingPlanOverrides('api-posting-platform', {
			platformLabel: 'YouTube'
		});

		expect(overrides.SOLO?.tabHeadline).toContain('YouTube');
		expect(overrides.SOLO?.tabHeadline).not.toContain('{platformLabel}');
	});

	it('platform preset without platformLabel falls back to hub section and overrides', () => {
		const hubSection = getPublicPricingLandingSection('api-posting-hub');
		const platformSection = getPublicPricingLandingSection('api-posting-platform');
		const hubOverrides = getPublicPricingLandingPlanOverrides('api-posting-hub');
		const platformOverrides = getPublicPricingLandingPlanOverrides('api-posting-platform');

		expect(platformSection).toEqual(hubSection);
		expect(platformOverrides).toEqual(hubOverrides);
	});

	it('home preset mirrors CMS landing defaults', () => {
		const section = getPublicPricingLandingSection('home');

		expect(section).toEqual({
			subtitle: 'Pricings',
			title: 'Find your perfect plan',
			description:
				'Transparent pricing for our social media scheduling tool. No hidden fees — cancel anytime. Start with a 7-day free trial.'
		});
	});
});

describe('GetPublicPricingPresenter.buildLandingTabPlans', () => {
	it('applies tabHeadline overrides without changing prices', () => {
		const presenter = new GetPublicPricingPresenter();
		const overrides = getPublicPricingLandingPlanOverrides('api-posting-hub');
		const baselinePlans = presenter.buildPageVm('MONTHLY').plans;
		const landingPlans = presenter.buildLandingTabPlans('MONTHLY', { planMetaOverrides: overrides });

		expect(landingPlans).toHaveLength(baselinePlans.length);

		for (const landingPlan of landingPlans) {
			const baselinePlan = baselinePlans.find((plan) => plan.tier === landingPlan.tier);
			expect(baselinePlan).toBeDefined();
			expect(landingPlan.displayPrice).toBe(baselinePlan!.displayPrice);
			expect(landingPlan.monthPrice).toBe(baselinePlan!.monthPrice);
			expect(landingPlan.yearPrice).toBe(baselinePlan!.yearPrice);
			expect(landingPlan.features).toEqual(baselinePlan!.features);
			expect(landingPlan.tabHeadline).toBe(overrides[landingPlan.tier]?.tabHeadline);
			expect(landingPlan.tabHeadline).not.toBe(PUBLIC_PRICING_PLAN_META[landingPlan.tier].tabHeadline);
		}
	});

	it('returns catalog plans unchanged when overrides are omitted', () => {
		const presenter = new GetPublicPricingPresenter();
		const baselinePlans = presenter.buildPageVm('YEARLY').plans;
		const landingPlans = presenter.buildLandingTabPlans('YEARLY');

		expect(landingPlans).toEqual(baselinePlans);
	});
});
