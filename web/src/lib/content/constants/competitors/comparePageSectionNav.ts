import type {
	CompareDetailLongFormViewModel,
	ComparePairLayout
} from '$lib/content/constants/competitors/types';

export type ComparePageSectionNavItem = {
	id: string;
	navLabel: string;
	index: number;
};

/**
 * Shared “On this page” order for compare detail and alternatives detail —
 * narrative sections plus matrix sections in one list.
 */
export function buildUnifiedCompareNavSections(options: {
	longForm: CompareDetailLongFormViewModel;
	includeSocialChannels: boolean;
	includeDirectoryChannels: boolean;
	includeFaq: boolean;
	includeMoreComparisons: boolean;
	includePricing?: boolean;
	includeFeatureComparison?: boolean;
	includeWithWithout?: boolean;
	includeOtherAlternatives?: boolean;
	/** “Best alternatives to …” ranked list on `/alternatives/[slug]`. */
	includeRankedPicks?: boolean;
}): ComparePageSectionNavItem[] {
	const {
		longForm,
		includeSocialChannels,
		includeDirectoryChannels,
		includeFaq,
		includeMoreComparisons,
		includePricing = true,
		includeFeatureComparison = true,
		includeWithWithout = true,
		includeOtherAlternatives = true,
		includeRankedPicks = false
	} = options;

	const items: Omit<ComparePageSectionNavItem, 'index'>[] = [
		{ id: 'compare-platform-overview', navLabel: 'Platform overview' },
		{ id: longForm.whyPeopleLook.id, navLabel: longForm.whyPeopleLook.navLabel },
		{ id: longForm.yourOptions.id, navLabel: longForm.yourOptions.navLabel }
	];

	if (includeRankedPicks) {
		items.push({ id: 'alternatives-best-list', navLabel: 'Ranked picks' });
	}

	if (includePricing) {
		items.push({ id: 'compare-pricing-plans', navLabel: 'Pricing & plans' });
	}

	if (includeSocialChannels) {
		items.push({ id: 'compare-social-channels', navLabel: 'Supported social channels' });
	}

	if (includeDirectoryChannels) {
		items.push({ id: 'compare-directory-channels', navLabel: 'Supported directory channels' });
	}

	if (includeFeatureComparison) {
		items.push({ id: 'compare-feature-comparison', navLabel: 'Feature comparison' });
	}

	if (includeWithWithout) {
		items.push({ id: 'compare-benefits', navLabel: 'With vs without' });
	}

	items.push({ id: longForm.whenTheyWin.id, navLabel: longForm.whenTheyWin.navLabel });

	if (includeOtherAlternatives) {
		items.push({ id: longForm.otherAlternatives.id, navLabel: longForm.otherAlternatives.navLabel });
	}

	if (includeFaq) {
		items.push({ id: 'faq', navLabel: 'Questions' });
	}

	if (includeMoreComparisons) {
		items.push({ id: 'compare-more-comparisons', navLabel: 'More comparisons' });
	}

	return items.map((item, index) => ({ ...item, index: index + 1 }));
}

/** On-this-page nav for `/alternatives/{slug}` — narrative + ranked picks, no pair compare matrices. */
export function buildAlternativesDetailNavSections(
	longForm: CompareDetailLongFormViewModel,
	includeFaq: boolean
): ComparePageSectionNavItem[] {
	return buildUnifiedCompareNavSections({
		longForm,
		includeSocialChannels: false,
		includeDirectoryChannels: false,
		includeFaq,
		includeMoreComparisons: false,
		includePricing: false,
		includeFeatureComparison: false,
		includeWithWithout: false,
		includeOtherAlternatives: false,
		includeRankedPicks: true
	});
}

/** @deprecated Use {@link buildUnifiedCompareNavSections}. */
export function buildCompareDirectoryLongFormNavSections(
	longForm: CompareDetailLongFormViewModel
): ComparePageSectionNavItem[] {
	return buildUnifiedCompareNavSections({
		longForm,
		includeSocialChannels: false,
		includeDirectoryChannels: false,
		includeFaq: true,
		includeMoreComparisons: false
	});
}

/** @deprecated Use {@link buildUnifiedCompareNavSections}. */
export function buildCompareSocialMatrixNavSections(options: {
	includeSocialChannels: boolean;
	includeFaq: boolean;
}): ComparePageSectionNavItem[] {
	const placeholderLongForm = {
		whyPeopleLook: { id: 'why-people-look', navLabel: 'Why people look' },
		yourOptions: { id: 'your-options', navLabel: 'Your options' },
		whenTheyWin: { id: 'when-they-win', navLabel: 'When they win' },
		otherAlternatives: { id: 'other-alternatives', navLabel: 'Other alternatives' }
	} as CompareDetailLongFormViewModel;

	return buildUnifiedCompareNavSections({
		longForm: placeholderLongForm,
		includeSocialChannels: options.includeSocialChannels,
		includeDirectoryChannels: false,
		includeFaq: options.includeFaq,
		includeMoreComparisons: true
	});
}

export function buildComparePageSectionNavItems(options: {
	layout: ComparePairLayout;
	longForm: CompareDetailLongFormViewModel | null;
	includeSocialChannels: boolean;
	includeDirectoryChannels: boolean;
	includeFaq: boolean;
}): ComparePageSectionNavItem[] {
	if (!options.longForm) {
		return buildCompareSocialMatrixNavSections({
			includeSocialChannels: options.includeSocialChannels,
			includeFaq: options.includeFaq
		});
	}

	return buildUnifiedCompareNavSections({
		longForm: options.longForm,
		includeSocialChannels: options.includeSocialChannels,
		includeDirectoryChannels: options.includeDirectoryChannels,
		includeFaq: options.includeFaq,
		includeMoreComparisons: true
	});
}

export const COMPARE_PAGE_ON_PAGE_NAV_SCHEMA_ID_SUFFIX = '#on-this-page';
