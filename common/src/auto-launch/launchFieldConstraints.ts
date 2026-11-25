import type { LaunchStepField } from '../browser-extension/pageAssist.js';
import {
	applySelectCoercionForField,
	filterItemsForLaunchField,
	invalidProfileChoicesForField,
	invalidSelectForField,
	selectPresetsForField,
} from './destination-configs/fieldCatalogRegistry.js';

export function applyLaunchFieldScalarCap(value: string, field: LaunchStepField): string {
	const cap = field.maxScalarLength;
	if (typeof cap !== 'number' || cap <= 0 || value.length <= cap) return value;
	return value.slice(0, cap);
}

/** Normalize profile social X values to a plain handle when a directory field expects a username. */
export function coerceSocialXToUsername(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	if (!/^https?:\/\//i.test(trimmed) && !trimmed.includes('/')) {
		return trimmed.replace(/^@/, '');
	}
	try {
		const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
		const host = url.hostname.toLowerCase();
		if (host.includes('twitter.com') || host === 'x.com' || host.endsWith('.x.com')) {
			const handle = url.pathname.replace(/^\/+/, '').split('/')[0]?.trim();
			if (handle) return handle.replace(/^@/, '');
		}
	} catch {
		/* not a URL */
	}
	return trimmed.replace(/^@/, '');
}

export function coerceSocialGithubToUsername(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	if (!/^https?:\/\//i.test(trimmed) && !trimmed.includes('/')) {
		return trimmed.replace(/^@/, '');
	}
	try {
		const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
		const host = url.hostname.toLowerCase();
		if (host === 'github.com' || host.endsWith('.github.com')) {
			const segments = url.pathname.replace(/^\/+/, '').split('/').filter(Boolean);
			const handle = segments[0]?.trim();
			if (handle && handle !== 'orgs' && handle !== 'users') return handle.replace(/^@/, '');
		}
	} catch {
		/* not a URL */
	}
	return trimmed.replace(/^@/, '');
}

export function coerceSocialInstagramToUsername(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	if (!/^https?:\/\//i.test(trimmed) && !trimmed.includes('/')) {
		return trimmed.replace(/^@/, '');
	}
	try {
		const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
		const host = url.hostname.toLowerCase();
		if (host.includes('instagram.com')) {
			const handle = url.pathname.replace(/^\/+/, '').split('/')[0]?.trim();
			if (handle) return handle.replace(/^@/, '');
		}
	} catch {
		/* not a URL */
	}
	return trimmed.replace(/^@/, '');
}

export function coerceSocialYoutubeToUsername(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	if (!/^https?:\/\//i.test(trimmed) && !trimmed.includes('/')) {
		return trimmed.replace(/^@/, '');
	}
	try {
		const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
		const host = url.hostname.toLowerCase();
		if (host === 'youtube.com' || host === 'www.youtube.com' || host === 'youtu.be') {
			if (host === 'youtu.be') {
				const handle = url.pathname.replace(/^\/+/, '').split('/')[0]?.trim();
				if (handle) return handle.replace(/^@/, '');
			}
			const segment = url.pathname.replace(/^\/+/, '').split('/')[0]?.trim();
			if (segment?.startsWith('@')) return segment.slice(1);
			const parts = url.pathname.replace(/^\/+/, '').split('/');
			if (parts[0] === 'channel' && parts[1]) return parts[1].replace(/^@/, '');
			if (parts[0] === 'c' && parts[1]) return parts[1].replace(/^@/, '');
			if (parts[0] === 'user' && parts[1]) return parts[1].replace(/^@/, '');
		}
	} catch {
		/* not a URL */
	}
	return trimmed.replace(/^@/, '');
}

/** Normalize profile social X to a full URL when the directory form validates `type=url`. */
export function coerceSocialXToUrl(value: string): string {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	if (/^https?:\/\//i.test(trimmed)) {
		try {
			const url = new URL(trimmed);
			const host = url.hostname.toLowerCase();
			if (host.includes('twitter.com') || host === 'x.com' || host.endsWith('.x.com')) {
				const handle = url.pathname.replace(/^\/+/, '').split('/')[0]?.trim();
				if (handle) return `https://x.com/${handle.replace(/^@/, '')}`;
			}
		} catch {
			/* keep original */
		}
		return trimmed;
	}
	const handle = trimmed.replace(/^@/, '').split('/')[0]?.trim();
	if (!handle) return trimmed;
	return `https://x.com/${handle}`;
}

function coerceSocialFieldToUsername(field: LaunchStepField, value: string): string {
	const key = field.key;
	const path = field.profilePath;
	if (key === 'social_x' || path === 'profile_data.social_x') {
		return coerceSocialXToUsername(value);
	}
	if (key === 'social_github' || path === 'profile_data.social_github') {
		return coerceSocialGithubToUsername(value);
	}
	if (key === 'social_instagram' || path === 'profile_data.social_instagram') {
		return coerceSocialInstagramToUsername(value);
	}
	if (key === 'social_youtube' || path === 'profile_data.social_youtube') {
		return coerceSocialYoutubeToUsername(value);
	}
	return value;
}

/** Scalar transforms before DOM write (caps and select coercions are separate). */
export function applyLaunchFieldScalarCoercion(value: string, field: LaunchStepField): string {
	const wantsUsername = field.socialScalar === 'username';
	if (wantsUsername) {
		return coerceSocialFieldToUsername(field, value);
	}
	if (field.key === 'social_x' || field.profilePath === 'profile_data.social_x') {
		return coerceSocialXToUrl(value);
	}
	return value;
}

export function profileScalarExceedsCap(field: LaunchStepField, scalar: string | undefined): boolean {
	const cap = field.maxScalarLength;
	if (typeof cap !== 'number' || cap <= 0 || !scalar) return false;
	return scalar.length > cap;
}

export function filterTagsForLaunchField(items: readonly string[], field: LaunchStepField): string[] {
	let list = filterItemsForLaunchField(items, field);
	if (typeof field.maxItems === 'number' && field.maxItems > 0) {
		list = list.slice(0, field.maxItems);
	}
	return list;
}

/** Profile tag labels that will be written for this field (catalog + maxItems). */
export function fillableTagsForLaunchField(
	items: readonly string[],
	field: LaunchStepField
): string[] {
	return filterTagsForLaunchField(items, field);
}

export function invalidProfileTagsForField(
	items: readonly string[] | undefined,
	field: LaunchStepField
): string[] {
	return invalidProfileChoicesForField(items, field);
}

export function profileSelectPresetsForField(field: LaunchStepField): readonly string[] {
	return selectPresetsForField(field);
}

export function applyLaunchFieldSelectCoercion(value: string, field: LaunchStepField): string {
	return applySelectCoercionForField(value, field);
}

export function invalidProfileSelectForField(
	scalar: string | undefined,
	field: LaunchStepField
): boolean {
	return invalidSelectForField(scalar, field);
}
