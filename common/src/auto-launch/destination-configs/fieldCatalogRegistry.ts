import type { LaunchStepField } from '../../browser-extension/pageAssist.js';
import {
	coerceToDevhuntOfficialPricing,
	devhuntSelectCatalogOptions,
	matchDevhuntOfficialPricing,
} from './devhunt.js';
import {
	coerceToNickLaunchesOfficialPricing,
	filterToNickLaunchesOfficialCategories,
	matchNickLaunchesOfficialCategory,
	matchNickLaunchesOfficialPricing,
	nickLaunchesSelectCatalogOptions,
} from './nick-launches.js';
import {
	filterToIndiehubOfficialCategories,
	matchIndiehubOfficialCategory,
} from './indiehub.js';
import {
	alternativetoSelectCatalogOptions,
	coerceToAlternativetoOfficialLicense,
	filterToAlternativetoOfficialPlatforms,
	matchAlternativetoOfficialLicense,
	matchAlternativetoOfficialPlatform,
} from './alternativeto.js';
import {
	coerceToOpenLaunchOfficialPricing,
	filterToOpenLaunchOfficialCategories,
	filterToOpenLaunchOfficialPlatforms,
	invalidOpenLaunchProfileChoicesForField,
	matchOpenLaunchOfficialPricing,
	openLaunchSelectCatalogOptions,
} from './openLaunch.js';
import {
	coerceToTinylaunchOfficialCategory,
	matchTinylaunchOfficialCategory,
	tinylaunchSelectCatalogOptions,
} from './tinylaunch.js';
import {
	coerceToUneedOfficialCategory,
	coerceUneedPricingType,
	filterToUneedOfficialTags,
	isUneedOfficialTag,
	matchUneedOfficialCategory,
	uneedSelectCatalogOptions,
} from './uneed.js';

/** Stable catalog ids for shipped `LaunchStepField` catalog keys (not stored in DB). */
export const LAUNCH_FIELD_CATALOG_IDS = {
	'uneed:tags': 'uneed:tags',
	'uneed:select': 'uneed:select',
	'tinylaunch:select': 'tinylaunch:select',
	'open_launch:categories': 'open_launch:categories',
	'open_launch:platforms': 'open_launch:platforms',
	'open_launch:pricing': 'open_launch:pricing',
	'devhunt:pricing': 'devhunt:pricing',
	'nick_launches:categories': 'nick_launches:categories',
	'nick_launches:pricing': 'nick_launches:pricing',
	'indiehub:categories': 'indiehub:categories',
	'alternativeto:platforms': 'alternativeto:platforms',
	'alternativeto:license': 'alternativeto:license',
} as const;

export type LaunchFieldCatalogId = keyof typeof LAUNCH_FIELD_CATALOG_IDS;

export function resolveLaunchFieldCatalogId(field: LaunchStepField): LaunchFieldCatalogId | null {
	if (field.tagsCatalog === 'uneed') return 'uneed:tags';
	if (field.selectCatalog === 'uneed') return 'uneed:select';
	if (field.selectCatalog === 'tinylaunch') return 'tinylaunch:select';
	if (field.checkboxCatalog === 'open_launch_categories') return 'open_launch:categories';
	if (field.checkboxCatalog === 'open_launch_platforms') return 'open_launch:platforms';
	if (field.selectCatalog === 'open_launch_pricing') return 'open_launch:pricing';
	if (field.selectCatalog === 'devhunt_pricing') return 'devhunt:pricing';
	if (field.tagsCatalog === 'nick_launches_categories') return 'nick_launches:categories';
	if (field.selectCatalog === 'nick_launches_pricing') return 'nick_launches:pricing';
	if (field.tagsCatalog === 'indiehub_categories') return 'indiehub:categories';
	if (field.checkboxCatalog === 'alternativeto_platforms') return 'alternativeto:platforms';
	if (field.selectCatalog === 'alternativeto_license') return 'alternativeto:license';
	return null;
}

export function fieldHasLaunchFieldCatalog(field: LaunchStepField): boolean {
	return resolveLaunchFieldCatalogId(field) !== null;
}

/** Catalog-aware filter for multi-value profile fields (tags, checkbox groups). Does not apply `maxItems`. */
export function filterItemsForLaunchField(items: readonly string[], field: LaunchStepField): string[] {
	const id = resolveLaunchFieldCatalogId(field);
	switch (id) {
		case 'uneed:tags':
			return filterToUneedOfficialTags(items);
		case 'open_launch:categories':
			return filterToOpenLaunchOfficialCategories(items);
		case 'open_launch:platforms':
			return filterToOpenLaunchOfficialPlatforms(items);
		case 'nick_launches:categories':
			return filterToNickLaunchesOfficialCategories(items);
		case 'indiehub:categories':
			return filterToIndiehubOfficialCategories(items);
		case 'alternativeto:platforms':
			return filterToAlternativetoOfficialPlatforms(items);
		default:
			return [...items];
	}
}

export function invalidProfileChoicesForField(
	items: readonly string[] | undefined,
	field: LaunchStepField
): string[] {
	if (!items?.length) return [];
	const id = resolveLaunchFieldCatalogId(field);
	if (id === 'uneed:tags') {
		return items.filter((item) => !isUneedOfficialTag(item));
	}
	if (id === 'open_launch:categories' || id === 'open_launch:platforms') {
		return invalidOpenLaunchProfileChoicesForField(items, field);
	}
	if (id === 'nick_launches:categories') {
		return items.filter((item) => matchNickLaunchesOfficialCategory(item) === null);
	}
	if (id === 'indiehub:categories') {
		return items.filter((item) => matchIndiehubOfficialCategory(item) === null);
	}
	if (id === 'alternativeto:platforms') {
		return items.filter((item) => matchAlternativetoOfficialPlatform(item) === null);
	}
	return [];
}

export function selectPresetsForField(field: LaunchStepField): readonly string[] {
	const id = resolveLaunchFieldCatalogId(field);
	if (id === 'open_launch:pricing') {
		return openLaunchSelectCatalogOptions('open_launch_pricing');
	}
	if (id === 'devhunt:pricing') {
		return devhuntSelectCatalogOptions('devhunt_pricing');
	}
	if (id === 'nick_launches:pricing') {
		return nickLaunchesSelectCatalogOptions('nick_launches_pricing');
	}
	if (id === 'alternativeto:license') {
		return alternativetoSelectCatalogOptions('alternativeto_license');
	}
	if (id === 'uneed:select') {
		return uneedSelectCatalogOptions('uneed');
	}
	if (id === 'tinylaunch:select') {
		return tinylaunchSelectCatalogOptions('tinylaunch');
	}
	const openLaunch = openLaunchSelectCatalogOptions(field.selectCatalog);
	if (openLaunch.length > 0) return openLaunch;
	return uneedSelectCatalogOptions(field.selectCatalog);
}

export function applySelectCoercionForField(scalar: string, field: LaunchStepField): string {
	const id = resolveLaunchFieldCatalogId(field);
	if (id === 'uneed:select') {
		return coerceToUneedOfficialCategory(scalar);
	}
	if (id === 'tinylaunch:select') {
		return coerceToTinylaunchOfficialCategory(scalar);
	}
	if (id === 'open_launch:pricing') {
		return coerceToOpenLaunchOfficialPricing(scalar);
	}
	if (id === 'devhunt:pricing') {
		return coerceToDevhuntOfficialPricing(scalar);
	}
	if (id === 'nick_launches:pricing') {
		return coerceToNickLaunchesOfficialPricing(scalar);
	}
	if (id === 'alternativeto:license') {
		return coerceToAlternativetoOfficialLicense(scalar);
	}
	if (field.selectCatalog === 'uneed' && field.key === 'pricing_type') {
		return coerceUneedPricingType(scalar);
	}
	return scalar;
}

/** User-facing skip when profile list values fail catalog filtering before DOM fill. */
export function catalogListFillSkipMessage(field: LaunchStepField): string | null {
	const id = resolveLaunchFieldCatalogId(field);
	switch (id) {
		case 'uneed:tags':
			return 'No profile tags match the Uneed catalog (red chips). Add official tags on the form yourself.';
		case 'open_launch:categories':
		case 'open_launch:platforms':
			return 'No profile values match the Open Launch catalog (red chips). Pick categories on the form yourself.';
		case 'nick_launches:categories':
			return 'No profile categories match the Nick Launches catalog (red chips). Pick categories on the form yourself.';
		case 'indiehub:categories':
			return 'No profile categories match the IndieHub catalog (red chips). Pick categories on the form yourself.';
		case 'alternativeto:platforms':
			return 'No profile platforms match the AlternativeTo catalog (red chips). Pick platforms on the form yourself.';
		default:
			return null;
	}
}

/** Softer fill failure for catalog tag controls that need chip sync on the live form. */
export function catalogTagsDomFillSkipMessage(field: LaunchStepField): string | null {
	if (resolveLaunchFieldCatalogId(field) === 'uneed:tags') {
		return 'Could not replace tags on Uneed (existing tags may need manual removal). Compare stays in warning until the form matches profile.';
	}
	return null;
}

/** Optional bounds for resolved checkbox-group roots (extension DOM guard — catalog-specific). */
export function choiceGroupControlCountBounds(
	field: LaunchStepField
): { min: number; max: number } | null {
	const id = resolveLaunchFieldCatalogId(field);
	switch (id) {
		case 'open_launch:platforms':
			return { min: 2, max: 10 };
		case 'open_launch:categories':
			return { min: 2, max: 500 };
		case 'alternativeto:platforms':
			return { min: 1, max: 12 };
		default:
			return null;
	}
}

export function invalidSelectForField(scalar: string | undefined, field: LaunchStepField): boolean {
	if (!scalar?.trim()) return false;
	const id = resolveLaunchFieldCatalogId(field);
	if (id === 'uneed:select') {
		return matchUneedOfficialCategory(scalar) === null;
	}
	if (id === 'tinylaunch:select') {
		return matchTinylaunchOfficialCategory(scalar) === null;
	}
	if (id === 'open_launch:pricing') {
		return (
			matchOpenLaunchOfficialPricing(scalar) === null &&
			coerceToOpenLaunchOfficialPricing(scalar) === scalar.trim()
		);
	}
	if (id === 'devhunt:pricing') {
		return (
			matchDevhuntOfficialPricing(scalar) === null &&
			coerceToDevhuntOfficialPricing(scalar) === scalar.trim()
		);
	}
	if (id === 'nick_launches:pricing') {
		return (
			matchNickLaunchesOfficialPricing(scalar) === null &&
			coerceToNickLaunchesOfficialPricing(scalar) === scalar.trim()
		);
	}
	if (id === 'alternativeto:license') {
		return (
			matchAlternativetoOfficialLicense(scalar) === null &&
			coerceToAlternativetoOfficialLicense(scalar) === scalar.trim()
		);
	}
	return false;
}
