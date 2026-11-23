import type {
	AutoLaunchProfileSnapshot,
	LaunchStepField,
	LaunchStepFieldFillMode,
} from '../browser-extension/pageAssist.js';
import type { BusinessProfileData } from './businessProfileData.js';
import { resolveProfilePathValue } from './listingProfileFingerprint.js';
import {
	readProfilePathRaw,
	resolveProfilePathArray,
} from './profileFieldCatalog.js';
import { richHtmlToPlainText } from './richHtmlNormalize.js';
import { isLegacyRandomAutoLaunchMediaBasename } from './profileMediaFileName.js';

export type NormalizedFieldValueKind = LaunchStepFieldFillMode;

/** Profile or on-page value normalized for display and compare (no DOM). */
export type NormalizedFieldValue = {
	kind: NormalizedFieldValueKind;
	/** Scalar text, URL, select label, rich HTML source, or boolean as `"true"` / `"false"`. */
	scalar?: string;
	/** Tag chips, file URL paths, or multi-file path lists. */
	items?: string[];
	present: boolean;
};

export type FieldSyncStatus =
	| 'match'
	| 'diff'
	| 'profile_empty'
	| 'form_empty'
	| 'both_empty';

export type CompareFieldRowOptions = {
	required?: boolean;
};

/** One destination field row for the extension compare rail. */
export type DirectoryFieldCompareRow = {
	fieldKey: string;
	syncStatus: FieldSyncStatus;
	showRequiredWarning: boolean;
	showDiffWarning: boolean;
	profileNorm: NormalizedFieldValue;
	formNorm: NormalizedFieldValue;
};

/** Resolve fill mode when older `extension_config` rows omit `fillMode` on logo/gallery fields. */
export function resolveLaunchFieldFillMode(field: LaunchStepField): LaunchStepFieldFillMode {
	if (field.fillMode) return field.fillMode;
	if (field.profilePath === 'logo_url') return 'file';
	if (field.profilePath.includes('gallery_urls')) return 'files';
	return 'text';
}

function effectiveFillMode(field: LaunchStepField): LaunchStepFieldFillMode {
	return resolveLaunchFieldFillMode(field);
}

function profileDataFromSnapshot(snapshot: AutoLaunchProfileSnapshot): BusinessProfileData {
	return snapshot.profile_data as BusinessProfileData;
}

/** Compare-rail label for `logo_url` (persisted `logo_label`, else storage basename, else `Logo`). */
export function resolveLogoDisplayName(snapshot: AutoLaunchProfileSnapshot): string {
	const label = profileDataFromSnapshot(snapshot).logo_label?.trim() ?? '';
	if (label) return label;
	const logoUrl = snapshot.logo_url?.trim() ?? '';
	if (!logoUrl) return '';
	const base = mediaFileDisplayName(logoUrl);
	if (base && !isLegacyRandomAutoLaunchMediaBasename(base)) return base;
	return 'Logo';
}

/** Friendly label for one gallery slot (explicit label, human basename, or `Screenshot {n}`). */
export function resolveGalleryDisplayLabelForSlot(
	url: string,
	index: number,
	explicitLabel?: string | null
): string {
	const label = explicitLabel?.trim();
	if (label) return label;
	const base = mediaFileDisplayName(url);
	if (base && !isLegacyRandomAutoLaunchMediaBasename(base)) return base;
	return `Screenshot ${index + 1}`;
}

/** Default `gallery_labels` for the composer when none are stored yet. */
export function inferGalleryDisplayLabelsForUrls(
	urls: string[],
	existing?: string[] | null
): string[] {
	return urls.map((url, index) =>
		resolveGalleryDisplayLabelForSlot(url, index, existing?.[index])
	);
}

/**
 * Display name per gallery slot, aligned to `profile_data.gallery_urls`.
 * Uses `gallery_labels` when set; otherwise storage basename; else `Screenshot {n}`.
 */
export function resolveGalleryDisplayNames(snapshot: AutoLaunchProfileSnapshot): string[] {
	const urls = resolveProfilePathArray(snapshot, 'profile_data.gallery_urls');
	if (urls.length === 0) return [];

	const labels = profileDataFromSnapshot(snapshot).gallery_labels;
	return urls.map((url, index) =>
		resolveGalleryDisplayLabelForSlot(url, index, labels?.[index])
	);
}

/** Compare rail / form column text for on-page file inputs (uses the same gallery/logo label rules). */
export function formatOnPageMediaDisplayForField(
	field: LaunchStepField,
	items: string[] | undefined,
	present: boolean
): string {
	if (!present) return '—';
	const profilePath = field.profilePath?.trim() ?? '';
	const list = items ?? [];

	if (resolveLaunchFieldFillMode(field) === 'files' && profilePath === 'profile_data.gallery_urls') {
		const labels = list.map((item, index) =>
			resolveGalleryDisplayLabelForSlot(item, index, null)
		);
		return labels.length > 0 ? labels.join(', ') : '—';
	}

	if (resolveLaunchFieldFillMode(field) === 'file' && profilePath === 'logo_url') {
		const raw = list[0] ?? '';
		if (raw === 'uploaded-image') return 'File selected';
		const base = mediaFileDisplayName(raw);
		if (base && !isLegacyRandomAutoLaunchMediaBasename(base)) return base;
		return base || 'File selected';
	}

	if (field.fillMode === 'files') {
		const labels = list.map((item) => mediaFileDisplayName(item) || item).filter(Boolean);
		return labels.length > 0 ? labels.join(', ') : '—';
	}
	if (field.fillMode === 'file') {
		const label = list[0] ? mediaFileDisplayName(list[0]) : '';
		return label || (present ? 'File selected' : '—');
	}

	return list.join(', ') || '—';
}

/** Basename for logo / gallery paths or URLs in the compare rail. */
export function mediaFileDisplayName(pathOrUrl: string): string {
	const trimmed = pathOrUrl.trim();
	if (!trimmed) return '';
	if (/^https?:\/\//i.test(trimmed)) {
		try {
			const url = new URL(trimmed);
			const segment = url.pathname.split('/').filter(Boolean).pop();
			if (segment) return segment.split('?')[0] ?? segment;
		} catch {
			/* fall through */
		}
	}
	const segment = trimmed.split('/').filter(Boolean).pop() ?? trimmed;
	return segment.split('?')[0] ?? segment;
}

function collapseWhitespace(text: string): string {
	return text.trim().replace(/\s+/g, ' ');
}

function normalizeBooleanScalar(raw: unknown): string | null {
	if (raw === null || raw === undefined) return null;
	if (typeof raw === 'boolean') return raw ? 'true' : 'false';
	if (typeof raw === 'number') return raw !== 0 ? 'true' : 'false';
	if (typeof raw === 'string') {
		const lowered = raw.trim().toLowerCase();
		if (['true', '1', 'yes', 'on'].includes(lowered)) return 'true';
		if (['false', '0', 'no', 'off', ''].includes(lowered)) return 'false';
		return lowered;
	}
	return null;
}

function compareStringSet(a: string[], b: string[]): boolean {
	const norm = (items: string[]) =>
		[...new Set(items.map((entry) => entry.trim().toLowerCase()).filter(Boolean))].sort();
	const left = norm(a);
	const right = norm(b);
	if (left.length !== right.length) return false;
	return left.every((entry, index) => entry === right[index]);
}

function scalarForCompare(value: NormalizedFieldValue, fillMode: LaunchStepFieldFillMode): string {
	const raw = value.scalar ?? '';
	if (fillMode === 'rich_html') return collapseWhitespace(richHtmlToPlainText(raw));
	const collapsed = collapseWhitespace(raw);
	if (fillMode === 'select') return collapsed.toLowerCase();
	return collapsed;
}

/**
 * Whether two normalized values should be treated as in sync for `fillMode`
 * (case/whitespace/order rules per control type).
 */
export function normalizeForCompare(
	a: NormalizedFieldValue,
	b: NormalizedFieldValue,
	fillMode: LaunchStepFieldFillMode
): boolean {
	if (!a.present && !b.present) return true;

	switch (fillMode) {
		case 'tags':
		case 'checkbox_group':
		case 'files':
			return compareStringSet(a.items ?? [], b.items ?? []);
		case 'file':
			return a.present === b.present;
		case 'boolean': {
			const left = a.scalar === 'true';
			const right = b.scalar === 'true';
			return left === right;
		}
		case 'rich_html':
		case 'text':
		case 'select':
			return scalarForCompare(a, fillMode) === scalarForCompare(b, fillMode);
		default:
			return scalarForCompare(a, fillMode) === scalarForCompare(b, fillMode);
	}
}

/** Build the profile-side normalized value for a launch step field. */
export function normalizeProfileValue(
	snapshot: AutoLaunchProfileSnapshot,
	field: LaunchStepField
): NormalizedFieldValue {
	const kind = effectiveFillMode(field);

	switch (kind) {
		case 'tags':
		case 'checkbox_group': {
			const joined = resolveProfilePathValue(snapshot, field.profilePath);
			const items = joined
				? joined
						.split(',')
						.map((part) => part.trim())
						.filter(Boolean)
				: resolveProfilePathArray(snapshot, field.profilePath);
			return { kind, items, present: items.length > 0 };
		}
		case 'boolean': {
			const raw = readProfilePathRaw(snapshot, field.profilePath);
			const scalar = normalizeBooleanScalar(raw);
			return {
				kind,
				scalar: scalar ?? undefined,
				present: scalar !== null,
			};
		}
		case 'file':
		case 'files': {
			const items = resolveProfilePathArray(snapshot, field.profilePath);
			return { kind, items, present: items.length > 0 };
		}
		default: {
			let scalar = resolveProfilePathValue(snapshot, field.profilePath);
			if (scalar && field.profilePath === 'description' && kind === 'text') {
				scalar = richHtmlToPlainText(scalar);
			}
			return {
				kind,
				scalar: scalar ?? undefined,
				present: scalar !== null,
			};
		}
	}
}

export function compareFieldRow(
	fieldKey: string,
	profileNorm: NormalizedFieldValue,
	formNorm: NormalizedFieldValue,
	opts: CompareFieldRowOptions = {}
): DirectoryFieldCompareRow {
	const fillMode = profileNorm.kind;
	const required = opts.required === true;
	const inSync = normalizeForCompare(profileNorm, formNorm, fillMode);

	let syncStatus: FieldSyncStatus;
	if (!profileNorm.present && !formNorm.present) {
		syncStatus = 'both_empty';
	} else if (!formNorm.present && profileNorm.present) {
		syncStatus = 'form_empty';
	} else if (!profileNorm.present && formNorm.present) {
		syncStatus = 'profile_empty';
	} else if (inSync) {
		syncStatus = 'match';
	} else {
		syncStatus = 'diff';
	}

	const showRequiredWarning = required && !formNorm.present;
	const showDiffWarning =
		syncStatus === 'diff' ||
		syncStatus === 'profile_empty' ||
		(profileNorm.present && formNorm.present && !inSync);

	return {
		fieldKey,
		syncStatus,
		showRequiredWarning,
		showDiffWarning,
		profileNorm,
		formNorm,
	};
}
