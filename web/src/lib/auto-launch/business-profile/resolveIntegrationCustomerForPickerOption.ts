import type { BusinessProfilePickerOption } from '$lib/auto-launch/business-profile/buildBusinessProfilePickerOptions';
import { ensureIntegrationCustomerForProductProfile } from '$lib/auto-launch/business-profile/ensureIntegrationCustomerForProductProfile';

export type ResolveIntegrationCustomerResult =
	| { ok: true; integrationCustomerId: string; name: string }
	| { ok: false; error: string };

export async function resolveIntegrationCustomerForPickerOption(
	organizationId: string,
	option: BusinessProfilePickerOption
): Promise<ResolveIntegrationCustomerResult> {
	if (option.integrationCustomerId) {
		return {
			ok: true,
			integrationCustomerId: option.integrationCustomerId,
			name: option.name
		};
	}
	if (option.productProfileId) {
		return ensureIntegrationCustomerForProductProfile(organizationId, option.productProfileId);
	}
	return { ok: false, error: 'Invalid business profile.' };
}
