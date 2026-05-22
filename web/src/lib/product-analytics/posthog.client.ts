import posthog from 'posthog-js';

import { isPostHogConfigured, POSTHOG_HOST, POSTHOG_KEY } from '$lib/product-analytics/constants/config';

let initialized = false;

export function initPostHog(): void {
	if (initialized || !isPostHogConfigured()) return;
	posthog.init(POSTHOG_KEY, {
		api_host: POSTHOG_HOST,
		person_profiles: 'identified_only',
		capture_pageview: false
	});
	initialized = true;
}

export function capturePostHogPageview(path?: string): void {
	if (!initialized) return;
	posthog.capture('$pageview', path ? { $current_url: path } : undefined);
}

export function identifyPostHogUser(user: {
	id: string;
	email?: string;
	name?: string;
}): void {
	if (!initialized || !user.id) return;
	posthog.identify(user.id, {
		email: user.email,
		name: user.name
	});
}

export function capturePostHogEvent(name: string, props?: Record<string, unknown>): void {
	if (!initialized) return;
	posthog.capture(name, props);
}
