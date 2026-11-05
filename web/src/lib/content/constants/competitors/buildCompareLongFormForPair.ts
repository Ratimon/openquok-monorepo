import type {
	CompareDetailLongFormViewModel,
	CompareDirectoryLongFormContent,
	CompareProduct
} from '$lib/content/constants/competitors/types';

import {
	assembleDirectoryLongFormViewModel,
	assembleSocialAlternativesLongFormViewModel,
	buildDefaultSocialAlternativesLongFormContent
} from '$lib/content/constants/competitors/buildCompareLongFormSections';
import { COMPARE_HUB_BASE_SLUG } from '$lib/content/constants/competitors/shared';
import { resolveComparePairLayout } from '$lib/content/constants/competitors/utils/compareProductCategories';

function resolveOpenQuokAndFocus(
	left: CompareProduct,
	right: CompareProduct
): { openQuok: CompareProduct | null; focus: CompareProduct } {
	const openQuok =
		left.slug === COMPARE_HUB_BASE_SLUG
			? left
			: right.slug === COMPARE_HUB_BASE_SLUG
				? right
				: null;
	const focus = openQuok ? (left.slug === openQuok.slug ? right : left) : left;
	return { openQuok, focus };
}

function buildDefaultSocialCompareLongFormContent(
	left: CompareProduct,
	right: CompareProduct,
	openQuok: CompareProduct | null
): CompareDirectoryLongFormContent {
	if (openQuok) {
		const focus = left.slug === openQuok.slug ? right : left;
		const base = focus.alternativesLongForm ?? buildDefaultSocialAlternativesLongFormContent(focus);
		return {
			...base,
			whyPeopleLook: {
				...base.whyPeopleLook,
				title: `Why teams compare ${openQuok.name} and ${focus.name}`,
				body: [
					`${focus.name} ${focus.comparison.positioningWhenLeft}.`,
					`${openQuok.name} ${openQuok.comparison.positioningWhenLeft}.`,
					'Compare prices, channels, and control in the sections below.'
				]
			},
			yourOptions: {
				...base.yourOptions,
				title: `Your options with ${focus.name} and ${openQuok.name}`,
				body: [
					`Stay on ${focus.name}, adopt ${openQuok.name}, or pick another scheduler from the compare hub.`,
					'See public pricing in the section below.',
					'Verify list prices on each vendor site before you buy.'
				]
			}
		};
	}

	const base = buildDefaultSocialAlternativesLongFormContent(right);
	return {
		...base,
		whyPeopleLook: {
			...base.whyPeopleLook,
			title: `Why teams compare ${left.name} and ${right.name}`,
			body: [
				`${left.name} ${left.comparison.positioningWhenLeft}.`,
				`${right.name} ${right.comparison.positioningWhenLeft}.`,
				'Use the sections below before you migrate accounts.'
			]
		},
		whenTheyWin: {
			...base.whenTheyWin,
			title: `When ${right.name} stays the better choice`,
			body: [
				`${right.name} is built for ${right.comparison.builtFor}.`,
				`${left.name} fits teams who want ${left.comparison.builtFor}.`,
				'Pick the product that matches your budget this quarter.'
			]
		}
	};
}

/** Long-form sections for every compare pair (social and directory). */
export function buildCompareLongFormForPair(
	left: CompareProduct,
	right: CompareProduct
): CompareDetailLongFormViewModel | null {
	const layout = resolveComparePairLayout(left, right);
	const { openQuok, focus } = resolveOpenQuokAndFocus(left, right);

	if (layout === 'directory_long_form' && focus.directoryLongForm && openQuok) {
		return assembleDirectoryLongFormViewModel({
			competitor: focus,
			openQuok,
			directoryLongForm: focus.directoryLongForm,
			otherAlternativePeers: []
		});
	}

	const content =
		focus.alternativesLongForm ??
		focus.directoryLongForm ??
		buildDefaultSocialCompareLongFormContent(left, right, openQuok);

	if (openQuok) {
		return assembleSocialAlternativesLongFormViewModel({
			competitor: focus,
			openQuok,
			content,
			otherAlternativePeers: []
		});
	}

	return assembleSocialAlternativesLongFormViewModel({
		competitor: right,
		openQuok: left,
		content: buildDefaultSocialCompareLongFormContent(left, right, null),
		otherAlternativePeers: []
	});
}
