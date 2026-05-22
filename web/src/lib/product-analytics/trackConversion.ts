import { browser } from '$app/environment';

import {
	CONVERSION_TRACK_EVENT_NAMES,
	type ConversionTrackEvent
} from '$lib/product-analytics/conversionTrackEvent';
import {
	FACEBOOK_PIXEL_ID,
	isFacebookPixelConfigured
} from '$lib/product-analytics/constants/config';
import { trackingRepository } from '$lib/product-analytics/index';

/**
 * Server-side Meta conversion + optional browser `fbq` when the pixel is configured.
 */
export async function trackConversion(
	event: ConversionTrackEvent,
	options?: {
		additional?: Record<string, unknown>;
		authenticated?: boolean;
	}
): Promise<void> {
	if (!isFacebookPixelConfigured()) {
		return;
	}

	const authenticated = options?.authenticated ?? false;

	try {
		const eventId = await trackingRepository.trackConversion({
			event,
			additional: options?.additional,
			authenticated
		});

		if (!browser || typeof window.fbq !== 'function') {
			return;
		}

		const eventName = CONVERSION_TRACK_EVENT_NAMES[event];
		window.fbq('track', eventName, options?.additional, eventId ? { eventID: eventId } : undefined);
	} catch (err) {
		console.error('[product-analytics] trackConversion failed', err);
	}
}

/** Load Meta Pixel base script once. */
export function loadFacebookPixelScript(): void {
	if (!browser || !isFacebookPixelConfigured()) return;
	if (typeof window.fbq === 'function') return;

	/* eslint-disable @typescript-eslint/no-explicit-any */
	const w = window as any;
	if (w._fbq) return;

	w.fbq = function fbq(...args: unknown[]) {
		if (w.fbq.callMethod) {
			w.fbq.callMethod.apply(w.fbq, args);
		} else {
			w.fbq.queue.push(args);
		}
	};
	if (!w._fbq) w._fbq = w.fbq;
	w.fbq.push = w.fbq;
	w.fbq.loaded = true;
	w.fbq.version = '2.0';
	w.fbq.queue = [];

	const script = document.createElement('script');
	script.async = true;
	script.src = 'https://connect.facebook.net/en_US/fbevents.js';
	const first = document.getElementsByTagName('script')[0];
	first?.parentNode?.insertBefore(script, first);
	w.fbq('init', FACEBOOK_PIXEL_ID);
	/* eslint-enable @typescript-eslint/no-explicit-any */
}
