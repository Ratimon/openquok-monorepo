import { autoLaunchRepository } from '$lib/auto-launch';
import { protectedHomePagePresenter } from '$lib/area-protected';

export type CreateBusinessProfileResult =
	| {
			ok: true;
			integrationCustomerId: string;
			name: string;
			productProfileId: string;
	  }
	| { ok: false; error: string };

/**
 * Creates a workspace business profile (channel group + product profile) via the auto-launch API.
 */
export async function createBusinessProfile(
	organizationId: string,
	name: string
): Promise<CreateBusinessProfileResult> {
	const trimmed = name.trim();
	if (!trimmed) {
		return { ok: false, error: 'Business profile name is required.' };
	}

	const created = await autoLaunchRepository.createProfile({
		organizationId,
		name: trimmed,
		profileData: {}
	});
	if (!created.ok) {
		return { ok: false, error: created.error };
	}

	const customerId = created.profile.integrationCustomerId;
	if (!customerId) {
		return { ok: false, error: 'Could not link business profile to a channel group.' };
	}

	await protectedHomePagePresenter.loadChannelGroups();

	return {
		ok: true,
		integrationCustomerId: customerId,
		name: created.profile.name,
		productProfileId: created.profile.id
	};
}
