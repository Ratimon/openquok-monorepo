import type { XLaunchProviderSettings, XReplySetting } from '$lib/ui/components/posts/providers/provider.types';

const REPLY_SETTING_VALUES = new Set<XReplySetting>([
	'following',
	'mentionedUsers',
	'subscribers',
	'verified'
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(source: Record<string, unknown>, ...keys: string[]): string {
	for (const key of keys) {
		const value = source[key];
		if (typeof value === 'string' && value.trim()) return value.trim();
	}
	return '';
}

function readBoolean(source: Record<string, unknown>, ...keys: string[]): boolean {
	for (const key of keys) {
		const value = source[key];
		if (value === true || value === 'true') return true;
		if (value === false || value === 'false') return false;
	}
	return false;
}

function normalizeReplySetting(raw: string): XReplySetting | undefined {
	const normalized = raw.trim() as XReplySetting;
	return REPLY_SETTING_VALUES.has(normalized) ? normalized : undefined;
}

/** Parses community URLs such as `https://x.com/i/communities/123456789`. */
export function parseXCommunityIdFromUrl(url: string): string | undefined {
	const trimmed = url.trim();
	if (!trimmed) return undefined;
	const match = trimmed.match(/\/communities\/(\d+)/i);
	if (match?.[1]) return match[1];
	if (/^\d+$/.test(trimmed)) return trimmed;
	return undefined;
}

function mergeXSettings(target: XLaunchProviderSettings, source: Record<string, unknown>): XLaunchProviderSettings {
	const who = readString(source, 'who_can_reply_post', 'whoCanReplyPost');
	const normalizedWho = who ? normalizeReplySetting(who) : undefined;
	if (normalizedWho) target.whoCanReplyPost = normalizedWho;

	const communityUrl =
		readString(source, 'community', 'community_url', 'communityUrl') ||
		readString(source, 'community_id', 'communityId');
	if (communityUrl) target.communityUrl = communityUrl;

	if (readBoolean(source, 'made_with_ai', 'madeWithAi')) target.madeWithAi = true;
	if (readBoolean(source, 'paid_partnership', 'paidPartnership')) target.paidPartnership = true;

	if (source.enabled === true || source.enabled === 'true') target.enabled = true;
	if (source.enabled === false || source.enabled === 'false') target.enabled = false;
	const message = readString(source, 'message');
	if (message) target.message = message;

	return target;
}

/** Reads X compose settings from flat CLI keys and nested `x` bucket. */
export function readXLaunchSettings(settings: Record<string, unknown>): XLaunchProviderSettings {
	const out: XLaunchProviderSettings = {};
	mergeXSettings(out, settings);

	const xBucket = (settings as { x?: Record<string, unknown> }).x;
	if (isPlainObject(xBucket)) {
		mergeXSettings(out, xBucket);
	}

	return out;
}
