import { OPENQUOK_HOSTED_WEB_ORIGIN } from '$lib/utils/hostedMarketingHref';

/** Static app icon used when creating a new OAuth app (see web/static). */
export const OAUTH_APP_DEFAULT_PROFILE_IMAGE_PATH = '/maskable_icon_512x512.png';

/**
 * Redirect URL for Openquok-hosted CLI device flow (web app callback).
 * @see web/src/content/docs/configuration-agent — Openquok production
 */
export const OPENQUOK_HOSTED_OAUTH_REDIRECT_URL = `${OPENQUOK_HOSTED_WEB_ORIGIN}/cli/device/callback`;
