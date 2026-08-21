import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/** Catalog field for providers that connect with a pasted credential (not OAuth). */
export type IntegrationCatalogCustomField = {
	key: string;
	label: string;
	validation: string;
	type: 'text' | 'password';
	defaultValue?: string;
};

function isCustomFieldType(value: unknown): value is IntegrationCatalogCustomField['type'] {
	return value === 'text' || value === 'password';
}

/** Normalize catalog `customFields` (array of key/label/validation/type objects). */
export function normalizeCatalogCustomFields(raw: unknown): IntegrationCatalogCustomField[] {
	if (!Array.isArray(raw)) return [];
	const out: IntegrationCatalogCustomField[] = [];
	for (const item of raw) {
		if (!item || typeof item !== 'object') continue;
		const rec = item as Record<string, unknown>;
		if (typeof rec.key !== 'string' || !rec.key.trim()) continue;
		if (typeof rec.label !== 'string' || !rec.label.trim()) continue;
		if (typeof rec.validation !== 'string') continue;
		if (!isCustomFieldType(rec.type)) continue;
		const field: IntegrationCatalogCustomField = {
			key: rec.key.trim(),
			label: rec.label.trim(),
			validation: rec.validation,
			type: rec.type
		};
		if (typeof rec.defaultValue === 'string') {
			field.defaultValue = rec.defaultValue;
		}
		out.push(field);
	}
	return out;
}

export function catalogItemHasCustomFields(item: { customFields?: unknown } | null | undefined): boolean {
	return normalizeCatalogCustomFields(item?.customFields).length > 0;
}

/** Fallback field when the catalog has no customFields but authorize returned a non-URL state. */
export const DEFAULT_API_KEY_CUSTOM_FIELDS: IntegrationCatalogCustomField[] = [
	{ key: 'apiKey', label: 'API key', validation: '/^.{3,}$/', type: 'password' }
];

/** Parse a catalog validation string such as `/^.{3,}$/` into a RegExp. */
export function parseCatalogFieldValidation(validation: string): RegExp | null {
	const trimmed = validation.trim();
	const wrapped = trimmed.match(/^\/([\s\S]*)\/([a-z]*)$/);
	const source = wrapped ? wrapped[1] : trimmed;
	const flags = wrapped ? wrapped[2] : '';
	try {
		return new RegExp(source, flags);
	} catch {
		return null;
	}
}

export function validateCatalogCustomFieldValue(
	field: IntegrationCatalogCustomField,
	value: string
): string | null {
	const pattern = parseCatalogFieldValidation(field.validation);
	if (!pattern) return value.trim() ? null : `${field.label} is required.`;
	if (!pattern.test(value)) {
		return `${field.label} is invalid.`;
	}
	return null;
}

/** Encode credential fields as base64 JSON for `social-connect` `code`. */
export function encodeCredentialsConnectCode(values: Record<string, string>): string {
	const json = JSON.stringify(values);
	if (typeof btoa === 'function') {
		return btoa(json);
	}
	return Buffer.from(json, 'utf8').toString('base64');
}

/** True when `value` is an http(s) URL the browser can navigate to. */
export function isExternalHttpUrl(value: string): boolean {
	try {
		const parsed = new URL(value);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:';
	} catch {
		return false;
	}
}

export function timezoneOffsetMinutes(): string {
	const zone = dayjs.tz.guess() || 'UTC';
	return String(dayjs.tz(dayjs(), zone).utcOffset());
}
