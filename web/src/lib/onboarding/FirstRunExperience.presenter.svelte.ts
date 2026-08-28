import { accountSidebarTourPresenter } from '$lib/onboarding/AccountSidebarTour.presenter.svelte';

/**
 * Coordinates blocking first-run modals (acquisition survey, onboarding wizard) so they
 * do not stack with sidebar product tours or each other.
 */
class FirstRunExperiencePresenter {
	acquisitionModalOpen = $state(false);
	onboardingModalOpen = $state(false);

	/** When true, defer onboarding wizard auto-open until acquisition completes. */
	blocksOnboarding = $derived(this.acquisitionModalOpen);

	setAcquisitionModalOpen(open: boolean): void {
		if (this.acquisitionModalOpen === open) return;
		this.acquisitionModalOpen = open;
		this.syncFirstRunBlocksTours();
	}

	setOnboardingModalOpen(open: boolean): void {
		if (this.onboardingModalOpen === open) return;
		this.onboardingModalOpen = open;
		this.syncFirstRunBlocksTours();
	}

	private syncFirstRunBlocksTours(): void {
		accountSidebarTourPresenter.setFirstRunBlocksTours(
			this.acquisitionModalOpen || this.onboardingModalOpen
		);
	}
}

export const firstRunExperiencePresenter = new FirstRunExperiencePresenter();
