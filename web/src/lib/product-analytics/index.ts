import { httpGateway } from '$lib/core/index';
import type { TrackingConfig } from '$lib/product-analytics/Tracking.repository.svelte';
import { TrackingRepository } from '$lib/product-analytics/Tracking.repository.svelte';

const trackingConfig: TrackingConfig = {
	endpoints: {
		publicTrack: '/api/v1/company/t',
		userTrack: '/api/v1/users/t'
	}
};

export const trackingRepository = new TrackingRepository(httpGateway, trackingConfig);

export { ConversionTrackEvent, CONVERSION_TRACK_EVENT_NAMES } from '$lib/product-analytics/conversionTrackEvent';
export { fireProductEvent } from '$lib/product-analytics/fireEvent';
export { trackConversion, loadFacebookPixelScript } from '$lib/product-analytics/trackConversion';
export {
	isBillingEnabledForAnalytics,
	isFacebookPixelConfigured,
	isPostHogConfigured,
	POSTHOG_HOST,
	POSTHOG_KEY,
	FACEBOOK_PIXEL_ID
} from '$lib/product-analytics/constants/config';
export { initPostHog, capturePostHogPageview, identifyPostHogUser, capturePostHogEvent } from '$lib/product-analytics/posthog.client';
export { readStoredUtm } from '$lib/product-analytics/utm';
export { default as UtmAttribution } from '$lib/product-analytics/UtmAttribution.svelte';
export { default as PostHogPageview } from '$lib/product-analytics/PostHogPageview.svelte';
export { default as FacebookPixel } from '$lib/product-analytics/FacebookPixel.svelte';
