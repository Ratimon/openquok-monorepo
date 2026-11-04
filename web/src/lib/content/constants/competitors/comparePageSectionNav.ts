import type {
	CompareDetailLongFormViewModel,
	ComparePairLayout
} from '$lib/content/constants/competitors/types';

export type ComparePageSectionNavItem = {
	id: string;
	navLabel: string;
	index: number;
};

const FAQ_SECTION_NAV: ComparePageSectionNavItem = {
	id: 'faq',
	index: 7,
	navLabel: 'Questions'
};

export function buildCompareDirectoryLongFormNavSections(
	longForm: CompareDetailLongFormViewModel
): ComparePageSectionNavItem[] {
	const contentSections = [
		longForm.whyPeopleLook,
		longForm.yourOptions,
		longForm.switchingChecklist,
		longForm.openQuokAlternative,
		longForm.whenTheyWin,
		longForm.otherAlternatives
	];

	return [
		...contentSections.map((section, index) => ({
			id: section.id,
			navLabel: section.navLabel,
			index: index + 1
		})),
		FAQ_SECTION_NAV
	];
}

export function buildCompareSocialMatrixNavSections(options: {
	includeChannels: boolean;
	includeFaq: boolean;
}): ComparePageSectionNavItem[] {
	const items: Omit<ComparePageSectionNavItem, 'index'>[] = [
		{ id: 'compare-platform-overview', navLabel: 'Platform overview' },
		{ id: 'compare-pricing-plans', navLabel: 'Pricing & plans' }
	];
	if (options.includeChannels) {
		items.push({ id: 'compare-channels', navLabel: 'Supported channels' });
	}
	items.push(
		{ id: 'compare-feature-comparison', navLabel: 'Feature comparison' },
		{ id: 'compare-benefits', navLabel: 'With vs without' }
	);
	if (options.includeFaq) {
		items.push({ id: 'faq', navLabel: 'Questions' });
	}
	items.push({ id: 'compare-more-comparisons', navLabel: 'More comparisons' });

	return items.map((item, index) => ({ ...item, index: index + 1 }));
}

export function buildComparePageSectionNavItems(options: {
	layout: ComparePairLayout;
	longForm: CompareDetailLongFormViewModel | null;
	includeChannels: boolean;
	includeFaq: boolean;
}): ComparePageSectionNavItem[] {
	if (options.layout === 'directory_long_form' && options.longForm) {
		return buildCompareDirectoryLongFormNavSections(options.longForm);
	}
	return buildCompareSocialMatrixNavSections({
		includeChannels: options.includeChannels,
		includeFaq: options.includeFaq
	});
}

export const COMPARE_PAGE_ON_PAGE_NAV_SCHEMA_ID_SUFFIX = '#on-this-page';
