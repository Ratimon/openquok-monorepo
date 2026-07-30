import { resetProductTours } from '$lib/onboarding/productTourStorage';

class ProductTourResetPresenter {
	/** Bumped after each reset so account home can re-read localStorage. */
	revision = $state(0);
	/** When true, account home should open the onboarding wizard (after optional navigation). */
	shouldOpenWizard = $state(false);

	reset(workspaceId: string | null): void {
		resetProductTours(workspaceId);
		this.revision += 1;
		this.shouldOpenWizard = true;
	}

	clearOpenWizardRequest(): void {
		this.shouldOpenWizard = false;
	}

	/** Re-read localStorage-driven UI (e.g. after dismissing Getting started). */
	bumpRevision(): void {
		this.revision += 1;
	}
}

export const productTourResetPresenter = new ProductTourResetPresenter();
