import type { CompareProductSlug } from './types';

export type CompareProductIconStyleSets = {
	hero: Record<CompareProductSlug, { heroContainerClass: string; iconClass?: string }>;
	card: Record<CompareProductSlug, { cardContainerClass: string; iconClass?: string }>;
	hub: Record<CompareProductSlug, { containerClass: string; iconClass?: string }>;
};

export type CompareProductHeroCardIconStyle = {
	heroContainerClass: string;
	cardContainerClass: string;
	iconClass?: string;
};

const BASE = {
	openquok: {
		heroContainerClass:
			'bg-linear-to-br from-emerald-400/30 via-lime-300/20 to-amber-300/25 text-white ring-emerald-300/35',
		cardContainerClass:
			'bg-linear-to-br from-emerald-400/22 via-lime-300/16 to-amber-300/20 text-white ring-emerald-300/28'
	},
	hootsuite: {
		heroContainerClass:
			'bg-linear-to-br from-orange-400/30 via-amber-300/20 to-yellow-300/20 text-orange-100 ring-orange-300/35',
		cardContainerClass:
			'bg-linear-to-br from-orange-400/20 via-amber-300/16 to-yellow-300/16 text-orange-100 ring-orange-300/28'
	},
	heropost: {
		heroContainerClass:
			'bg-linear-to-br from-amber-500/30 via-orange-400/20 to-rose-400/25 text-amber-50 ring-amber-400/40',
		cardContainerClass:
			'bg-linear-to-br from-amber-500/22 via-orange-400/16 to-rose-400/18 text-amber-50 ring-amber-400/28'
	},
	'hopper-hq': {
		heroContainerClass:
			'bg-linear-to-br from-blue-500/30 via-sky-400/20 to-cyan-300/20 text-blue-100 ring-blue-400/35',
		cardContainerClass:
			'bg-linear-to-br from-blue-500/20 via-sky-400/16 to-cyan-300/16 text-blue-100 ring-blue-400/28'
	},
	influence: {
		heroContainerClass:
			'bg-linear-to-br from-neutral-700/40 via-neutral-500/25 to-neutral-300/20 text-neutral-50 ring-neutral-400/35',
		cardContainerClass:
			'bg-linear-to-br from-neutral-700/28 via-neutral-500/18 to-neutral-300/14 text-neutral-50 ring-neutral-400/28'
	},
	later: {
		heroContainerClass:
			'bg-linear-to-br from-violet-800/40 via-fuchsia-700/20 to-orange-400/25 text-amber-50 ring-violet-500/40',
		cardContainerClass:
			'bg-linear-to-br from-violet-800/28 via-fuchsia-700/16 to-orange-400/18 text-amber-50 ring-violet-500/28'
	},
	buffer: {
		heroContainerClass:
			'bg-linear-to-br from-sky-400/30 via-cyan-300/20 to-blue-300/20 text-sky-100 ring-sky-300/35',
		cardContainerClass:
			'bg-linear-to-br from-sky-400/20 via-cyan-300/16 to-blue-300/16 text-sky-100 ring-sky-300/28'
	},
	blotato: {
		heroContainerClass:
			'bg-linear-to-br from-lime-500/35 via-amber-400/25 to-orange-400/20 text-lime-50 ring-lime-500/40',
		cardContainerClass:
			'bg-linear-to-br from-lime-500/22 via-amber-400/18 to-orange-400/14 text-lime-50 ring-lime-500/28'
	},
	boringlaunch: {
		heroContainerClass:
			'bg-linear-to-br from-zinc-600/35 via-stone-500/25 to-yellow-400/20 text-yellow-50 ring-yellow-500/35',
		cardContainerClass:
			'bg-linear-to-br from-zinc-600/22 via-stone-500/18 to-yellow-400/14 text-yellow-50 ring-yellow-500/28'
	},
	breakreach: {
		heroContainerClass:
			'bg-linear-to-br from-violet-600/35 via-purple-500/25 to-fuchsia-400/20 text-violet-50 ring-violet-500/40',
		cardContainerClass:
			'bg-linear-to-br from-violet-600/22 via-purple-500/18 to-fuchsia-400/14 text-violet-50 ring-violet-500/28'
	},
	'claw-post': {
		heroContainerClass:
			'bg-linear-to-br from-red-500/30 via-rose-400/20 to-cyan-400/20 text-red-50 ring-red-400/35',
		cardContainerClass:
			'bg-linear-to-br from-red-500/20 via-rose-400/16 to-cyan-400/16 text-red-50 ring-red-400/28'
	},
	recurpost: {
		heroContainerClass:
			'bg-linear-to-br from-yellow-400/35 via-amber-300/20 to-yellow-500/25 text-yellow-50 ring-yellow-400/40',
		cardContainerClass:
			'bg-linear-to-br from-yellow-400/22 via-amber-300/16 to-yellow-500/18 text-yellow-50 ring-yellow-400/28'
	},
	mixpost: {
		heroContainerClass:
			'bg-linear-to-br from-indigo-500/30 via-violet-400/20 to-cyan-300/20 text-indigo-100 ring-indigo-400/35',
		cardContainerClass:
			'bg-linear-to-br from-indigo-500/20 via-violet-400/16 to-cyan-300/16 text-indigo-100 ring-indigo-400/28'
	},
	openpost: {
		heroContainerClass:
			'bg-linear-to-br from-teal-500/30 via-cyan-400/20 to-sky-300/20 text-teal-50 ring-teal-400/35',
		cardContainerClass:
			'bg-linear-to-br from-teal-500/20 via-cyan-400/16 to-sky-300/16 text-teal-50 ring-teal-400/28'
	},
	'post-bridge': {
		heroContainerClass:
			'bg-linear-to-br from-rose-400/30 via-orange-300/20 to-amber-300/20 text-rose-100 ring-rose-300/35',
		cardContainerClass:
			'bg-linear-to-br from-rose-400/20 via-orange-300/16 to-amber-300/16 text-rose-100 ring-rose-300/28'
	},
	postfast: {
		heroContainerClass:
			'bg-linear-to-br from-blue-600/30 via-blue-400/20 to-cyan-300/20 text-blue-50 ring-blue-500/35',
		cardContainerClass:
			'bg-linear-to-br from-blue-600/20 via-blue-400/16 to-cyan-300/16 text-blue-50 ring-blue-500/28'
	},
	postpeer: {
		heroContainerClass:
			'bg-linear-to-br from-red-400/30 via-rose-300/20 to-orange-300/20 text-red-50 ring-red-300/35',
		cardContainerClass:
			'bg-linear-to-br from-red-400/20 via-rose-300/16 to-orange-300/16 text-red-50 ring-red-300/28'
	},
	post2all: {
		heroContainerClass:
			'bg-linear-to-br from-stone-600/35 via-stone-500/25 to-amber-200/20 text-stone-50 ring-stone-400/40',
		cardContainerClass:
			'bg-linear-to-br from-stone-600/28 via-stone-500/20 to-amber-200/16 text-stone-50 ring-stone-400/32'
	},
	postiz: {
		heroContainerClass:
			'bg-linear-to-br from-violet-400/30 via-purple-300/20 to-fuchsia-300/20 text-violet-100 ring-violet-300/35',
		cardContainerClass:
			'bg-linear-to-br from-violet-400/20 via-purple-300/16 to-fuchsia-300/16 text-violet-100 ring-violet-300/28'
	},
	publer: {
		heroContainerClass:
			'bg-linear-to-br from-teal-400/35 via-cyan-300/25 to-emerald-300/20 text-teal-50 ring-teal-300/40',
		cardContainerClass:
			'bg-linear-to-br from-teal-400/22 via-cyan-300/18 to-emerald-300/14 text-teal-50 ring-teal-300/28'
	},
	socialclaw: {
		heroContainerClass:
			'bg-linear-to-br from-red-500/30 via-rose-400/20 to-orange-300/20 text-red-50 ring-red-400/40',
		cardContainerClass:
			'bg-linear-to-br from-red-500/20 via-rose-400/16 to-orange-300/16 text-red-50 ring-red-400/28'
	},
	socialync: {
		heroContainerClass:
			'bg-linear-to-br from-violet-500/35 via-purple-400/25 to-fuchsia-400/20 text-violet-50 ring-violet-400/40',
		cardContainerClass:
			'bg-linear-to-br from-violet-500/22 via-purple-400/18 to-fuchsia-400/14 text-violet-50 ring-violet-400/30'
	},
	'sprout-social': {
		heroContainerClass:
			'bg-linear-to-br from-emerald-500/35 via-green-400/25 to-lime-300/20 text-emerald-50 ring-emerald-400/40',
		cardContainerClass:
			'bg-linear-to-br from-emerald-500/22 via-green-400/18 to-lime-300/14 text-emerald-50 ring-emerald-400/30'
	},
	typefully: {
		heroContainerClass:
			'bg-linear-to-br from-blue-500/30 via-indigo-400/20 to-sky-300/20 text-blue-100 ring-blue-400/35',
		cardContainerClass:
			'bg-linear-to-br from-blue-500/20 via-indigo-400/16 to-sky-300/16 text-blue-100 ring-blue-400/28'
	},
	usebard: {
		heroContainerClass:
			'bg-linear-to-br from-purple-600/30 via-violet-500/20 to-fuchsia-400/20 text-purple-100 ring-purple-500/35',
		cardContainerClass:
			'bg-linear-to-br from-purple-600/20 via-violet-500/16 to-fuchsia-400/16 text-purple-100 ring-purple-500/28'
	}
} satisfies Record<
	CompareProductSlug,
	{ heroContainerClass: string; cardContainerClass: string }
>;

export const COMPARE_PRODUCT_ICON_STYLES_HERO = Object.fromEntries(
	Object.entries(BASE).map(([slug, styles]) => [
		slug,
		{ heroContainerClass: styles.heroContainerClass }
	])
) as CompareProductIconStyleSets['hero'];

export const COMPARE_PRODUCT_ICON_STYLES_CARD = Object.fromEntries(
	Object.entries(BASE).map(([slug, styles]) => [
		slug,
		{ cardContainerClass: styles.cardContainerClass }
	])
) as CompareProductIconStyleSets['card'];

export const COMPARE_PRODUCT_ICON_STYLES_HUB = Object.fromEntries(
	Object.entries(BASE).map(([slug, styles]) => [
		slug,
		{ containerClass: styles.heroContainerClass }
	])
) as CompareProductIconStyleSets['hub'];

/** Hero + card rings for compare detail and alternatives detail pages. */
export function getCompareProductHeroCardIconStyles(
	slug: CompareProductSlug
): CompareProductHeroCardIconStyle {
	const hero = COMPARE_PRODUCT_ICON_STYLES_HERO[slug];
	const card = COMPARE_PRODUCT_ICON_STYLES_CARD[slug];
	return {
		heroContainerClass: hero.heroContainerClass,
		cardContainerClass: card.cardContainerClass,
		iconClass: hero.iconClass ?? card.iconClass
	};
}
