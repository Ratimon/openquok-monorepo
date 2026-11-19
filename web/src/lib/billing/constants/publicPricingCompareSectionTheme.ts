import type { IconName } from '$data/icons';

import { icons } from '$data/icons';

import type { PublicPricingCompareSectionId } from '$lib/billing/constants/publicPricingCompareSections';

export type PublicPricingCompareSectionTheme = {
	icon: IconName;
	/** Left ribbon + header row */
	headerCellClass: string;
	headerIconClass: string;
	headerTitleClass: string;
	/** Feature label column inside the section */
	labelCellClass: string;
	/** Non-featured plan cells inside the section */
	planCellClass: string;
};

export const PUBLIC_PRICING_COMPARE_SECTION_THEMES: Record<
	PublicPricingCompareSectionId,
	PublicPricingCompareSectionTheme
> = {
	publish: {
		icon: icons.Send.name,
		headerCellClass: 'border-l-4 border-l-primary bg-primary/10',
		headerIconClass: 'text-primary',
		headerTitleClass: 'text-primary',
		labelCellClass: 'border-l-4 border-l-primary/40 bg-primary/[0.06]',
		planCellClass: 'bg-primary/[0.04]'
	},
	automate: {
		icon: icons.Bot.name,
		headerCellClass: 'border-l-4 border-l-violet-500 bg-violet-500/10',
		headerIconClass: 'text-violet-600 dark:text-violet-400',
		headerTitleClass: 'text-violet-700 dark:text-violet-300',
		labelCellClass: 'border-l-4 border-l-violet-500/35 bg-violet-500/[0.06]',
		planCellClass: 'bg-violet-500/[0.04]'
	},
	list: {
		icon: icons.List.name,
		headerCellClass: 'border-l-4 border-l-sky-500 bg-sky-500/10',
		headerIconClass: 'text-sky-600 dark:text-sky-400',
		headerTitleClass: 'text-sky-700 dark:text-sky-300',
		labelCellClass: 'border-l-4 border-l-sky-500/35 bg-sky-500/[0.06]',
		planCellClass: 'bg-sky-500/[0.04]'
	},
	curate: {
		icon: icons.Columns3Cog.name,
		headerCellClass: 'border-l-4 border-l-amber-500 bg-amber-500/10',
		headerIconClass: 'text-amber-600 dark:text-amber-400',
		headerTitleClass: 'text-amber-800 dark:text-amber-300',
		labelCellClass: 'border-l-4 border-l-amber-500/35 bg-amber-500/[0.06]',
		planCellClass: 'bg-amber-500/[0.04]'
	},
	generate: {
		icon: icons.Sparkles.name,
		headerCellClass: 'border-l-4 border-l-fuchsia-500 bg-fuchsia-500/10',
		headerIconClass: 'text-fuchsia-600 dark:text-fuchsia-400',
		headerTitleClass: 'text-fuchsia-700 dark:text-fuchsia-300',
		labelCellClass: 'border-l-4 border-l-fuchsia-500/35 bg-fuchsia-500/[0.06]',
		planCellClass: 'bg-fuchsia-500/[0.04]'
	},
	analyze: {
		icon: icons.ChartBar.name,
		headerCellClass: 'border-l-4 border-l-cyan-500 bg-cyan-500/10',
		headerIconClass: 'text-cyan-600 dark:text-cyan-400',
		headerTitleClass: 'text-cyan-800 dark:text-cyan-300',
		labelCellClass: 'border-l-4 border-l-cyan-500/35 bg-cyan-500/[0.06]',
		planCellClass: 'bg-cyan-500/[0.04]'
	},
	collaborate: {
		icon: icons.Users.name,
		headerCellClass: 'border-l-4 border-l-orange-500 bg-orange-500/10',
		headerIconClass: 'text-orange-600 dark:text-orange-400',
		headerTitleClass: 'text-orange-800 dark:text-orange-300',
		labelCellClass: 'border-l-4 border-l-orange-500/35 bg-orange-500/[0.06]',
		planCellClass: 'bg-orange-500/[0.04]'
	},
	support: {
		icon: icons.Handshake.name,
		headerCellClass: 'border-l-4 border-l-slate-500 bg-slate-500/10',
		headerIconClass: 'text-slate-600 dark:text-slate-400',
		headerTitleClass: 'text-slate-700 dark:text-slate-300',
		labelCellClass: 'border-l-4 border-l-slate-500/35 bg-slate-500/[0.06]',
		planCellClass: 'bg-slate-500/[0.04]'
	}
};

export function publicPricingCompareSectionTheme(
	sectionId: PublicPricingCompareSectionId
): PublicPricingCompareSectionTheme {
	return PUBLIC_PRICING_COMPARE_SECTION_THEMES[sectionId];
}