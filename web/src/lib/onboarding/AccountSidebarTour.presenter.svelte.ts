class AccountSidebarTourPresenter {
	/** When true, the onboarding wizard is open—defer sidebar feature tours. */
	onboardingBlocksTours = $state(false);

	setOnboardingBlocksTours(block: boolean): void {
		if (this.onboardingBlocksTours === block) return;
		this.onboardingBlocksTours = block;
	}
}

export const accountSidebarTourPresenter = new AccountSidebarTourPresenter();
