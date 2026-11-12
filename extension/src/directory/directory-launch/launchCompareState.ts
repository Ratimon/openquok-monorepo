import type {
	AutoLaunchProfileSnapshot,
	DirectoryFieldCompareRow,
	LaunchStep,
	LaunchStepField,
	NormalizedFieldValue,
} from 'openquok-common';
import {
	compareFieldRow,
	applyLaunchFieldSelectCoercion,
	coerceUneedPricingType,
	fillableTagsForLaunchField,
	filterTagsForLaunchField,
	invalidProfileSelectForField,
	invalidProfileTagsForField,
	LAUNCH_FIELD_CATALOG_IDS,
	normalizeForCompare,
	profileSelectPresetsForField,
	normalizeProfileValue,
	profileScalarExceedsCap,
	resolveProfilePathArray,
	resolveLaunchFieldCatalogId,
	richHtmlToPlainText,
} from 'openquok-common';

import { readFormFieldValue } from './readFormField.js';
import { mergeMainProfileSocialData, resolveLaunchProfileScalar } from './profileValues.js';

/** One compare row passed to the step rail (profile vs on-page). */
export type StepRailCompareFieldRow = DirectoryFieldCompareRow & {
	label: string;
	touched: boolean;
	controlOnPage: boolean;
	profileDisplay: string;
	formDisplay: string;
	hasSourcePicker: boolean;
	profileSourcePaths: readonly string[];
	selectedSourcePaths: string[];
	/** Profile tag chips not in the destination catalog (Uneed). */
	invalidProfileTags?: string[];
	profileScalarTooLong?: boolean;
	/** Official select options for compare preset row (e.g. Uneed categories). */
	profileSelectPresets?: readonly string[];
	/** Member-picked select preset override (before fill). */
	selectedProfileSelectPreset?: string;
	profileSelectInvalid?: boolean;
	/** Profile has tags, but none match the destination catalog (fill is skipped). */
	profileTagsNotFillable?: boolean;
};

const EMPTY_FORM_NORM: NormalizedFieldValue = {
	kind: 'text',
	present: false,
};

function effectiveFillMode(field: LaunchStepField): NormalizedFieldValue['kind'] {
	return field.fillMode ?? 'text';
}

export function formatNormalizedDisplay(norm: NormalizedFieldValue): string {
	if (!norm.present) return '';
	const kind = norm.kind;
	if (kind === 'tags' || kind === 'files' || kind === 'checkbox_group') {
		const items = norm.items ?? [];
		return items.length > 0 ? items.join(', ') : '';
	}
	if (kind === 'file') {
		return norm.present ? 'File selected' : '';
	}
	if (kind === 'boolean') {
		return norm.scalar === 'true' ? 'Yes' : norm.scalar === 'false' ? 'No' : '';
	}
	if (kind === 'rich_html' && norm.scalar) {
		return richHtmlToPlainText(norm.scalar);
	}
	return norm.scalar ?? '';
}

/** Profile paths for tag compare/fill when the member has not toggled source chips. */
export function defaultTagProfilePathsForField(field: LaunchStepField): string[] {
	const paths: string[] = [];
	for (const path of field.profileSourcePaths ?? []) {
		const trimmed = path.trim();
		if (trimmed && !paths.includes(trimmed)) paths.push(trimmed);
	}
	const primary = field.profilePath?.trim();
	if (primary && !paths.includes(primary)) paths.push(primary);
	return paths;
}

/** Merge list-valued profile paths (Discovery sources) without catalog filtering or caps. */
export function collectRawItemsFromProfilePaths(
	snapshot: AutoLaunchProfileSnapshot,
	paths: readonly string[]
): string[] {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const path of paths) {
		for (const item of resolveProfilePathArray(snapshot, path)) {
			const key = item.trim();
			if (!key || seen.has(key)) continue;
			seen.add(key);
			out.push(key);
		}
	}
	return out;
}

/** Fillable values: merge paths, map to destination catalog, then apply `maxItems`. */
export function collectItemsFromProfilePaths(
	snapshot: AutoLaunchProfileSnapshot,
	paths: readonly string[],
	maxItems?: number,
	field?: LaunchStepField
): string[] {
	const merged = collectRawItemsFromProfilePaths(snapshot, paths);
	if (field) {
		return filterTagsForLaunchField(merged, field);
	}
	if (typeof maxItems === 'number' && maxItems > 0) {
		return merged.slice(0, maxItems);
	}
	return merged;
}

export function normalizedFromTagItems(items: string[]): NormalizedFieldValue {
	const trimmed = items.map((entry) => entry.trim()).filter(Boolean);
	return { kind: 'tags', items: trimmed, present: trimmed.length > 0 };
}

export function normalizedFromFillOverride(
	field: LaunchStepField,
	valuesOverride: string[]
): NormalizedFieldValue {
	const kind = effectiveFillMode(field);
	if (kind === 'tags' || kind === 'files' || kind === 'checkbox_group') {
		return normalizedFromTagItems(valuesOverride);
	}
	const scalar = valuesOverride.join(', ').trim();
	return { kind, scalar: scalar || undefined, present: scalar.length > 0 };
}

export function resolveEffectiveProfileNorm(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField,
	selectedSourcePaths: readonly string[],
	profileSelectPreset?: string,
	mainProfileSnapshot?: AutoLaunchProfileSnapshot | null
): NormalizedFieldValue {
	if (profileSelectPreset?.trim()) {
		const kind = effectiveFillMode(field);
		const scalar = applyLaunchFieldSelectCoercion(profileSelectPreset.trim(), field);
		return { kind, scalar, present: scalar.length > 0 };
	}
	if (
		field.fillMode === 'tags' &&
		field.profileSourcePaths?.length &&
		selectedSourcePaths.length > 0
	) {
		const items = collectRawItemsFromProfilePaths(snapshot, selectedSourcePaths);
		if (items.length > 0) {
			return normalizedFromTagItems(items);
		}
	}
	if (
		field.fillMode === 'tags' &&
		(field.profileSourcePaths?.length ?? 0) > 0 &&
		selectedSourcePaths.length === 0
	) {
		const items = collectRawItemsFromProfilePaths(
			snapshot,
			defaultTagProfilePathsForField(field)
		);
		if (items.length > 0) {
			return normalizedFromTagItems(items);
		}
	}
	const norm = normalizeProfileValue(
		mergeMainProfileSocialData(snapshot, mainProfileSnapshot),
		field
	);
	if (
		!norm.present &&
		(field.fillMode === 'text' || field.fillMode === undefined) &&
		field.profilePath
	) {
		const scalar = resolveLaunchProfileScalar(snapshot, field, mainProfileSnapshot);
		if (scalar?.trim()) {
			return { kind: 'text', scalar: scalar.trim(), present: true };
		}
	}
	if (norm.kind === 'select' && norm.scalar && field.selectCatalog) {
		const coerced = applyLaunchFieldSelectCoercion(norm.scalar, field);
		return { ...norm, scalar: coerced, present: coerced.length > 0 };
	}
	if (norm.kind === 'select' && norm.scalar && field.key === 'pricing_type') {
		const coerced = coerceUneedPricingType(norm.scalar);
		return { ...norm, scalar: coerced, present: coerced.length > 0 };
	}
	return norm;
}

export function isFieldTouched(
	formNorm: NormalizedFieldValue,
	baseline: NormalizedFieldValue | undefined,
	fillMode: LaunchStepField['fillMode']
): boolean {
	if (!baseline) return false;
	const mode = fillMode ?? 'text';
	return !normalizeForCompare(formNorm, baseline, mode);
}

export function buildCompareRowsForSteps(
	snapshot: AutoLaunchProfileSnapshot,
	steps: LaunchStep[],
	options: {
		fillBaselinesByField: ReadonlyMap<string, NormalizedFieldValue>;
		selectedSourcePathsByField: ReadonlyMap<string, readonly string[]>;
		profileSelectPresetByField?: ReadonlyMap<string, string>;
		mainProfileSnapshot?: AutoLaunchProfileSnapshot | null;
	}
): Record<string, StepRailCompareFieldRow[]> {
	const out: Record<string, StepRailCompareFieldRow[]> = {};

	for (const step of steps) {
		const rows: StepRailCompareFieldRow[] = [];
		for (const field of step.fields ?? []) {
			const selectedSourcePaths = options.selectedSourcePathsByField.get(field.key) ?? [];
			const selectedProfileSelectPreset =
				options.profileSelectPresetByField?.get(field.key);
			const profilePresets = profileSelectPresetsForField(field);
			const profileNorm = resolveEffectiveProfileNorm(
				snapshot,
				field,
				selectedSourcePaths,
				selectedProfileSelectPreset,
				options.mainProfileSnapshot
			);
			const read = readFormFieldValue(field);
			const controlOnPage = read !== null;
			const formNorm = read ?? { ...EMPTY_FORM_NORM, kind: effectiveFillMode(field) };
			const compare = compareFieldRow(field.key, profileNorm, formNorm, {
				required: field.required === true,
			});
			const baseline = options.fillBaselinesByField.get(field.key);
			const touched = isFieldTouched(formNorm, baseline, field.fillMode);
			const invalidProfileTags =
				(profileNorm.kind === 'tags' || profileNorm.kind === 'checkbox_group') &&
				profileNorm.items?.length
					? invalidProfileTagsForField(profileNorm.items, field)
					: undefined;
			const profileScalarTooLong =
				profileNorm.kind === 'text' && profileScalarExceedsCap(field, profileNorm.scalar);
			const profileSelectInvalid =
				!selectedProfileSelectPreset &&
				profileNorm.kind === 'select' &&
				invalidProfileSelectForField(profileNorm.scalar, field);
			const profileTagsNotFillable =
				resolveLaunchFieldCatalogId(field) === LAUNCH_FIELD_CATALOG_IDS['uneed:tags'] &&
				profileNorm.kind === 'tags' &&
				(profileNorm.items?.length ?? 0) > 0 &&
				fillableTagsForLaunchField(profileNorm.items ?? [], field).length === 0;

			rows.push({
				...compare,
				label: field.label,
				touched,
				controlOnPage,
				profileDisplay: formatNormalizedDisplay(profileNorm) || 'Not in profile',
				formDisplay: controlOnPage
					? formatNormalizedDisplay(formNorm) || '—'
					: 'Control not on page',
				hasSourcePicker:
					Boolean(field.profileSourcePaths?.length) || profilePresets.length > 0,
				profileSourcePaths: field.profileSourcePaths ?? [],
				selectedSourcePaths: [...selectedSourcePaths],
				profileSelectPresets: profilePresets.length > 0 ? profilePresets : undefined,
				selectedProfileSelectPreset: selectedProfileSelectPreset,
				profileSelectInvalid: profileSelectInvalid || undefined,
				invalidProfileTags:
					invalidProfileTags && invalidProfileTags.length > 0 ? invalidProfileTags : undefined,
				profileScalarTooLong: profileScalarTooLong || undefined,
				profileTagsNotFillable: profileTagsNotFillable || undefined,
			});
		}
		out[step.id] = rows;
	}

	return out;
}

/**
 * Re-read the live directory control when painting compare UI (SPA forms often hydrate after first paint).
 */
export function refreshCompareRowFromDom(
	row: StepRailCompareFieldRow,
	field: LaunchStepField,
	baseline: NormalizedFieldValue | undefined
): StepRailCompareFieldRow {
	const read = readFormFieldValue(field);
	if (read === null) {
		if (row.controlOnPage) return row;
		return {
			...row,
			controlOnPage: false,
			formDisplay: 'Control not on page',
			formNorm: { ...EMPTY_FORM_NORM, kind: effectiveFillMode(field) },
		};
	}
	const controlOnPage = true;
	const formNorm = read;
	const compare = compareFieldRow(field.key, row.profileNorm, formNorm, {
		required: field.required === true,
	});
	const touched = isFieldTouched(formNorm, baseline, field.fillMode);

	return {
		...row,
		...compare,
		touched,
		controlOnPage,
		formDisplay: controlOnPage
			? formatNormalizedDisplay(formNorm) || '—'
			: 'Control not on page',
		formNorm,
	};
}
