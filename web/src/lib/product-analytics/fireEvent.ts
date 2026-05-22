import type { BasicUserAuthProgrammerModel } from '$lib/user-auth/Authentication.repository.svelte';
import {
	capturePostHogEvent,
	identifyPostHogUser
} from '$lib/product-analytics/posthog.client';
import { isBillingEnabledForAnalytics } from '$lib/product-analytics/constants/config';

/**
 * Product analytics event (PostHog). Skipped when Stripe billing is not configured
 * (self-hosted installs without checkout).
 */
export function fireProductEvent(
	name: string,
	props?: Record<string, unknown>,
	user?: BasicUserAuthProgrammerModel | null
): void {
	if (!isBillingEnabledForAnalytics()) {
		return;
	}

	if (user?.id) {
		identifyPostHogUser({
			id: user.id,
			email: user.email,
			name: user.fullName
		});
	}

	capturePostHogEvent(name, props);
}
