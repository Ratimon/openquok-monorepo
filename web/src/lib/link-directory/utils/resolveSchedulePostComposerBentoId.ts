import type { PublicChannelFeatureBentoId } from '$lib/content/constants/channels/catalog/feature-bento';

/** Map integration catalog identifiers to public channel landing slug (composer bentos use `{slug}-post-editor`). */
const INTEGRATION_ID_TO_CATALOG_SLUG: Record<string, string> = {
	'instagram-business': 'instagram',
	'instagram-standalone': 'instagram',
	'linkedin-page': 'linkedin'
};

/** Channels without a `{slug}-post-editor` bento — use closest composer showcase on `/channels/{slug}`. */
const COMPOSER_BENTO_BY_CATALOG_SLUG: Partial<Record<string, PublicChannelFeatureBentoId>> = {
	bluesky: 'bluesky-threads'
};

const POST_EDITOR_BENTO_BY_CATALOG_SLUG: Record<string, PublicChannelFeatureBentoId> = {
	facebook: 'facebook-post-editor',
	threads: 'threads-post-editor',
	instagram: 'instagram-post-editor',
	youtube: 'youtube-post-editor',
	tiktok: 'tiktok-post-editor',
	linkedin: 'linkedin-post-editor',
	x: 'x-post-editor',
	devto: 'devto-post-editor'
};

function catalogSlugForIntegration(integrationOrChannelSlug: string): string {
	const key = integrationOrChannelSlug.trim().toLowerCase();
	return INTEGRATION_ID_TO_CATALOG_SLUG[key] ?? key;
}

/**
 * Bento id for build-backlinks `schedule_post` draft/publish steps (OpenQuok composer mock).
 * Accepts OpenQuok channel slug from link-directory admin or integration `identifier`.
 * When adding a social provider, register the slug here — see `.cursor/rules/add-social-provider-integration.mdc` (Build Backlinks site guides).
 */
export function resolveSchedulePostComposerBentoId(
	channelSlug: string | null | undefined
): PublicChannelFeatureBentoId | undefined {
	const raw = channelSlug?.trim();
	if (!raw) return undefined;

	const catalogSlug = catalogSlugForIntegration(raw);
	const extra = COMPOSER_BENTO_BY_CATALOG_SLUG[catalogSlug];
	if (extra) return extra;

	return POST_EDITOR_BENTO_BY_CATALOG_SLUG[catalogSlug];
}
