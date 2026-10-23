import { describe, expect, it } from 'vitest';

import { GetPublicPricingPresenter } from '$lib/billing/GetPublicPricing.presenter.svelte';
import {
	PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS,
	PUBLIC_PRICING_COMPARE_ROWS,
	PUBLIC_PRICING_FEATURED_TIER,
	PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT,
	PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT_ALL
} from '$lib/billing/constants/publicPricingCatalog';
import {
	filterCompareRowsByProductLine,
	mergeLandingTabFeaturesForAllProductLines,
	publicPricingCardFeatureLabels
} from '$lib/billing/constants/publicPricingProductLines';
import { planLimitsForTier } from 'openquok-common';

describe('publicPricingProductLine catalog', () => {
	it('tags every compare row with a product line', () => {
		for (const row of PUBLIC_PRICING_COMPARE_ROWS) {
			expect(['social', 'directory', 'shared']).toContain(row.line);
		}
	});

	it('social filter excludes directory-only row ids and posts_per_month stays social-only', () => {
		const socialRows = filterCompareRowsByProductLine(PUBLIC_PRICING_COMPARE_ROWS, 'social');
		const socialIds = socialRows.map((row) => row.id);

		expect(socialIds).toContain('posts_per_month');
		expect(socialIds).not.toContain('directory_analytics');
		expect(socialIds).not.toContain('directory_competitor_domains');
		expect(socialIds).toContain('workspaces');
	});

	it('directory filter excludes posts_per_month and includes directory rows', () => {
		const directoryRows = filterCompareRowsByProductLine(PUBLIC_PRICING_COMPARE_ROWS, 'directory');
		const directoryIds = directoryRows.map((row) => row.id);

		expect(directoryIds).not.toContain('posts_per_month');
		expect(directoryIds).not.toContain('channels');
		expect(directoryIds).toContain('directory_business_profiles');
		expect(directoryIds).toContain('directory_competitor_domains');
		expect(directoryIds).toContain('workspaces');
	});

	it('all mode is a superset of social and directory filters', () => {
		const allIds = new Set(PUBLIC_PRICING_COMPARE_ROWS.map((row) => row.id));
		const socialIds = new Set(
			filterCompareRowsByProductLine(PUBLIC_PRICING_COMPARE_ROWS, 'social').map((row) => row.id)
		);
		const directoryIds = new Set(
			filterCompareRowsByProductLine(PUBLIC_PRICING_COMPARE_ROWS, 'directory').map((row) => row.id)
		);

		for (const id of socialIds) expect(allIds.has(id)).toBe(true);
		for (const id of directoryIds) expect(allIds.has(id)).toBe(true);
		expect(allIds.size).toBeGreaterThan(socialIds.size);
		expect(allIds.size).toBeGreaterThan(directoryIds.size);
	});

	it('mergeLandingTabFeaturesForAllProductLines unions social and directory tab bullets', () => {
		const social = ['1 agent workspace', '500 posts per month', 'Calendar views'];
		const directory = ['1 agent workspace', '3 competitor domains', 'Domain rating analytics'];
		const merged = mergeLandingTabFeaturesForAllProductLines(
			social,
			directory,
			PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT,
			PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT_ALL
		);

		expect(merged).toContain('Calendar views');
		expect(merged).toContain('Domain rating analytics');
		expect(merged.filter((line) => line === '1 agent workspace')).toHaveLength(1);
	});

	it('card feature labels respect product-line filters', () => {
		const all = publicPricingCardFeatureLabels(PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS, 'all');
		const social = publicPricingCardFeatureLabels(PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS, 'social');
		const directory = publicPricingCardFeatureLabels(
			PUBLIC_PRICING_CARD_FEATURE_DEFINITIONS,
			'directory'
		);

		expect(social).toContain('Calendar views');
		expect(social).not.toContain('Domain rating analytics');
		expect(directory).toContain('Domain rating analytics');
		expect(directory).not.toContain('Posts per month');
		expect(all.length).toBeGreaterThan(social.length);
		expect(all.length).toBeGreaterThan(directory.length);
	});
});

describe('GetPublicPricingPresenter product-line filters', () => {
	const presenter = new GetPublicPricingPresenter();

	it('orders directory compare rows to match featured plan card bullets', () => {
		const directoryVm = presenter.buildPageVm('MONTHLY', 'directory');
		const featuredPlan = directoryVm.plans.find((p) => p.tier === PUBLIC_PRICING_FEATURED_TIER);
		expect(featuredPlan).toBeDefined();

		const rowLabels = directoryVm.compareRows.map((row) => row.label);
		const cardFeatures = featuredPlan!.features;

		const businessIdx = cardFeatures.findIndex((f) => /business profiles/i.test(f));
		const communityIdx = cardFeatures.findIndex((f) => /community features/i.test(f));
		const darkIdx = cardFeatures.findIndex((f) => /dark \/ light mode/i.test(f));
		const businessRowIdx = rowLabels.findIndex((l) => /business profiles/i.test(l));
		const communityRowIdx = rowLabels.findIndex((l) => /community features/i.test(l));
		const darkRowIdx = rowLabels.findIndex((l) => /dark \/ light mode/i.test(l));

		expect(businessRowIdx).toBeGreaterThanOrEqual(0);
		expect(communityRowIdx).toBeGreaterThan(businessRowIdx);
		expect(darkRowIdx).toBeGreaterThan(communityRowIdx);
		expect(businessIdx).toBeGreaterThanOrEqual(0);
		expect(communityIdx).toBeGreaterThan(businessIdx);
		expect(darkIdx).toBeGreaterThan(communityIdx);

		const agentRowIdx = rowLabels.findIndex((l) => l === 'Agent integrations');
		const competitorRowIdx = rowLabels.findIndex((l) => l === 'Competitor domains');
		expect(agentRowIdx).toBeGreaterThan(competitorRowIdx);
		expect(rowLabels).toContain('Browser extension autofill');
		expect(rowLabels).toContain('Directory submission tracking');
	});

	it('filters compare rows for social and directory modes', () => {
		const allVm = presenter.buildPageVm('MONTHLY', 'all');
		const socialVm = presenter.buildPageVm('MONTHLY', 'social');
		const directoryVm = presenter.buildPageVm('MONTHLY', 'directory');

		const allIds = allVm.compareRows.map((row) => row.id);
		const socialIds = socialVm.compareRows.map((row) => row.id);
		const directoryIds = directoryVm.compareRows.map((row) => row.id);

		expect(allIds).toContain('posts_per_month');
		expect(allIds).toContain('directory_analytics');
		expect(socialIds).toContain('posts_per_month');
		expect(socialIds).not.toContain('directory_analytics');
		expect(directoryIds).not.toContain('posts_per_month');
		expect(directoryIds).toContain('directory_competitor_domains');
		expect(allIds.length).toBeGreaterThan(socialIds.length);
		expect(allIds.length).toBeGreaterThan(directoryIds.length);
	});

	it('filters plan card marketing bullets by product line', () => {
		const socialPlan = presenter.buildPageVm('MONTHLY', 'social').plans.find((p) => p.tier === 'SOLO');
		const directoryPlan = presenter.buildPageVm('MONTHLY', 'directory').plans.find(
			(p) => p.tier === 'SOLO'
		);
		const allPlan = presenter.buildPageVm('MONTHLY', 'all').plans.find((p) => p.tier === 'SOLO');

		expect(socialPlan).toBeDefined();
		expect(directoryPlan).toBeDefined();
		expect(allPlan).toBeDefined();

		expect(socialPlan!.features.some((f) => /calendar views/i.test(f))).toBe(true);
		expect(socialPlan!.features.some((f) => /directory analytics/i.test(f))).toBe(false);
		expect(socialPlan!.features.some((f) => /posts per month/i.test(f))).toBe(true);

		expect(directoryPlan!.features.some((f) => /domain rating analytics/i.test(f))).toBe(true);
		expect(directoryPlan!.features.some((f) => /posts per month/i.test(f))).toBe(false);
		expect(directoryPlan!.features.some((f) => /calendar views/i.test(f))).toBe(false);
		expect(directoryPlan!.features.some((f) => /competitor domains/i.test(f))).toBe(true);
		expect(directoryPlan!.features.some((f) => /ai writer/i.test(f))).toBe(false);
		expect(directoryPlan!.features.some((f) => /footage file manager/i.test(f))).toBe(false);
		expect(directoryPlan!.features.some((f) => /group management/i.test(f))).toBe(false);

		const communityIdx = directoryPlan!.features.findIndex((f) => /community features/i.test(f));
		const businessProfilesIdx = directoryPlan!.features.findIndex((f) =>
			/business profiles & directory launch/i.test(f)
		);
		expect(businessProfilesIdx).toBeGreaterThanOrEqual(0);
		expect(communityIdx).toBeGreaterThan(businessProfilesIdx);

		expect(allPlan!.features.length).toBeGreaterThan(socialPlan!.features.length);
		expect(allPlan!.features.length).toBeGreaterThan(directoryPlan!.features.length);
	});

	it('buildLandingTabPlans forwards productLine to buildPageVm', () => {
		const socialLanding = presenter.buildLandingTabPlans('MONTHLY', { productLine: 'social' });
		const allLanding = presenter.buildLandingTabPlans('MONTHLY');

		const socialSolo = socialLanding.find((p) => p.tier === 'SOLO');
		const allSolo = allLanding.find((p) => p.tier === 'SOLO');

		expect(socialSolo).toBeDefined();
		expect(allSolo).toBeDefined();
		expect(socialSolo!.features.some((f) => /directory analytics/i.test(f))).toBe(false);
		expect(allSolo!.features.length).toBeGreaterThan(socialSolo!.features.length);
	});

	it('home landing tab merge includes directory bullets not shown on social-only tabs', () => {
		const socialSolo = presenter.buildLandingTabPlans('MONTHLY', { productLine: 'social' }).find(
			(p) => p.tier === 'SOLO'
		);
		const directorySolo = presenter.buildLandingTabPlans('MONTHLY', {
			productLine: 'directory'
		}).find((p) => p.tier === 'SOLO');

		expect(socialSolo).toBeDefined();
		expect(directorySolo).toBeDefined();

		const merged = mergeLandingTabFeaturesForAllProductLines(
			socialSolo!.features,
			directorySolo!.features,
			PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT,
			PUBLIC_PRICING_LANDING_TAB_FEATURE_LIMIT_ALL
		);

		expect(merged.some((line) => /domain rating analytics/i.test(line))).toBe(true);
		expect(merged.some((line) => /posts per month/i.test(line))).toBe(true);
		expect(merged.some((line) => /business profiles/i.test(line))).toBe(true);
	});

	it('all product line includes competitor domain limits on plan cards', () => {
		const allSolo = presenter.buildPageVm('MONTHLY', 'all').plans.find((p) => p.tier === 'SOLO');
		expect(allSolo).toBeDefined();
		expect(allSolo!.features.some((line) => /competitor domains/i.test(line))).toBe(true);
	});
});

describe('directory competitor caps in compare cells', () => {
	const presenter = new GetPublicPricingPresenter();

	it('maps tier caps from planLimitsForTier', () => {
		const vm = presenter.buildPageVm('MONTHLY', 'all');
		const row = vm.compareRows.find((r) => r.id === 'directory_competitor_domains');
		expect(row).toBeDefined();

		for (const tier of ['SOLO', 'TEAM', 'ULTIMATE', 'MAX'] as const) {
			const limits = planLimitsForTier(tier);
			const cell = row!.cells[tier];
			expect(cell.kind).toBe('text');
			if (cell.kind !== 'text') continue;

			const perWorkspace = limits.directory_seo_competitors_per_workspace;
			if (limits.workspaces <= 1) {
				expect(cell.text).toBe(String(perWorkspace));
			} else {
				const total = perWorkspace * limits.workspaces;
				expect(cell.text).toBe(`${total} (${perWorkspace}/ workspace)`);
			}
		}
	});
});
