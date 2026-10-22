import { autoLaunchRepository } from '$lib/auto-launch';
import { protectedHomePagePresenter } from '$lib/area-protected';

export type EnsureIntegrationCustomerResult =
	| { ok: true; integrationCustomerId: string; name: string }
	| { ok: false; error: string };

/**
 * Ensures a Products-tab profile has a workspace channel group id for linking social channels.
 */
export async function ensureIntegrationCustomerForProductProfile(
	organizationId: string,
	productProfileId: string
): Promise<EnsureIntegrationCustomerResult> {
	const profile = await autoLaunchRepository.getProfileById(productProfileId);
	if (!profile || profile.organizationId !== organizationId) {
		return { ok: false, error: 'Business profile not found.' };
	}

	if (profile.integrationCustomerId) {
		return {
			ok: true,
			integrationCustomerId: profile.integrationCustomerId,
			name: profile.name
		};
	}

	const trimmed = profile.name.trim();
	const existingGroup = protectedHomePagePresenter.channelGroupsVm.find(
		(g) => g.name.toLowerCase() === trimmed.toLowerCase()
	);
	if (existingGroup) {
		const linked = await autoLaunchRepository.updateProfile(productProfileId, {
			integrationCustomerId: existingGroup.id
		});
		if (!linked.ok) {
			return { ok: false, error: linked.error };
		}
		return {
			ok: true,
			integrationCustomerId: existingGroup.id,
			name: existingGroup.name
		};
	}

	const created = await protectedHomePagePresenter.createChannelGroup(trimmed);
	if (!created.ok) {
		return { ok: false, error: created.error };
	}

	const linked = await autoLaunchRepository.updateProfile(productProfileId, {
		integrationCustomerId: created.id
	});
	if (!linked.ok) {
		return { ok: false, error: linked.error };
	}

	return { ok: true, integrationCustomerId: created.id, name: created.name };
}
